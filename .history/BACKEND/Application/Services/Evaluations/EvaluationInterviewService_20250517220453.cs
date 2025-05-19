using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using soft_carriere_competence.Core.Entities.crud_career;
using soft_carriere_competence.Core.Entities.Evaluations;
using soft_carriere_competence.Core.Entities.salary_skills;
using soft_carriere_competence.Core.Interface;
using soft_carriere_competence.Infrastructure.Data;

namespace soft_carriere_competence.Application.Services.Evaluations
{
    public class EvaluationInterviewService
    {
        private readonly ApplicationDbContext _context;
        private readonly IGenericRepository<Position> _posteRepository;
        private readonly IGenericRepository<Department> _departementRepository;

        public EvaluationInterviewService(ApplicationDbContext context, IGenericRepository<Position> posteRepository, IGenericRepository<Department> departementRepository)
        {
            _context = context;
            _posteRepository = posteRepository;
            _departementRepository = departementRepository;
        }

        public async Task<IEnumerable<VEmployeesFinishedEvaluation>> GetEmployeesWithFinishedEvalAsync(
                int? position = null,
                int? department = null,
                string? search = null)
        {
            var query = _context.vEmployeesFinishedEvaluations.AsQueryable();

            if (position.HasValue)
                query = query.Where(e => e.positionId == position);

            if (department.HasValue)
                query = query.Where(e => e.DepartmentId == department);

            if (!string.IsNullOrEmpty(search))
                query = query.Where(e =>
                    (e.FirstName + " " + e.LastName).Contains(search) ||
                    e.FirstName.Contains(search) ||
                    e.LastName.Contains(search));

            return await query.ToListAsync();
        }

