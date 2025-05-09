using Microsoft.EntityFrameworkCore;
using soft_carriere_competence.Application.Dtos.EvaluationsDto;
using soft_carriere_competence.Controllers.Evaluations;
using soft_carriere_competence.Core.Entities.Evaluations;
using soft_carriere_competence.Core.Interface;
using soft_carriere_competence.Infrastructure.Data;

namespace soft_carriere_competence.Application.Services.Evaluations
{
    public class EvaluationResponseService
    {
        private readonly ApplicationDbContext _context;
        private readonly IGenericRepository<EvaluationResponses> _responseRepository;
        
        private readonly IGenericRepository<Evaluation> _evaluationRepository;
        private readonly IGenericRepository<EvaluationQuestion> _questionRepository;

        public EvaluationResponseService(
            ApplicationDbContext context,
            IGenericRepository<EvaluationResponses> responseRepository,
            IGenericRepository<Evaluation> evaluationRepository,
            IGenericRepository<EvaluationQuestion> questionRepository)
        {
            _context = context;
            _responseRepository = responseRepository;
            _evaluationRepository = evaluationRepository;
            _questionRepository = questionRepository;
        }

        public async Task<EvaluationResponses> SaveResponseAsync(int evaluationId, EvaluationResponseDto responseDto)
        {
            // Vérifier si l'évaluation existe
            var evaluation = await _evaluationRepository.GetByIdAsync(evaluationId);
            if (evaluation == null)
                throw new Exception($"Évaluation avec l'ID {evaluationId} non trouvée");

            // Vérifier si la question existe
            var question = await _questionRepository.GetByIdAsync(responseDto.QuestionId);
            if (question == null)
                throw new Exception($"Question avec l'ID {responseDto.QuestionId} non trouvée");

            var response = new EvaluationResponses
            {
                EvaluationId = evaluationId,
                QuestionId = responseDto.QuestionId,
                ResponseType = responseDto.ResponseType,
                ResponseValue = responseDto.ResponseValue,
                TimeSpent = responseDto.TimeSpent,
                StartTime = responseDto.StartTime,
                EndTime = responseDto.EndTime,
                IsCorrect = responseDto.IsCorrect,
                State = 1 // Actif
            };

            await _responseRepository.CreateAsync(response);
            await _context.SaveChangesAsync();

            return response;
        }

        public async Task<List<EvaluationResponses>> GetResponsesAsync(int evaluationId)
        {
            return await _context.evaluationResponses
                .Include(r => r.Question)
                .Where(r => r.EvaluationId == evaluationId)
                .ToListAsync();
        }

        public async Task<EvaluationResponses> GetResponseAsync(int evaluationId, int questionId)
        {
            return await _context.evaluationResponses
                .Include(r => r.Question)
                .FirstOrDefaultAsync(r => r.EvaluationId == evaluationId && r.QuestionId == questionId);
        }

        public async Task<bool> UpdateResponseAsync(int responseId, EvaluationResponseDto responseDto)
        {
            var response = await _responseRepository.GetByIdAsync(responseId);
            if (response == null)
                throw new Exception($"Réponse avec l'ID {responseId} non trouvée");

            response.ResponseType = responseDto.ResponseType;
            response.ResponseValue = responseDto.ResponseValue;
            response.TimeSpent = responseDto.TimeSpent;
            response.EndTime = responseDto.EndTime;
            response.IsCorrect = responseDto.IsCorrect;

            await _responseRepository.UpdateAsync(response);
            await _context.SaveChangesAsync();

            return true;
        }

        public async Task<bool> DeleteResponseAsync(int responseId)
        {
            var response = await _responseRepository.GetByIdAsync(responseId);
            if (response == null)
                throw new Exception($"Réponse avec l'ID {responseId} non trouvée");

            await _responseRepository.DeleteAsync(response);
            await _context.SaveChangesAsync();

            return true;
        }

        // Nouvelles méthodes pour les options de questions
        public async Task<IEnumerable<EvaluationQuestionOptions>> GetQuestionOptionsAsync(int evaluationId)
        {
            // Récupérer les questions associées à l'évaluation
            var questions = await _context.evaluationSelectedQuestions
                .Where(esq => esq.EvaluationId == evaluationId)
                .Select(esq => esq.QuestionId)
                .ToListAsync();

            // Récupérer les options pour ces questions
            return await _context.evaluationQuestionOptions
                .Where(opt => questions.Contains(opt.QuestionId))
                .ToListAsync();
        }

