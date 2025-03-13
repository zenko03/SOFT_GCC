using Microsoft.EntityFrameworkCore;
using soft_carriere_competence.Core.Entities.Evaluations;
using soft_carriere_competence.Core.Interface.EvaluationInterface;
using soft_carriere_competence.Core.Interface;
using soft_carriere_competence.Infrastructure.Data;
using soft_carriere_competence.Core.Entities.salary_skills;

namespace soft_carriere_competence.Application.Services.Evaluations
{
    public class EvaluationPlanningService
    {
        //private readonly IEvaluationQuestionRepository _questionRepository;
        //private readonly IGenericRepository<EvaluationType> _evaluationTypeRepository;
        //private readonly IGenericRepository<EvaluationQuestion> _evaluationQuestion;
        //private readonly IGenericRepository<TrainingSuggestion> _trainingSuggestionsRepository;
        //private readonly IGenericRepository<EvaluationQuestionnaire> _evaluationQuestionnaireRepository;
        //private readonly IGenericRepository<Evaluation> _evaluationRepository;

        private readonly ApplicationDbContext _context;
        private readonly IGenericRepository<Poste> _posteRepository;
        private readonly IGenericRepository<Department> _departementRepository;


        public EvaluationPlanningService(ApplicationDbContext context, 
            IGenericRepository<Department> department, IGenericRepository<Poste> poste)
        {
            _context = context;
            _posteRepository = poste;
            _departementRepository = department;
        }

        public async Task<IEnumerable<VEmployeeWithoutEvaluation>> GetEmployeesWithoutEvaluationsAsync(
                int? position = null, 
                int? department = null, 
                string? search = null)
        {
                    var query = _context.vEmployeeWithoutEvaluations.AsQueryable();

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


        public async Task<(IEnumerable<VEmployeeWithoutEvaluation> Employees, int TotalPages)> GetEmployeesWithoutEvaluationsPaginatedAsync(
    int pageNumber = 1,
    int pageSize = 10,
    int? position = null,
    int? department = null,
    string? search = null)
        {
            var query = _context.vEmployeeWithoutEvaluations.AsQueryable();

            // Appliquer les filtres
            if (position.HasValue)
                query = query.Where(e => e.postId == position);

            if (department.HasValue)
                query = query.Where(e => e.DepartmentId == department);

            if (!string.IsNullOrEmpty(search))
                query = query.Where(e =>
                    (e.FirstName + " " + e.LastName).Contains(search) ||
                    e.FirstName.Contains(search) ||
                    e.LastName.Contains(search));

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

    }
}