        //pagination
        public async Task<(IEnumerable<VEmployeesFinishedEvaluation> Employees, int TotalPages)> GetEmployeesWithFinishedEvalPaginatedAsync(
    int pageNumber = 1,
    int pageSize = 10,
    int? position = null,
    int? department = null,
    string? search = null,
    string? sortBy = null,
    string? sortDirection = null)
        {
            var query = _context.vEmployeesFinishedEvaluations.AsQueryable();

            // Appliquer les filtres
            if (position.HasValue)
                query = query.Where(e => e.positionId == position);

            if (department.HasValue)
                query = query.Where(e => e.DepartmentId == department);

            if (!string.IsNullOrEmpty(search))
                query = query.Where(e =>
                    (e.FirstName + " " + e.LastName).Contains(search) ||
                    e.FirstName.Contains(search) ||
                    e.LastName.Contains(search));

            // Appliquer le tri
            if (!string.IsNullOrEmpty(sortBy))
            {
                bool isAscending = string.IsNullOrEmpty(sortDirection) || sortDirection.ToLower() == "ascending";
                
                switch (sortBy.ToLower())
                {
                    case "name":
                        query = isAscending 
                            ? query.OrderBy(e => e.FirstName).ThenBy(e => e.LastName)
                            : query.OrderByDescending(e => e.FirstName).ThenByDescending(e => e.LastName);
                        break;
                    case "position":
                        query = isAscending 
                            ? query.OrderBy(e => e.Position)
                            : query.OrderByDescending(e => e.Position);
                        break;
                    case "department":
                        query = isAscending 
                            ? query.OrderBy(e => e.Department)
                            : query.OrderByDescending(e => e.Department);
                        break;
                    case "evaluationdate":
                    case "startdate":
                        query = isAscending 
                            ? query.OrderBy(e => e.startDate)
                            : query.OrderByDescending(e => e.startDate);
                        break;
                    case "interviewdate":
                        query = isAscending 
                            ? query.OrderBy(e => e.InterviewDate)
                            : query.OrderByDescending(e => e.InterviewDate);
                        break;
                    default:
                        // Tri par défaut si la clé de tri n'est pas reconnue
                        query = query.OrderBy(e => e.FirstName).ThenBy(e => e.LastName);
                        break;
                }
            }

            // Calculer le nombre total d'éléments
            var totalItems = await query.CountAsync();

            // Calculer le nombre total de pages
            var totalPages = (int)Math.Ceiling((double)totalItems / pageSize);

            // Paginer les résultats
            var employees = await query
                .Skip((pageNumber - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync();

            return (employees, totalPages);
        }

        public async Task<VEmployeesFinishedEvaluation?> GetEmployeeAsync(int employeeId)
        {
            return await _context.vEmployeesFinishedEvaluations
                .FirstOrDefaultAsync(e => e.EmployeeId == employeeId);
        }

        public async Task<Position> GetPosteByIdAsync(int posteId)
        {
            return await _posteRepository.GetByIdAsync(posteId);
        }

        public async Task<Department> GetDepartmentByIdAsync(int departmentId)
        {
            return await _departementRepository.GetByIdAsync(departmentId);
        }

        public async Task<IEnumerable<Position>> GetAllPostesAsync()
        {
            return await _posteRepository.GetAllAsync();
        }

        public async Task<IEnumerable<Department>> GetAllDepartmentsAsync()
        {
            return await _departementRepository.GetAllAsync();
        }


        // Planifier un entretien
        public async Task<(bool Success, string Message, int? InterviewId)> ScheduleInterviewAsync(int evaluationId, DateTime scheduledDate, List<int> participantIds)
        {
            using var transaction = await _context.Database.BeginTransactionAsync();
            try
            {
                // Vérifier si l'évaluation existe
                var evaluationExists = await _context.Evaluations.AnyAsync(e => e.EvaluationId == evaluationId);
                if (!evaluationExists)
                {
                    return (false, "Évaluation non trouvée.", null);
                }

                // Vérifier si un entretien est déjà planifié dans le futur pour cette évaluation
                var existingInterview = await _context.evaluationInterviews
                    .FirstOrDefaultAsync(e => e.EvaluationId == evaluationId && e.InterviewDate >= DateTime.Now);

                if (existingInterview != null)
                {
                    return (false, "Un entretien est déjà planifié pour cette évaluation.", null);
                }

                // Créer l'entretien
                var interview = new EvaluationInterviews
                {
                    EvaluationId = evaluationId,
                    InterviewDate = scheduledDate,
                    status = InterviewStatus.Planned
                };

                _context.evaluationInterviews.Add(interview);
                await _context.SaveChangesAsync();

                // Ajouter les participants
                var participants = participantIds.Select(participantId => new InterviewParticipants
                {
                    InterviewId = interview.InterviewId,
                    UserId = participantId
                });

                _context.interviewParticipants.AddRange(participants);
                await _context.SaveChangesAsync();

                await transaction.CommitAsync();
                return (true, "Entretien planifié avec succès.", interview.InterviewId);
            }
            catch (Exception ex)
            {
                await transaction.RollbackAsync();
                // Log de l'exception (non montré ici pour la simplicité)
                return (false, "Une erreur s'est produite lors de la planification de l'entretien.", null);
            }
        }


        // Démarrer un entretien
        public async Task<bool> StartInterviewAsync(int interviewId)
        {
            Console.WriteLine($"Démarrage de StartInterviewAsync pour l'interview ID: {interviewId}");

            try {
                // Vérifier si l'entretien existe avant d'essayer de mettre à jour
                var interviewExists = await _context.evaluationInterviews.AnyAsync(i => i.InterviewId == interviewId);
                if (!interviewExists)
                {
                    Console.WriteLine($"Aucun entretien trouvé avec l'ID: {interviewId}");
                    return false;
                }

                Console.WriteLine("Entretien trouvé, tentative de mise à jour du statut...");

                // Utiliser une requête SQL directe pour mettre à jour le statut
                // Cela contourne tout problème potentiel avec le tracking d'EF Core
                var statusValue = (int)InterviewStatus.InProgress; // Conversion de l'enum en int (20)
                var rowsAffected = await _context.Database.ExecuteSqlRawAsync(
                    "UPDATE Evaluation_interviews SET status = {0} WHERE InterviewId = {1}",
                    statusValue, interviewId);

                Console.WriteLine($"Requête SQL exécutée, {rowsAffected} lignes affectées");
                
                // Vérifier que la mise à jour a bien fonctionné
                var updatedInterview = await _context.evaluationInterviews.AsNoTracking().FirstOrDefaultAsync(i => i.InterviewId == interviewId);
                if (updatedInterview != null)
                {
                    Console.WriteLine($"Vérification après mise à jour: statut actuel = {updatedInterview.status}");
                }

                return rowsAffected > 0;
            }
            catch (Exception ex) {
                Console.WriteLine($"Exception dans StartInterviewAsync: {ex.Message}");
                Console.WriteLine($"StackTrace: {ex.StackTrace}");
                throw; // Relancer l'exception pour que l'appelant puisse la gérer
            }
        }

        // Terminer un entretien avec validation
        public async Task<bool> CompleteInterviewAsync(
      int interviewId,
      bool? managerApproval = null,
      string? managerComments = null,
      bool? directorApproval = null,
      string? directorComments = null,
      string? notes = null
  )
        {
            Console.WriteLine($"Démarrage de CompleteInterviewAsync pour l'interview ID: {interviewId}");
            
            var interview = await _context.evaluationInterviews
                .FirstOrDefaultAsync(i => i.InterviewId == interviewId);

            if (interview == null)
            {
                Console.WriteLine($"Interview introuvable pour l'ID: {interviewId}");
                return false;
            }

            Console.WriteLine($"Interview trouvé - EvaluationId: {interview.EvaluationId}, Status actuel: {interview.status}");

            // Mise à jour conditionnelle des champs
            if (managerApproval.HasValue)
            {
                interview.managerApproval = managerApproval;
                Console.WriteLine($"Mise à jour de managerApproval: {managerApproval}");
            }

            if (!string.IsNullOrEmpty(managerComments))
            {
                interview.managerComments = managerComments;
                Console.WriteLine("Mise à jour des commentaires du manager");
            }

            if (directorApproval.HasValue)
            {
                interview.directorApproval = directorApproval;
                Console.WriteLine($"Mise à jour de directorApproval: {directorApproval}");
            }

            if (!string.IsNullOrEmpty(directorComments))
            {
                interview.directorComments = directorComments;
                Console.WriteLine("Mise à jour des commentaires du directeur");
            }

            if (!string.IsNullOrEmpty(notes))
            {
                interview.notes = notes;
                Console.WriteLine("Mise à jour des notes");
            }

            // Mise à jour du statut en fonction des validations
            if (interview.managerApproval == true && interview.directorApproval == true)
            {
                // Tous les deux ont validé
                interview.status = InterviewStatus.Completed;
                Console.WriteLine("Statut de l'interview mis à jour: Completed");

                try {
                    // Vérifier que l'ID d'évaluation existe et est valide avant de l'utiliser
                    if (interview.EvaluationId != null && interview.EvaluationId > 0)
                    {
                        // Mettre à jour l'état de l'évaluation à 30 (archivé)
                        var evaluation = await _context.Evaluations.FindAsync(interview.EvaluationId);
                        if (evaluation != null)
                        {
                            evaluation.state = 30; // État archivé
                            _context.Evaluations.Update(evaluation);
                            Console.WriteLine($"État de l'évaluation (ID: {interview.EvaluationId}) mis à jour à 30 (archivé)");
                        }
                        else
                        {
                            Console.WriteLine($"Évaluation avec ID {interview.EvaluationId} non trouvée");
                        }
                    }
                    else
                    {
                        Console.WriteLine($"EvaluationId est NULL ou invalide: {interview.EvaluationId}");
                    }
                }
                catch (Exception ex) {
                    // Capturer et journaliser l'exception, mais continuer le traitement
                    Console.WriteLine($"Exception lors de la mise à jour de l'évaluation: {ex.Message}");
                    Console.WriteLine($"StackTrace: {ex.StackTrace}");
                }
            }
            else if (interview.managerApproval == false || interview.directorApproval == false)
            {
                // L'un des deux a refusé
                interview.status = InterviewStatus.Rejected;
                Console.WriteLine("Statut de l'interview mis à jour: Rejected");
            }
            else
            {
                // En attente de validation
                interview.status = InterviewStatus.PendingValidation;
                Console.WriteLine("Statut de l'interview mis à jour: PendingValidation");
            }

            try {
                _context.evaluationInterviews.Update(interview);
                await _context.SaveChangesAsync();
                Console.WriteLine("Interview mis à jour avec succès dans la base de données");
                return true;
            }
            catch (Exception ex) {
                Console.WriteLine($"Exception lors de la sauvegarde des changements: {ex.Message}");
                Console.WriteLine($"StackTrace: {ex.StackTrace}");
                throw; // Relancer l'exception pour que l'appelant puisse la gérer
            }
        }




        // Récupérer les détails d'un entretien
        public async Task<EvaluationInterviews?> GetInterviewDetailsAsync(int interviewId)
        {
            // Récupère les détails de l'entretien
            var interview = await _context.evaluationInterviews
                .FirstOrDefaultAsync(i => i.InterviewId == interviewId);

            if (interview != null)
            {
                // Récupère les participants associés à cet entretien
                var participants = await _context.interviewParticipants
                    .Where(p => p.InterviewId == interviewId)
                    .Include(p => p.User) // Inclure les détails de l'utilisateur
                    .ToListAsync();

                // Si nécessaire, on peut mapper les participants dans un DTO ou un objet temporaire
                // Exemple :
                // interview.Participants = participants.Select(p => p.User).ToList(); 
            }

            return interview;
        }


        public async Task<bool> UpdateInterviewAsync(int interviewId, DateTime? newDate, List<int> newParticipantIds, int? newStatus)
        {
            var interview = await _context.evaluationInterviews
                .FirstOrDefaultAsync(i => i.InterviewId == interviewId);

            if (interview == null)
            {
                return false; // Entretien introuvable
            }

            // Vérifier que l'entretien est dans un statut qui permet la modification
            if (interview.status == InterviewStatus.Completed || interview.status == InterviewStatus.Rejected)
            {
                return false; // Ne pas autoriser la mise à jour si l'entretien est déjà terminé ou rejeté
            }

            // Mise à jour de la date de l'entretien si elle est fournie
            if (newDate.HasValue)
            {
                interview.InterviewDate = newDate.Value;
            }

            // Mise à jour des participants
            if (newParticipantIds != null && newParticipantIds.Any())
            {
                // Supprimer les anciens participants
               // _context.interviewParticipants.RemoveRange(interview.Participants);

                // Ajouter les nouveaux participants
                foreach (var participantId in newParticipantIds)
                {
                    _context.interviewParticipants.Add(new InterviewParticipants
                    {
                        InterviewId = interview.InterviewId,
                        UserId = participantId
                    });
                }
            }

            // Mise à jour du statut de l'entretien si nécessaire
            if (newStatus.HasValue)
            {
                var status = (InterviewStatus)newStatus.Value;
                // Si le statut est valide, mettre à jour
                if (Enum.IsDefined(typeof(InterviewStatus), status))
                {
                    interview.status = status;
                }
                else
                {
                    return false; // Si le statut n'est pas valide, la mise à jour échoue
                }
            }

            _context.evaluationInterviews.Update(interview);
            await _context.SaveChangesAsync();


            return true;
        }

        public async Task<EvaluationInterviews?> GetInterviewByParticipantIdAsync(int participantId)
        {
            return await _context.interviewParticipants
                .Where(p => p.UserId == participantId)
                .Select(p => p.Interview)
                .FirstOrDefaultAsync();
        }

        public string GetValidationStatus(int interviewId)
        {
            var interview = _context.evaluationInterviews
                .FirstOrDefault(i => i.InterviewId == interviewId);

            if (interview == null)
            {
                return "Entretien introuvable.";
            }

            string validationStatus = "Statut de validation :";

            // Vérifier la validation du Manager
            if (interview.managerApproval == null)
            {
                validationStatus += " Manager n'a pas encore validé.";
            }
            else if (interview.managerApproval == true)
            {
                validationStatus += " Manager a validé.";
            }
            else
            {
                validationStatus += " Manager a refusé.";
            }

            // Vérifier la validation du Directeur
            if (interview.directorApproval == null)
            {
                validationStatus += " Directeur n'a pas encore validé.";
            }
            else if (interview.directorApproval == true)
            {
                validationStatus += " Directeur a validé.";
            }
            else
            {
                validationStatus += " Directeur a refusé.";
            }

            return validationStatus;
        }





    }
}
