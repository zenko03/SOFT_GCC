using Microsoft.EntityFrameworkCore;
using soft_carriere_competence.Core.Entities.crud_career;
using soft_carriere_competence.Application.Dtos.EvaluationsDto;
using soft_carriere_competence.Core.Entities.Evaluations;
using soft_carriere_competence.Core.Interface;
using soft_carriere_competence.Core.Interface.EvaluationInterface;
using soft_carriere_competence.Infrastructure.Data;
using soft_carriere_competence.Core.Interface.AuthInterface;
using Microsoft.Extensions.Options;

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
        private readonly IGenericRepository<Position> _posteRepository;
        private readonly ApplicationDbContext _context;
        private readonly TemporaryAccountService _temporaryAccountService;
        private readonly IEmailService _emailService;
        private readonly ReminderSettings _reminderSettings;
        private readonly EvaluationCompetenceService _competenceService;

        public EvaluationService(IEvaluationQuestionRepository questionRepository, IGenericRepository<EvaluationType> evaluationType,
            IGenericRepository<EvaluationQuestion> EvaluationQuestion, IGenericRepository<Evaluation> _evaluation,
            IGenericRepository<EvaluationQuestionnaire> _evaluationQuestionnaire, IGenericRepository<TrainingSuggestion> _trainingSuggestions,
            IGenericRepository<User> userRepository,
            IEmailService emailService,
            IOptions<ReminderSettings> reminderSettings,
            IGenericRepository<Position> poste,
            ApplicationDbContext context,
            TemporaryAccountService temporaryAccountService,
            EvaluationCompetenceService competenceService = null)
        {
            _questionRepository = questionRepository;
            _evaluationTypeRepository = evaluationType;
            _evaluationQuestion = EvaluationQuestion;
            _evaluationRepository = _evaluation;
            _trainingSuggestionsRepository = _trainingSuggestions;
            _evaluationQuestionnaireRepository = _evaluationQuestionnaire; 
            _userRepository = userRepository;
            _emailService = emailService;
            _reminderSettings = reminderSettings.Value;
            _posteRepository = poste;
            _context = context;
            _temporaryAccountService = temporaryAccountService;
            _competenceService = competenceService;
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
            return await _context.evaluationQuestions
                .Include(p => p.Position)
                .Include(et => et.EvaluationType)
                .ToListAsync();
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
            
            Console.WriteLine($"Debug: Mise à jour de la question avec ID {question.questionId}");
            Console.WriteLine($"Debug: Données reçues: {System.Text.Json.JsonSerializer.Serialize(question)}");
            
            try {
                // Récupérer la question existante pour conserver les relations
                var existingQuestion = await _context.evaluationQuestions
                    .Include(q => q.EvaluationType)
                    .Include(q => q.Position)
                    .Include(q => q.CompetenceLine)
                    .Include(q => q.ResponseType)
                    .FirstOrDefaultAsync(q => q.questionId == question.questionId);
                
                if (existingQuestion == null) {
                    Console.WriteLine($"Debug: Question avec ID {question.questionId} non trouvée");
                    return false;
                }
                
                // Mettre à jour uniquement les champs simples, pas les relations
                existingQuestion.question = question.question;
                existingQuestion.evaluationTypeId = question.evaluationTypeId;
                existingQuestion.positionId = question.positionId;
                existingQuestion.CompetenceLineId = question.CompetenceLineId;
                existingQuestion.ResponseTypeId = question.ResponseTypeId;
                existingQuestion.state = question.state;
                
                // Sauvegarder les modifications
                await _context.SaveChangesAsync();
                Console.WriteLine("Debug: Question mise à jour avec succès");
                return true;
            }
            catch (Exception ex) {
                Console.WriteLine($"Debug: Erreur lors de la mise à jour: {ex.Message}");
                Console.WriteLine($"Debug: Inner exception: {ex.InnerException?.Message}");
                throw; // Propager l'exception pour être gérée au niveau du contrôleur
            }
        }

        // Delete an evaluation question
        public async Task<bool> DeleteEvaluationQuestionAsync(int id)
        {
            var question = await _evaluationQuestion.GetByIdAsync(id);
            if (question == null) return false; // Not found

            await _evaluationQuestion.DeleteAsync(question);
            return true;
        }

        public async Task<IEnumerable<EvaluationQuestion>> GetEvaluationQuestionsAsync(int evaluationTypeId, int positionId)
        {
            return await _questionRepository.GetQuestionsByEvaluationTypeAndPostAsync(evaluationTypeId, positionId);
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
                .FindAsync(q => questionIds.Contains(q.questionId));

            // 5. Créer un dictionnaire pour un accès rapide aux questions
            var questionDictionary = questions
                .ToDictionary(q => q.questionId, q => q.question);

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
            evaluation.state = 20;

            await _evaluationRepository.UpdateAsync(evaluation);
            
            // Calculer et sauvegarder les résultats par compétence
            if (_competenceService != null)
            {
                try 
                {
                    Console.WriteLine("Appel du service de compétence pour l'évaluation " + evaluationId);
                    await _competenceService.CalculateAndSaveCompetenceResultsAsync(evaluationId);
                }
                catch (Exception ex)
                {
                    // Log l'erreur mais continue sans échouer la validation
                    Console.WriteLine($"Erreur lors du calcul et de la sauvegarde des résultats par compétence: {ex.Message}");
                    Console.WriteLine(ex.StackTrace);
                }
            }
            else
            {
                Console.WriteLine("Service de compétence non disponible - aucun calcul de résultats par compétence");
            }
            
            return true;
        }

        public async Task<bool> SaveEvaluationResultsAsync(
       int evaluationId,
       Dictionary<int, int> ratings,
       decimal overallScore,
       string strengths,
       string weaknesses,
            string generalEvaluation,
            List<MultiCriteriaRatingDto> detailedRatings = null)
        {
            var evaluation = await _evaluationRepository.GetByIdAsync(evaluationId);
            if (evaluation == null) throw new Exception($"Evaluation with ID {evaluationId} not found.");

            // Enregistrer les informations globales de l'évaluation
            evaluation.OverallScore = overallScore;
            evaluation.Comments = generalEvaluation;
            evaluation.strengths = strengths;
            evaluation.weaknesses = weaknesses;

            await _evaluationRepository.UpdateAsync(evaluation);

            // Liste des réponses existantes pour éviter les doublons
            var existingResponses = await _context.evaluationResponses
                .Where(r => r.EvaluationId == evaluationId)
                .ToListAsync();

            // Dictionnaire pour un accès rapide
            var existingResponsesDict = existingResponses
                .ToDictionary(r => r.QuestionId, r => r);

            // Pour chaque note
            foreach (var rating in ratings)
            {
                int questionId = rating.Key;
                int score = rating.Value;

                // Vérifier si la réponse existe déjà
                if (existingResponsesDict.TryGetValue(questionId, out var existingResponse))
                {
                    // Mettre à jour la réponse existante
                    existingResponse.ResponseValue = score.ToString();
                    existingResponse.EndTime = DateTime.UtcNow; // Utiliser EndTime comme date de modification
                    _context.evaluationResponses.Update(existingResponse);
                }
                else
                {
                    // Créer une nouvelle réponse
                    var newResponse = new EvaluationResponses
                    {
                        EvaluationId = evaluationId,
                        QuestionId = questionId,
                        ResponseValue = score.ToString(),
                        ResponseType = "SCORE",
                        CreatedAt = DateTime.UtcNow,
                        StartTime = DateTime.UtcNow,
                        EndTime = DateTime.UtcNow,
                        State = 10 // TERMINEE
                    };
                    await _context.evaluationResponses.AddAsync(newResponse);
                }
            }

            // Si des ratings détaillés sont fournis (pour les critères multiples)
            if (detailedRatings != null && detailedRatings.Count > 0)
            {
                foreach (var detailedRating in detailedRatings)
                {
                    if (detailedRating == null || detailedRating.QuestionId <= 0) continue;

                    int questionId = detailedRating.QuestionId;

                    // Calculer la note globale
                    detailedRating.OverallRating = detailedRating.CalculateOverallRating();

                    // Convertir en JSON
                    string jsonValue = System.Text.Json.JsonSerializer.Serialize(detailedRating);

                    // Vérifier si la réponse existe déjà
                    if (existingResponsesDict.TryGetValue(questionId, out var existingResponse))
                    {
                        // Mettre à jour la réponse existante
                        existingResponse.ResponseValue = jsonValue;
                        existingResponse.ResponseType = "MULTI_CRITERIA";
                        existingResponse.EndTime = DateTime.UtcNow; // Utiliser EndTime comme date de modification
                        _context.evaluationResponses.Update(existingResponse);
                    }
                    else
                    {
                        // Créer une nouvelle réponse
                        var newResponse = new EvaluationResponses
                {
                    EvaluationId = evaluationId,
                            QuestionId = questionId,
                            ResponseValue = jsonValue,
                            ResponseType = "MULTI_CRITERIA",
                            CreatedAt = DateTime.UtcNow,
                            StartTime = DateTime.UtcNow,
                            EndTime = DateTime.UtcNow,
                            State = 10 // TERMINEE
                        };
                        await _context.evaluationResponses.AddAsync(newResponse);
                    }
                }
            }

            await _context.SaveChangesAsync();
            
            // Calculer et sauvegarder les résultats par compétence
            try
            {
                // Utiliser l'instance injectée du service de compétence ici
                await _competenceService.CalculateAndSaveCompetenceResultsAsync(evaluationId);
            }
            catch (Exception ex)
            {
                // On log l'erreur mais on ne la propage pas pour ne pas bloquer l'enregistrement des résultats
                Console.WriteLine($"Erreur lors du calcul des résultats par compétence : {ex.Message}");
            }

            return true;
        }

        // Surcharge pour accepter le DTO complet
        public async Task<bool> SaveEvaluationResultsAsync(EvaluationResultsDto dto)
        {
            // Synchroniser les notes simples et détaillées si nécessaire
            if (dto.HasDetailedRatings())
            {
                dto.SynchronizeRatings();
            }
            
            return await SaveEvaluationResultsAsync(
                dto.EvaluationId,
                dto.Ratings,
                dto.OverallScore,
                dto.Strengths ?? string.Empty,
                dto.Weaknesses ?? string.Empty,
                dto.GeneralEvaluation ?? string.Empty,
                dto.DetailedRatings
            );
        }

        public async Task<int> CreateEvaluationAsync(
            int userId,
            int employeeId,
            int evaluationTypeId,
            List<int> supervisorIds,
            DateTime startDate,
            DateTime endDate,
            bool enableReminders = false)
        {
            using (var transaction = await _context.Database.BeginTransactionAsync())
            {
                try
                {
                    var employee = await _context.Users.FindAsync(employeeId);

                    // Créer une nouvelle évaluation
                    var newEvaluation = new Evaluation
                    {
                        EmployeeId = employeeId,
                        EvaluationTypeId = evaluationTypeId,
                        StartDate = startDate,
                        EndDate = endDate,
                        state = 10, // État "Planifié"
                        EnableReminders = enableReminders // Ajout du paramètre enableReminders
                    };

                    // Sauvegarder l'évaluation
                    await _evaluationRepository.CreateAsync(newEvaluation);
                    await _context.SaveChangesAsync();

                    Console.WriteLine($"Created evaluation with ID: {newEvaluation.EvaluationId}");

                    // Initialiser la progression
                    var progress = new EvaluationProgress
                    {
                        evaluationId = newEvaluation.EvaluationId,
                        employeeId = employeeId,
                        totalQuestions = 0, // Sera mis à jour lors de la sélection des questions
                        answeredQuestions = 0,
                        progressPercentage = 0,
                        lastUpdate = DateTime.UtcNow
                    };
                    await _context.evaluationProgresses.AddAsync(progress);
                    await _context.SaveChangesAsync();

                    // Créer les associations superviseur-évaluation
                    var evaluationSupervisors = supervisorIds.Select(supervisorId => new EvaluationSupervisors
                    {
                        EvaluationId = newEvaluation.EvaluationId,
                        SupervisorId = supervisorId
                    }).ToList();

                    // Ajouter toutes les associations en une seule fois
                    await _context.EvaluationSupervisors.AddRangeAsync(evaluationSupervisors);
                    await _context.SaveChangesAsync();

                    Console.WriteLine($"Added {evaluationSupervisors.Count} supervisors to evaluation {newEvaluation.EvaluationId}");

                    // Créer un compte temporaire pour l'employé
                    var tempAccount = await _temporaryAccountService.CreateTemporaryAccountAsync(
                        employeeId, 
                        newEvaluation.EvaluationId
                    );
                    
                    // Utiliser l'email de l'employé s'il est disponible
                    if (employee != null && !string.IsNullOrEmpty(employee.Email))
                    {
                        // Envoyer l'email de notification à l'employé
                        await _emailService.SendEmailAsync(
                            employee.Email,
                            "Planification évaluation",
                            $"Bonjour {employee.FirstName} {employee.LastName},<br><br>" +
                            $"Nous vous informons qu'une évaluation a été planifiée à votre attention.<br><br>" +
                            $"<strong>Période d'évaluation :</strong> Du {startDate.ToShortDateString()} au {endDate.ToShortDateString()}<br><br>" +
                            $"<div class='credentials'>" +
                            $"<strong>Vos identifiants de connexion :</strong><br>" +
                            $"<strong>Login :</strong> {tempAccount.TempLogin}<br>" +
                            $"<strong>Mot de passe :</strong> {tempAccount.TempPassword}<br>" +
                            $"</div><br>" +
                            $"Ces identifiants seront valides à partir du {startDate.ToShortDateString()}.<br><br>" +
                            $"<a href='http://localhost:5173/EvaluationLogin' class='button'>Accéder à l'évaluation</a><br><br>" +
                            $"Cordialement,<br>" +
                            $"L'équipe Gestion des Carrières et Compétences"
                        );
                    }

                    await transaction.CommitAsync();
                    return newEvaluation.EvaluationId;
                }
                catch (Exception ex)
                {
                    await transaction.RollbackAsync();
                    Console.WriteLine($"Error in CreateEvaluationAsync: {ex.Message}");
                    Console.WriteLine($"Inner exception: {ex.InnerException?.Message}");
                    Console.WriteLine($"Stack trace: {ex.StackTrace}");
                    throw;
                }
            }
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
            
            // Ne traiter que les évaluations avec reminders activés
            var evaluationsToRemind = upcomingEvaluations
                .Where(e => e.EnableReminders)
                .ToList();
        
            Console.WriteLine($"Sending reminders for {evaluationsToRemind.Count} evaluations (out of {upcomingEvaluations.Count} upcoming)");

            foreach (var evaluation in evaluationsToRemind)
            {
                await SendReminderEmailAsync(evaluation.EmployeeId, evaluation.StartDate);
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
                e.EmployeeId == userId &&
                e.StartDate == evaluationDate &&
                e.state == 10);

            if (evaluation == null || !evaluation.Any()) return;

            var currentEvaluation = evaluation.First();

            // Récupérer le compte temporaire existant ou en créer un nouveau
            var tempAccount = await _context.temporaryAccounts
                .FirstOrDefaultAsync(ta =>
                    ta.EmployeeId == userId &&
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
                $"Bonjour {user.FirstName} {user.LastName},<br><br>" +
                $"Ceci est un rappel que vous avez une évaluation prévue le {evaluationDate.ToShortDateString()}.<br><br>" +
                $"<div class='credentials'>" +
                $"<strong>Vos identifiants de connexion :</strong><br>" +
                $"<strong>Login :</strong> {tempAccount.TempLogin}<br>" +
                $"<strong>Mot de passe :</strong> {tempAccount.TempPassword}<br>" +
                $"</div><br>" +
                $"Ces identifiants ne seront valides qu'à partir du {currentEvaluation.StartDate.ToShortDateString()}.<br><br>" +
                $"<a href='http://localhost:5173/EvaluationLogin' class='button'>Accéder à l'évaluation</a><br><br>" +
                $"Cordialement,<br>" +
                $"L'équipe Gestion des Carrières et Compétences"
            );
        }

        // Existing rappelerEvaluation method (if needed for manual reminders)
        public async Task<int> rappelerEvaluation(int evaluationId)
        {
            try
            {
                var evaluation = await _evaluationRepository.GetByIdAsync(evaluationId);
                if (evaluation == null) return 0; // Evaluation not found

                int userId = evaluation.EmployeeId;
                await SendReminderEmailAsync(userId, evaluation.StartDate);
            }
            catch (Exception)
            {
                return 0; // Error occurred
            }
            return 1; // Success
        }

        public async Task<IEnumerable<Position>> GetPostesAsync()
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
            try
            {
                var totalItems = await _context.evaluationQuestions
                    .Where(q => q.state == 1) // Assurez-vous de ne renvoyer que les questions actives
                    .CountAsync();
                
                var totalPages = (int)Math.Ceiling(totalItems / (double)pageSize);
                
                var items = await _context.evaluationQuestions
                    .Where(q => q.state == 1)
                    .Include(q => q.Position)
                    .Include(q => q.EvaluationType)
                    .Include(q => q.CompetenceLine)
                    .Include(q => q.ResponseType)
                    .OrderByDescending(q => q.questionId) // Tri par ID décroissant pour avoir les plus récentes en premier
                    .Skip((pageNumber - 1) * pageSize)
                    .Take(pageSize)
                    .ToListAsync();

                return (items, totalPages);
            }
            catch (Exception ex)
            {
                // Log l'erreur pour le débogage
                Console.WriteLine($"Erreur dans GetPaginatedEvaluationQuestionsAsync: {ex.Message}");
                Console.WriteLine($"Stack trace: {ex.StackTrace}");
                
                throw new Exception($"Erreur lors de la récupération des questions paginées : {ex.Message}");
            }
        }

        public async Task<List<int>> CreateEvaluationWithSelectedQuestionsAsync(CreateEvaluationWithQuestionsDto dto)
        {
            var createdEvaluationIds = new List<int>();

            foreach (var employeeQuestion in dto.EmployeeQuestions)
            {
                // Créer l'évaluation
                var evaluationId = await CreateEvaluationAsync(
                    0, // UserId (not specified in this flow)
                    employeeQuestion.EmployeeId,
                    dto.EvaluationTypeId,
                    dto.SupervisorIds,
                    dto.StartDate,
                    dto.EndDate,
                    dto.EnableReminders // Ajouter le paramètre de rappel
                );

                // Ajouter les questions sélectionnées avec leurs compétences
                foreach (var question in employeeQuestion.SelectedQuestions)
                {
                    if (!question.CompetenceLineId.HasValue)
                    {
                        throw new Exception($"La question avec ID {question.QuestionId} n'a pas de ligne de compétence associée");
                    }

                    var selectedQuestion = new EvaluationSelectedQuestions
                    {
                        EvaluationId = evaluationId,
                        QuestionId = question.QuestionId,
                        CompetenceLineId = question.CompetenceLineId.Value
                    };
                    await _context.evaluationSelectedQuestions.AddAsync(selectedQuestion);
                }

                // Mettre à jour le nombre total de questions dans la progression
                var progress = await _context.evaluationProgresses
                    .FirstOrDefaultAsync(ep => ep.evaluationId == evaluationId);
                if (progress != null)
                {
                    progress.totalQuestions = employeeQuestion.SelectedQuestions.Count;
                    await _context.SaveChangesAsync();
                }

                createdEvaluationIds.Add(evaluationId);
            }

            await _context.SaveChangesAsync();
            return createdEvaluationIds;
        }

        private async Task<int> GetCompetenceLineIdForQuestion(int questionId)
        {
            var question = await _evaluationQuestion.GetByIdAsync(questionId);
            if (question == null)
                throw new Exception($"Question avec ID {questionId} non trouvée");
            if (!question.CompetenceLineId.HasValue)
                throw new Exception($"La question avec ID {questionId} n'a pas de ligne de compétence associée");
            return question.CompetenceLineId.Value;
        }

        public async Task<IEnumerable<EvaluationSelectedQuestions>> GetSelectedQuestionsAsync(int evaluationId)
        {
            return await _context.evaluationSelectedQuestions
                .Where(esq => esq.EvaluationId == evaluationId)
                .Include(esq => esq.SelectedQuestion)
                .Include(esq => esq.SelectedCompetenceLine)
                .ToListAsync();
        }

        public async Task<bool> AddSelectedQuestionAsync(int evaluationId, int questionId, int competenceLineId)
        {
            var selectedQuestion = new EvaluationSelectedQuestions
            {
                EvaluationId = evaluationId,
                QuestionId = questionId,
                CompetenceLineId = competenceLineId
            };

            await _context.evaluationSelectedQuestions.AddAsync(selectedQuestion);
            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<bool> RemoveSelectedQuestionAsync(int evaluationId, int questionId)
        {
            var selectedQuestion = await _context.evaluationSelectedQuestions
                .FirstOrDefaultAsync(esq => esq.EvaluationId == evaluationId && esq.QuestionId == questionId);

            if (selectedQuestion == null)
                return false;

            _context.evaluationSelectedQuestions.Remove(selectedQuestion);
            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<bool> UpdateSelectedQuestionAsync(int evaluationId, int questionId, int newCompetenceLineId)
        {
            var selectedQuestion = await _context.evaluationSelectedQuestions
                .FirstOrDefaultAsync(esq => esq.EvaluationId == evaluationId && esq.QuestionId == questionId);

            if (selectedQuestion == null)
                return false;

            selectedQuestion.CompetenceLineId = newCompetenceLineId;
            await _context.SaveChangesAsync();
            return true;
        }


        public async Task<(IEnumerable<EvaluationQuestion> Items, int TotalPages)> GetPaginatedEvaluationQuestionsByTypeAsync(int evaluationTypeId, int pageNumber, int pageSize)
        {
            try
            {
                var query = _context.evaluationQuestions
                    .Where(q => q.evaluationTypeId == evaluationTypeId);

                var totalItems = await query.CountAsync();
                var totalPages = (int)Math.Ceiling(totalItems / (double)pageSize);

                var items = await query
                    .Skip((pageNumber - 1) * pageSize)
                    .Take(pageSize)
                    .ToListAsync();

                return (items, totalPages);
            }
            catch (Exception ex)
            {
                throw new Exception($"Erreur lors de la récupération des questions paginées : {ex.Message}");
            }
        }

        public async Task<IEnumerable<EvaluationQuestion>> GetEvaluationQuestionsByPositionAsync(int positionId)
        {
            return await _questionRepository.GetQuestionsByPositionAsync(positionId);
        }

        public async Task<IEnumerable<EvaluationQuestion>> GetEvaluationQuestionsByTypePositionAndCompetenceAsync(int evaluationTypeId, int positionId, int competenceLineId)
        {
            return await _questionRepository.GetQuestionsByEvaluationTypePositionAndCompetenceAsync(evaluationTypeId, positionId, competenceLineId);
        }

        // Méthode pour récupérer une évaluation par son ID
        public async Task<Evaluation> GetEvaluationByIdAsync(int evaluationId)
        {
            return await _evaluationRepository.GetByIdAsync(evaluationId);
        }

        // Méthode pour mettre à jour une évaluation
        public async Task<bool> UpdateEvaluationAsync(Evaluation evaluation)
        {
            if (evaluation == null) throw new ArgumentNullException(nameof(evaluation));
            
            // Mettre à jour l'évaluation dans le repository
            await _evaluationRepository.UpdateAsync(evaluation);
            return true;
        }
    }
}
