using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using soft_carriere_competence.Core.Entities.Evaluations;
using soft_carriere_competence.Core.Entities.salary_skills;
using soft_carriere_competence.Core.Interface;
using soft_carriere_competence.Infrastructure.Data;

namespace soft_carriere_competence.Application.Services.Evaluations
{
    public class EvaluationInterviewService
    {
        private readonly ApplicationDbContext _context;
        private readonly IGenericRepository<Poste> _posteRepository;
        private readonly IGenericRepository<Department> _departementRepository;

        public EvaluationInterviewService(ApplicationDbContext context, IGenericRepository<Poste> posteRepository, IGenericRepository<Department> departementRepository)
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
                query = query.Where(e => e.postId == position);

            if (department.HasValue)
                query = query.Where(e => e.DepartmentId == department);

            if (!string.IsNullOrEmpty(search))
                query = query.Where(e =>
                    (e.FirstName + " " + e.LastName).Contains(search) ||
                    e.FirstName.Contains(search) ||
                    e.LastName.Contains(search));

            return await query.ToListAsync();
        }

        public async Task<VEmployeesFinishedEvaluation?> GetEmployeeAsync(int employeeId)
        {
            return await _context.vEmployeesFinishedEvaluations
                .FirstOrDefaultAsync(e => e.EmployeeId == employeeId);
        }

        public async Task<Poste> GetPosteByIdAsync(int posteId)
        {
            return await _posteRepository.GetByIdAsync(posteId);
        }

        public async Task<Department> GetDepartmentByIdAsync(int departmentId)
        {
            return await _departementRepository.GetByIdAsync(departmentId);
        }

        public async Task<IEnumerable<Poste>> GetAllPostesAsync()
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

                // Vérifier si un entretien existe déjà pour cette évaluation
                var existingInterview = await _context.evaluationInterviews
                    .FirstOrDefaultAsync(e => e.EvaluationId == evaluationId);

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
            Console.WriteLine("Before var interview");

            var interview = await _context.evaluationInterviews.FindAsync(interviewId);
            Console.WriteLine("after calling FindAsync");
            if (interview == null )
            {
                Console.WriteLine("Dans la condition IF");

                return false;
            }
            Console.WriteLine("after The condition ");

            interview.status = InterviewStatus.InProgress;
            Console.WriteLine("Statut de l'interview: "+interview.status );


            _context.evaluationInterviews.Update(interview);
            await _context.SaveChangesAsync();

            return true;
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
            var interview = await _context.evaluationInterviews
                .FirstOrDefaultAsync(i => i.InterviewId == interviewId);

            if (interview == null)
            {
                return false;
            }

            // Mise à jour conditionnelle des champs
            if (managerApproval.HasValue)
            {
                interview.managerApproval = managerApproval;
            }

            if (!string.IsNullOrEmpty(managerComments))
            {
                interview.managerComments = managerComments;
            }

            if (directorApproval.HasValue)
            {
                interview.directorApproval = directorApproval;
            }

            if (!string.IsNullOrEmpty(directorComments))
            {
                interview.directorComments = directorComments;
            }

            if (!string.IsNullOrEmpty(notes))
            {
                interview.notes = notes;
            }

            // Mise à jour du statut en fonction des validations
            if (interview.managerApproval == true && interview.directorApproval == true)
            {
                // Tous les deux ont validé
                interview.status = InterviewStatus.Completed;
            }
            else if (interview.managerApproval == false || interview.directorApproval == false)
            {
                // L'un des deux a refusé
                interview.status = InterviewStatus.Rejected;
            }
            else
            {
                // En attente de validation
                interview.status = InterviewStatus.PendingValidation;
            }

            _context.evaluationInterviews.Update(interview);
            await _context.SaveChangesAsync();

            return true;
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
