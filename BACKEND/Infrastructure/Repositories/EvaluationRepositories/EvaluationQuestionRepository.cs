using Microsoft.EntityFrameworkCore;
using soft_carriere_competence.Core.Entities.Evaluations;
using soft_carriere_competence.Core.Interface.EvaluationInterface;
using soft_carriere_competence.Infrastructure.Data;

namespace soft_carriere_competence.Infrastructure.Repositories.EvaluationRepositories
{
    public class EvaluationQuestionRepository: IEvaluationQuestionRepository
    {
        private readonly ApplicationDbContext _context;
        public EvaluationQuestionRepository(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<IEnumerable<EvaluationQuestion>> GetQuestionsByEvaluationTypeAndPostAsync(int evaluationTypeId, int postId)
        {
            Console.WriteLine("Avant la fonction getEvaluationTypeAndPost");
            return await _context.evaluationQuestions
                .Where(q => q.evaluationTypeId == evaluationTypeId && q.postId == postId).Include(u => u.poste).Include(u => u.EvaluationType)
                .ToListAsync();

        }




    }
}
