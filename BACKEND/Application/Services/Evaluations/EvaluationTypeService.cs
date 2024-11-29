using soft_carriere_competence.Core.Entities.Evaluations;
using soft_carriere_competence.Core.Interface;
using soft_carriere_competence.Infrastructure.Data;

namespace soft_carriere_competence.Application.Services.Evaluations
{
    public class EvaluationTypeService
    {
        private readonly IGenericRepository<EvaluationType> _repository;
        private readonly ApplicationDbContext _context;

        public EvaluationTypeService(IGenericRepository<EvaluationType> repository, ApplicationDbContext context)
        {
            _repository = repository;
            _context = context;
        }
        public async Task<IEnumerable<EvaluationType>> GetAllEvaluationTypeAsync()
        {
            return await _repository.GetAllAsync();
        }


    }
}
