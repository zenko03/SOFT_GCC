using soft_carriere_competence.Application.Dtos.EvaluationsDto;
using soft_carriere_competence.Core.Entities.Evaluations;
using soft_carriere_competence.Core.Interface;
using soft_carriere_competence.Core.Interface.EvaluationInterface;
using soft_carriere_competence.Infrastructure.Data;
using soft_carriere_competence.Infrastructure.Repositories.EvaluationRepositories;
using soft_carriere_competence.Application.Services.EmailService;
using soft_carriere_competence.Core.Interface.AuthInterface;


namespace soft_carriere_competence.Application.Services.Evaluations
{
    public class EvaluationService
    {
        private readonly IEvaluationQuestionRepository _questionRepository;
        private readonly IGenericRepository<EvaluationType> _evaluationTypeRepository;
        private readonly IGenericRepository<EvaluationQuestion> _evaluationQuestion;
        private readonly IGenericRepository<TrainingSuggestion> _trainingSuggestionsRepository;
        private readonly IGenericRepository<EvaluationQuestionnaire> _evaluationQuestionnaireRepository;
        private readonly IGenericRepository<Evaluation> _evaluationRepository;
        private readonly IGenericRepository<User> _userRepository;
        private readonly IEmailService _emailService; 
        
        
        public EvaluationService(IEvaluationQuestionRepository questionRepository, IGenericRepository<EvaluationType> evaluationType,
            IGenericRepository<EvaluationQuestion> EvaluationQuestion, IGenericRepository<Evaluation> _evaluation,
            IGenericRepository<EvaluationQuestionnaire> _evaluationQuestionnaire, IGenericRepository<TrainingSuggestion> _trainingSuggestions,
            IGenericRepository<User> userRepository,
            IEmailService emailService
            
            )
        {
            _questionRepository = questionRepository;
            _evaluationTypeRepository = evaluationType;
            _evaluationQuestion = EvaluationQuestion;
            _evaluationRepository = _evaluation;
            _trainingSuggestionsRepository = _trainingSuggestions;
            _evaluationQuestionnaireRepository = _evaluationQuestionnaire; 
            _userRepository = userRepository;
            _emailService = emailService;
        }
     
        public async Task<IEnumerable<EvaluationQuestion>> GetEvaluationQuestionsAsync(int evaluationTypeId, int postId)
        {
            return await _questionRepository.GetQuestionsByEvaluationTypeAndPostAsync(evaluationTypeId, postId);
        }

        public async Task<IEnumerable<EvaluationType>> GetEvaluationTypeAsync()
        {
            return await _evaluationTypeRepository.GetAllAsync();
        }

        public double CalculateAverageRating(Dictionary<int, int> ratings)
        {
            if (ratings == null || ratings.Count == 0)
                return 0;

            var total = ratings.Values.Sum();
            var count = ratings.Count;
            
            

            return (double)total / count;
        }


        public async Task<List<TrainingSuggestionResultDto>> GetTrainingSuggestionsByQuestionsAsync(Dictionary<int, int> ratings)
        {
            // 1. Récupérer toutes les suggestions de formation
            var suggestions = await _trainingSuggestionsRepository.GetAllAsync();

            // 2. Filtrer les suggestions en fonction des ratings
            var filteredSuggestions = suggestions
                .Where(s => ratings.ContainsKey(s.questionId) && ratings[s.questionId] < s.scoreThreshold)
                .ToList();

            if (!filteredSuggestions.Any())
                return new List<TrainingSuggestionResultDto>();

            // 3. Extraire les questionIds uniques des suggestions filtrées
            var questionIds = filteredSuggestions.Select(s => s.questionId).Distinct();

            // 4. Récupérer les questions associées depuis Evaluation_questions
            var questions = await _evaluationQuestion
                .FindAsync(q => questionIds.Contains(q.questiondId));

            // 5. Créer un dictionnaire pour un accès rapide aux questions
            var questionDictionary = questions
                .ToDictionary(q => q.questiondId, q => q.question);

            // 6. Construire le résultat final en associant suggestions et questions
            var result = filteredSuggestions.Select(suggestion => new TrainingSuggestionResultDto
            {
                Training = suggestion.Training,
                Details = suggestion.Details,
                Question = questionDictionary.ContainsKey(suggestion.questionId)
                            ? questionDictionary[suggestion.questionId]
                            : "Question introuvable"
            }).ToList();

            return result;
        }
        
