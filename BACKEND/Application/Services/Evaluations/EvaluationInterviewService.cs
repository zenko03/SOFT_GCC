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
        public async Task<int?> ScheduleInterviewAsync(int evaluationId, DateTime scheduledDate, List<int> participantIds)
        {
            // Vérifier si un entretien existe déjà pour cette évaluation
            var existingInterview = await _context.evaluationInterviews
                .FirstOrDefaultAsync(e => e.EvaluationId == evaluationId);

            if (existingInterview != null)
            {
                return null; // Entretien déjà planifié
            }

            var interview = new EvaluationInterviews
            {
                EvaluationId = evaluationId,
                InterviewDate = scheduledDate,
                status = InterviewStatus.Planned
            };

            _context.evaluationInterviews.Add(interview);
            await _context.SaveChangesAsync(); // InterviewId généré

            // Ajouter les participants avec l'InterviewId défini
            foreach (var participantId in participantIds)
            {
                var participant = new InterviewParticipants
                {
                    InterviewId = interview.InterviewId,
                    UserId = participantId
                };
                _context.interviewParticipants.Add(participant);
            }

            await _context.SaveChangesAsync(); // Sauvegarde des participants

            return interview.InterviewId;
        }

        // Démarrer un entretien
        public async Task<bool> StartInterviewAsync(int interviewId)
        {
            Console.WriteLine("Before var interview");

            var interview = await _context.evaluationInterviews.FindAsync(interviewId);
            Console.WriteLine("after calling FindAsync");
            if (interview == null || interview.status != InterviewStatus.Planned)
            {
                Console.WriteLine("Dans la condition IF");

                return false;
            }
            Console.WriteLine("after The condition ");

            interview.status = InterviewStatus.InProgress;
            _context.evaluationInterviews.Update(interview);
            await _context.SaveChangesAsync();

            return true;
        }

        // Terminer un entretien avec validation
        public async Task<bool> CompleteInterviewAsync(
            int interviewId,
            bool managerApproval,
            string? managerComments,
            bool directorApproval,
            string? directorComments)
        {
            var interview = await _context.evaluationInterviews
                .Include(i => i.Participants)
                .FirstOrDefaultAsync(i => i.InterviewId == interviewId);

            if (interview == null || interview.status != InterviewStatus.InProgress)
            {
                return false;
            }

            interview.status = (managerApproval && directorApproval) ? InterviewStatus.Completed : InterviewStatus.Rejected;
            interview.managerApproval = managerApproval;
            interview.managerComments = managerComments;
            interview.directorApproval = directorApproval;
            interview.directorComments = directorComments;

            _context.evaluationInterviews.Update(interview);
            await _context.SaveChangesAsync();

            return true;
        }

        // Récupérer les détails d'un entretien
        public async Task<EvaluationInterviews?> GetInterviewDetailsAsync(int interviewId)
        {
            return await _context.evaluationInterviews
                .Include(i => i.Participants)
                .ThenInclude(p => p.User)
                .FirstOrDefaultAsync(i => i.InterviewId == interviewId);
        }


        public async Task<bool> UpdateInterviewAsync(int interviewId, DateTime? newDate, List<int> newParticipantIds, int? newStatus)
        {
            var interview = await _context.evaluationInterviews
                .Include(i => i.Participants)
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
                _context.interviewParticipants.RemoveRange(interview.Participants);

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


    }
}
