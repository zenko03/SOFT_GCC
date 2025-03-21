﻿using soft_carriere_competence.Application.Dtos.EvaluationsDto;
using soft_carriere_competence.Core.Entities.Evaluations;
using soft_carriere_competence.Core.Interface;
using soft_carriere_competence.Core.Interface.EvaluationInterface;
using soft_carriere_competence.Infrastructure.Data;
using soft_carriere_competence.Infrastructure.Repositories.EvaluationRepositories;
using soft_carriere_competence.Application.Services.EmailService;
using soft_carriere_competence.Core.Interface.AuthInterface;
using Microsoft.Extensions.Options;
using Microsoft.EntityFrameworkCore;


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
        private readonly IGenericRepository<Poste> _posteRepository;
        private readonly ApplicationDbContext _context;
        private readonly TemporaryAccountService _temporaryAccountService;


        private readonly IEmailService _emailService;
        private readonly ReminderSettings _reminderSettings;



        public EvaluationService(IEvaluationQuestionRepository questionRepository, IGenericRepository<EvaluationType> evaluationType,
            IGenericRepository<EvaluationQuestion> EvaluationQuestion, IGenericRepository<Evaluation> _evaluation,
            IGenericRepository<EvaluationQuestionnaire> _evaluationQuestionnaire, IGenericRepository<TrainingSuggestion> _trainingSuggestions,
            IGenericRepository<User> userRepository,
            IEmailService emailService,
            IOptions<ReminderSettings> reminderSettings,
            IGenericRepository<Poste> poste,
            ApplicationDbContext context,
            TemporaryAccountService temporaryAccountService

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
            _reminderSettings = reminderSettings.Value; // Get the configured value
            _posteRepository = poste;
            _context = context;
            _temporaryAccountService = temporaryAccountService;

        }

        // Create a new evaluation question
        public async Task<bool> CreateEvaluationQuestionAsync(EvaluationQuestion question)
        {
            if (question == null) throw new ArgumentNullException(nameof(question));
            await _evaluationQuestion.CreateAsync(question);
            return true;
        }

        // Get all evaluation questions
        public async Task<IEnumerable<EvaluationQuestion>> GetAllEvaluationQuestionsAsync()
        {
            return await _context.evaluationQuestions.Include(p => p.poste).Include(et => et.EvaluationType).ToListAsync();
        }
        // Get a specific evaluation question by ID
        public async Task<EvaluationQuestion> GetEvaluationQuestionByIdAsync(int id)
        {
            return await _evaluationQuestion.GetByIdAsync(id);
        }
        // Update an existing evaluation question
        public async Task<bool> UpdateEvaluationQuestionAsync(EvaluationQuestion question)
        {
            if (question == null) throw new ArgumentNullException(nameof(question));
            await _evaluationQuestion.UpdateAsync(question);
            return true;
        }

        // Delete an evaluation question
        public async Task<bool> DeleteEvaluationQuestionAsync(int id)
        {
            var question = await _evaluationQuestion.GetByIdAsync(id);
            if (question == null) return false; // Not found

            await _evaluationQuestion.DeleteAsync(question);
            return true;
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


        public async Task<int> CreateEvaluationAsync(int userId, int evaluationTypeId, List<int> supervisorIds, DateTime startDate, DateTime endDate)
        {
            var newEvaluation = new Evaluation
            {
                UserId = userId,
                EvaluationTypeId = evaluationTypeId,
                StartDate = startDate,
                EndDate = endDate,
                OverallScore = 0,
                Comments = null,
                state = 10 // Actif
            };

            await _evaluationRepository.CreateAsync(newEvaluation);

            // Ajouter les superviseurs dans la table EvaluationSupervisors
            foreach (var supervisorId in supervisorIds)
            {
                var evaluationSupervisor = new EvaluationSupervisors
                {
                    EvaluationId = newEvaluation.EvaluationId,
                    SupervisorId = supervisorId
                };
                await _context.EvaluationSupervisors.AddAsync(evaluationSupervisor);
            }
            await _context.SaveChangesAsync();

            // Récupérer l'utilisateur
            var user = await _userRepository.GetByIdAsync(userId);

            // Créer un compte temporaire pour l'évaluation
            var tempAccount = await _temporaryAccountService.CreateTemporaryAccountAsync(userId, newEvaluation.EvaluationId);

            // Envoyer un email avec les identifiants temporaires
            await _emailService.SendEmailAsync(
                user.Email,
                "Planification évaluation",
                $"Vous avez une évaluation programmée du {startDate.ToShortDateString()} au {endDate.ToShortDateString()}.\n\n" +
                $"Voici vos identifiants temporaires pour accéder à votre évaluation :\n" +
                $"Login : {tempAccount.TempLogin}\n" +
                $"Mot de passe : {tempAccount.TempPassword}\n\n" +
                $"Ces identifiants ne seront valides qu'à partir du {startDate.ToShortDateString()}.\n" +
                $"Lien pour vous connecter : https://votre-application.com/evaluation-login"
            );

            return newEvaluation.EvaluationId;
        }

        public async Task<bool> CreateTrainingSuggestionAsync(TrainingSuggestion suggestion)
        {
            if (suggestion == null) throw new ArgumentNullException(nameof(suggestion));

            await _trainingSuggestionsRepository.CreateAsync(suggestion);
            return true;
        }

        //public async Task<int> rappelerEvaluation(int evaluation_id)
        //{
        //    try
        //    {
        //        var evaluation = await _evaluationRepository.GetByIdAsync(evaluation_id);
        //        int idUser = evaluation.UserId;
        //        var user = await _userRepository.GetByIdAsync(idUser);
        //        await _emailService.SendEmailAsync(user.Email, "Rappel évaluation",
        //            $"Pour rappel , vous avez une évaluation le : {evaluation.StartDate} au {evaluation.EndDate}");
        //    }
        //    catch (Exception e)
        //    {
        //        return 0;
        //    }
        //    return 1;
        //}



        // Method to send reminder emails for evaluations that are due
        public async Task SendAutomaticRemindersAsync()
        {
            var upcomingEvaluations = await GetUpcomingEvaluationsAsync();

            foreach (var evaluation in upcomingEvaluations)
            {
                await SendReminderEmailAsync(evaluation.UserId, evaluation.StartDate);
            }
        }


        // Method to get evaluations that are due for reminders (e.g., 2 days before the evaluation date)
        public async Task<List<Evaluation>> GetUpcomingEvaluationsAsync()
        {
            var today = DateTime.UtcNow;
            var reminderDate = today.AddDays(_reminderSettings.DaysBefore); // Use the configured days before

            var evaluations = await _evaluationRepository.GetAllAsync();
            return evaluations.Where(e => e.StartDate.Date == reminderDate.Date).ToList();
        }

        // Method to send a reminder email to the user
        public async Task SendReminderEmailAsync(int userId, DateTime evaluationDate)
        {
            var user = await _userRepository.GetByIdAsync(userId);
            if (user == null) return;

            // Récupérer l'évaluation en cours pour cet utilisateur
            var evaluation = await _evaluationRepository.FindAsync(e =>
                e.UserId == userId &&
                e.StartDate == evaluationDate &&
                e.state == 10);

            if (evaluation == null || !evaluation.Any()) return;

            var currentEvaluation = evaluation.First();

            // Récupérer le compte temporaire existant ou en créer un nouveau
            var tempAccount = await _context.temporaryAccounts
                .FirstOrDefaultAsync(ta =>
                    ta.UserId == userId &&
                    ta.Evaluations_id == currentEvaluation.EvaluationId);

            if (tempAccount == null)
            {
                // Si pas de compte existant, en créer un nouveau
                tempAccount = await _temporaryAccountService.CreateTemporaryAccountAsync(userId, currentEvaluation.EvaluationId);
            }

            // Envoyer l'email de rappel avec les identifiants
            await _emailService.SendEmailAsync(
                user.Email,
                "Rappel d'évaluation",
                $"Ceci est un rappel que vous avez une évaluation prévue le {evaluationDate.ToShortDateString()}.\n\n" +
                $"Voici vos identifiants temporaires pour accéder à votre évaluation :\n" +
                $"Login : {tempAccount.TempLogin}\n" +
                $"Mot de passe : {tempAccount.TempPassword}\n\n" +
                $"Ces identifiants ne seront valides qu'à partir du {currentEvaluation.StartDate.ToShortDateString()}.\n" +
                $"Lien pour vous connecter : http://localhost:5173/EvaluationLogin"
            );
        }

        // Existing rappelerEvaluation method (if needed for manual reminders)
        public async Task<int> rappelerEvaluation(int evaluationId)
        {
            try
            {
                var evaluation = await _evaluationRepository.GetByIdAsync(evaluationId);
                if (evaluation == null) return 0; // Evaluation not found

                int userId = evaluation.UserId;
                await SendReminderEmailAsync(userId, evaluation.StartDate);
            }
            catch (Exception)
            {
                return 0; // Error occurred
            }
            return 1; // Success
        }

        public async Task<IEnumerable<Poste>> GetPostesAsync()
        {
            return await _posteRepository.GetAllAsync(); // Assuming you have a repository for posts
        }

        //METHOD FOR CRUD TRAINING SUGGESTIONS
        // Get all training suggestions
        public async Task<IEnumerable<TrainingSuggestion>> GetAllTrainingSuggestionsAsync()
        {
            return await _context.TrainingSuggestions
                .Include(ts => ts.evaluationType)
                .Include(ts => ts.evaluationQuestion)
                .ToListAsync();
        }

        // Get a specific training suggestion by ID
        public async Task<TrainingSuggestion> GetTrainingSuggestionByIdAsync(int id)
        {
            return await _context.TrainingSuggestions
                .Include(ts => ts.evaluationType)
                .Include(ts => ts.evaluationQuestion)
                .FirstOrDefaultAsync(ts => ts.TrainingSuggestionId == id);
        }

        // Update an existing training suggestion
        public async Task<bool> UpdateTrainingSuggestionAsync(TrainingSuggestion suggestion)
        {
            if (suggestion == null) throw new ArgumentNullException(nameof(suggestion));

            var existingSuggestion = await _trainingSuggestionsRepository.GetByIdAsync(suggestion.TrainingSuggestionId);
            if (existingSuggestion == null) return false; // Not found

            existingSuggestion.evaluationTypeId = suggestion.evaluationTypeId;
            existingSuggestion.questionId = suggestion.questionId;
            existingSuggestion.Training = suggestion.Training;
            existingSuggestion.Details = suggestion.Details;
            existingSuggestion.scoreThreshold = suggestion.scoreThreshold;
            existingSuggestion.state = suggestion.state;

            await _trainingSuggestionsRepository.UpdateAsync(existingSuggestion);
            return true;
        }

        // Delete a training suggestion
        public async Task<bool> DeleteTrainingSuggestionAsync(int id)
        {
            var suggestion = await _trainingSuggestionsRepository.GetByIdAsync(id);
            if (suggestion == null) return false; // Not found

            await _trainingSuggestionsRepository.DeleteAsync(suggestion);
            return true;
        }

        // Get paginated training suggestions
        public async Task<(IEnumerable<TrainingSuggestion> Items, int TotalPages)> GetPaginatedTrainingSuggestionsAsync(int pageNumber, int pageSize)
        {
            // Utilisez la méthode de pagination de votre repository
            var items = _trainingSuggestionsRepository.GetPage(pageNumber, pageSize, "evaluationType,evaluationQuestion");

            // Obtenez le nombre total de pages
            var totalPages = _trainingSuggestionsRepository.GetTotalPages(pageSize);

            return (items, totalPages);
        }

        // Get paginated evaluation questions
        public async Task<(IEnumerable<EvaluationQuestion> Items, int TotalPages)> GetPaginatedEvaluationQuestionsAsync(int pageNumber, int pageSize)
        {
            // Utilisez la méthode de pagination de votre repository
            var items = _evaluationQuestion.GetPage(pageNumber, pageSize, "EvaluationType,poste");

            // Obtenez le nombre total de pages
            var totalPages = _evaluationQuestion.GetTotalPages(pageSize);

            return (items, totalPages);
        }
    }


}