        public async Task<bool> ValidateEvaluationAsync(int evaluationId, bool isServiceApproved, bool isDgApproved, DateTime? serviceApprovalDate, DateTime? dgApprovalDate)
        {
            var evaluation = await _evaluationRepository.GetByIdAsync(evaluationId);
            if (evaluation == null) throw new Exception($"Evaluation with ID {evaluationId} not found.");

            evaluation.IsServiceApproved = isServiceApproved;
            evaluation.isDgApproved = isDgApproved;
            evaluation.serviceApprovalDate = serviceApprovalDate;
            evaluation.dgApprovalDate = dgApprovalDate;
            evaluation.state= 20;

            await _evaluationRepository.UpdateAsync(evaluation);
            return true;
        }

        public async Task<bool> SaveEvaluationResultsAsync(
       int evaluationId,
       Dictionary<int, int> ratings,
       decimal overallScore,
       string strengths,
       string weaknesses,
       string generalEvaluation)
        {
            Console.WriteLine("tafiditra avant getbyidasync");

            var evaluation = await _evaluationRepository.GetByIdAsync(evaluationId);
            Console.WriteLine("tafiditra apres getbyidasync");

            if (evaluation == null) throw new Exception($"Evaluation with ID {evaluationId} not found.");

            // Enregistrer les informations globales de l'évaluation
            evaluation.OverallScore = overallScore;
            evaluation.Comments = generalEvaluation;
            evaluation.strengths = strengths;  // Colonne ajoutée
            evaluation.weaknesses = weaknesses; // Colonne ajoutée

            await _evaluationRepository.UpdateAsync(evaluation);

            // Enregistrer les résultats des questions dans Evaluation_questionnaire
            foreach (var rating in ratings)
            {
                var questionExists = await _questionRepository.ExistsAsync(rating.Key);
                if (!questionExists) throw new Exception($"Question with ID {rating.Key} not found.");

                var questionnaire = new EvaluationQuestionnaire
                {
                    EvaluationId = evaluationId,
                    questionId = rating.Key,
                    Score = rating.Value,
                    state = 10 // TERMINEE
                };
                await _evaluationQuestionnaireRepository.CreateAsync(questionnaire);
            }

            return true;
        }


        public async Task<int> CreateEvaluationAsync(int userId, int evaluationTypeId, int supervisorId, DateTime startDate, DateTime endDate)
        {
            
            var newEvaluation = new Evaluation
            {
                UserId = userId,
                EvaluationTypeId = evaluationTypeId,
                SupervisorId = supervisorId,
                StartDate = startDate,
                EndDate = endDate,
                OverallScore = 0, // Initialisé à 0, sera mis à jour avec les résultats
                Comments = null,
                state = 10 // Actif
            };
            await _evaluationRepository.CreateAsync(newEvaluation);
            var user = await _userRepository.GetByIdAsync(userId);
          
            await _emailService.SendEmailAsync(user.Email, "Planification évaluation",
                $"Vous avez une évaluation le : {startDate} au {endDate}");
            return newEvaluation.EvaluationId; // Retourner l'ID généré
        }

        public async Task<bool> CreateTrainingSuggestionAsync(TrainingSuggestion suggestion)
        {
            if (suggestion == null) throw new ArgumentNullException(nameof(suggestion));

            await _trainingSuggestionsRepository.CreateAsync(suggestion);
            return true;
        }

        public async Task<int> rappelerEvaluation(int evaluation_id)
        {
            try
            {
                var evaluation = await _evaluationRepository.GetByIdAsync(evaluation_id);
                int idUser = evaluation.UserId;
                var user = await _userRepository.GetByIdAsync(idUser);
                await _emailService.SendEmailAsync(user.Email, "Rappel évaluation",
                    $"Pour rappel , vous avez une évaluation le : {evaluation.StartDate} au {evaluation.EndDate}");
            }
            catch (Exception e)
            {
                return 0;
            }
            return 1;
        }


    }
}
