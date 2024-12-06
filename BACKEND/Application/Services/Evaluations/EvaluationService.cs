using soft_carriere_competence.Core.Entities.Evaluations;
using soft_carriere_competence.Core.Interface;
using soft_carriere_competence.Core.Interface.EvaluationInterface;
using soft_carriere_competence.Infrastructure.Data;

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




        public EvaluationService(IEvaluationQuestionRepository questionRepository, IGenericRepository<EvaluationType> evaluationType,
            IGenericRepository<EvaluationQuestion> EvaluationQuestion, IGenericRepository<Evaluation> _evaluation,
            IGenericRepository<EvaluationQuestionnaire> _evaluationQuestionnaire, IGenericRepository<TrainingSuggestion> _trainingSuggestions

            )
        {
            _questionRepository = questionRepository;
            _evaluationTypeRepository = evaluationType;
            _evaluationQuestion = EvaluationQuestion;
            _evaluationRepository = _evaluation;
            _trainingSuggestionsRepository = _trainingSuggestions;
            _evaluationQuestionnaireRepository = _evaluationQuestionnaire; 
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


        public async Task<List<TrainingSuggestion>> GetTrainingSuggestionsAsync(int evaluationId)
        {
            var evaluation = await _trainingSuggestionsRepository.GetByIdAsync(evaluationId);
            if (evaluation == null) throw new Exception($"Evaluation with ID {evaluationId} not found.");

            // Récupérer les suggestions liées
            var suggestions = await _trainingSuggestionsRepository.GetAllAsync();
            return suggestions.Where(s => s.EvaluationId == evaluationId && s.scoreThreshold >= evaluation.Evaluation.OverallScore).ToList();
        }

        public async Task<bool> ValidateEvaluationAsync(int evaluationId, bool isServiceApproved, bool isDgApproved, DateTime? serviceApprovalDate, DateTime? dgApprovalDate)
        {
            var evaluation = await _evaluationRepository.GetByIdAsync(evaluationId);
            if (evaluation == null) throw new Exception($"Evaluation with ID {evaluationId} not found.");

            evaluation.IsServiceApproved = isServiceApproved;
            evaluation.isDgApproved = isDgApproved;
            evaluation.serviceApprovalDate = serviceApprovalDate;
            evaluation.dgApprovalDate = dgApprovalDate;

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
            // Vérifier si l'évaluation existe
            var evaluation = await _evaluationRepository.GetByIdAsync(evaluationId);
            if (evaluation == null) throw new Exception($"Evaluation with ID {evaluationId} not found.");

            // Mettre à jour les données de l'évaluation
            evaluation.OverallScore = overallScore;
            evaluation.Comments = generalEvaluation;
            evaluation.ActionPlan = $"{strengths}\n{weaknesses}";

            await _evaluationRepository.UpdateAsync(evaluation);

            // Enregistrer les résultats des questions dans Evaluation_questionnaire
            foreach (var rating in ratings)
            {
                var questionnaire = new EvaluationQuestionnaire
                {
                    EvaluationId = evaluationId,
                    questionId = rating.Key,
                    Score = rating.Value,
                    state = 1 // Actif
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
                ActionPlan = null,
                state = 1 // Actif
            };

            await _evaluationRepository.CreateAsync(newEvaluation);
            return newEvaluation.EvaluationId; // Retourner l'ID généré
        }



    }
}