        // Méthode pour sauvegarder la progression
        public async Task SaveProgressAsync(int evaluationId, EvaluationProgressDto progress)
        {
            var evaluationProgress = await _context.evaluationProgresses
                .FirstOrDefaultAsync(ep => ep.evaluationId == evaluationId);

            if (evaluationProgress == null)
            {
                evaluationProgress = new EvaluationProgress
                {
                    evaluationId = evaluationId,
                    userId = progress.UserId,
                    totalQuestions = progress.TotalQuestions,
                    answeredQuestions = progress.AnsweredQuestions,
                    progressPercentage = progress.ProgressPercentage,
                    lastUpdate = DateTime.UtcNow
                };
                await _context.evaluationProgresses.AddAsync(evaluationProgress);
            }
            else
            {
                evaluationProgress.answeredQuestions = progress.AnsweredQuestions;
                evaluationProgress.progressPercentage = progress.ProgressPercentage;
                evaluationProgress.lastUpdate = DateTime.UtcNow;
            }

            await _context.SaveChangesAsync();
        }

        // Méthode pour obtenir le temps restant
        public async Task<TimeSpan> GetTimeRemainingAsync(int evaluationId)
        {
            var evaluation = await _context.Evaluations.FindAsync(evaluationId);
            if (evaluation == null) throw new Exception("Évaluation non trouvée");

            var timeRemaining = evaluation.EndDate - DateTime.UtcNow;
            return timeRemaining > TimeSpan.Zero ? timeRemaining : TimeSpan.Zero;
        }

        public async Task<EvaluationResponses> UpdateProgressAsync(int evaluationId, int questionId, int timeSpent)
        {
            var response = await _context.evaluationResponses
                .FirstOrDefaultAsync(r => r.EvaluationId == evaluationId && r.QuestionId == questionId);

            if (response == null)
            {
                response = new EvaluationResponses
                {
                    EvaluationId = evaluationId,
                    QuestionId = questionId,
                    TimeSpent = timeSpent,
                    StartTime = DateTime.UtcNow,
                    EndTime = DateTime.UtcNow,
                    State = 1
                };
                await _responseRepository.CreateAsync(response);
            }
            else
            {
                response.TimeSpent = timeSpent;
                response.EndTime = DateTime.UtcNow;
                await _responseRepository.UpdateAsync(response);
            }

            await _context.SaveChangesAsync();
            return response;
        }

        public async Task<bool> IsResponseCorrect(int questionId, string responseValue)
        {
            // Récupérer les options de la question
            var correctOptions = await _context.evaluationQuestionOptions
                .Where(o => o.QuestionId == questionId && o.IsCorrect)
                .Select(o => o.OptionText)
                .ToListAsync();

            if (!correctOptions.Any())
                return false; // Si aucune option correcte n'est définie, la réponse est considérée comme incorrecte

            // Pour les questions QCM, vérifier si la réponse correspond à une option correcte
            return correctOptions.Contains(responseValue);
        }

        public async Task<bool> ProcessResponsesAfterSubmission(int evaluationId)
        {
            try
            {
                // Récupérer toutes les réponses de l'évaluation
                var responses = await _context.evaluationResponses
                    .Where(r => r.EvaluationId == evaluationId)
                    .ToListAsync();

                foreach (var response in responses)
                {
                    // Vérifier si la réponse est correcte
                    bool isCorrect = false;
                    if (response.ResponseType == "QCM")
                    {
                        isCorrect = await IsResponseCorrect(response.QuestionId, response.ResponseValue);
                    }
                    else if (response.ResponseType == "SCORE")
                    {
                        int score = int.Parse(response.ResponseValue);
                        isCorrect = score >= 3; // Score acceptable si >= 3 sur 5
                    }

                    // Mettre à jour le statut de la réponse
                    response.IsCorrect = isCorrect;
                    response.State = 10; // État TERMINEE
                }

                await _context.SaveChangesAsync();
                return true;
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Erreur lors du traitement des réponses: {ex.Message}");
                return false;
            }
        }
    }
}