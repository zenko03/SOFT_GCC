using Microsoft.EntityFrameworkCore;
using soft_carriere_competence.Core.Entities.Evaluations;
using soft_carriere_competence.Core.Interface.EvaluationInterface;
using soft_carriere_competence.Infrastructure.Data;
using System.Linq.Expressions;

namespace soft_carriere_competence.Infrastructure.Repositories.EvaluationRepositories
{
    public class EvaluationQuestionRepository: IEvaluationQuestionRepository
    {
        private readonly ApplicationDbContext _context;
        public EvaluationQuestionRepository(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<IEnumerable<EvaluationQuestion>> GetQuestionsByEvaluationTypeAndPostAsync(int evaluationTypeId, int positionId)
        {
            Console.WriteLine("Avant la fonction getEvaluationTypeAndPost");
            return await _context.evaluationQuestions
                .Where(q => q.evaluationTypeId == evaluationTypeId && q.positionId == positionId)
                .Include(u => u.Position)
                .Include(u => u.EvaluationType)
                .ToListAsync();
        }

        public async Task<bool> ExistsAsync(int questionId)
        {
            return await _context.evaluationQuestions.AnyAsync(q => q.questionId == questionId);
        }

        public async Task<IEnumerable<EvaluationQuestion>> GetQuestionsByPositionAsync(int positionId)
        {
            return await _context.evaluationQuestions
                .Where(q => q.positionId == positionId)
                .Include(u => u.Position)
                .Include(u => u.EvaluationType)
                .ToListAsync();
        }

        public async Task<IEnumerable<EvaluationQuestion>> GetQuestionsByEvaluationTypePositionAndCompetenceAsync(int evaluationTypeId, int positionId, int competenceLineId)
        {
            Console.WriteLine($"Recherche des questions avec les paramètres : evaluationTypeId={evaluationTypeId}, positionId={positionId}, competenceLineId={competenceLineId}");
            
            // D'abord, vérifions si des questions existent pour cette position et ce type d'évaluation
            var questionsForPositionAndType = await _context.evaluationQuestions
                .Where(q => q.evaluationTypeId == evaluationTypeId && q.positionId == positionId)
                .ToListAsync();
            
            Console.WriteLine($"Nombre de questions trouvées pour position et type : {questionsForPositionAndType.Count}");
            
            // Ensuite, filtrons par ligne de compétence
            var questions = await _context.evaluationQuestions
                .Where(q => q.evaluationTypeId == evaluationTypeId 
                    && q.positionId == positionId 
                    && q.CompetenceLineId == competenceLineId
                    && q.state == 1)
                .Include(u => u.Position)
                .Include(u => u.EvaluationType)
                .Include(u => u.CompetenceLine)
                .ToListAsync();
            
            Console.WriteLine($"Nombre de questions trouvées avec tous les filtres : {questions.Count}");
            
            // Si aucune question n'est trouvée, essayons de trouver des questions sans ligne de compétence
            if (!questions.Any())
            {
                Console.WriteLine("Aucune question trouvée avec la ligne de compétence, recherche de questions sans ligne de compétence...");
                questions = await _context.evaluationQuestions
                    .Where(q => q.evaluationTypeId == evaluationTypeId 
                        && q.positionId == positionId 
                        && q.CompetenceLineId == null
                        && q.state == 1)
                    .Include(u => u.Position)
                    .Include(u => u.EvaluationType)
                    .Include(u => u.CompetenceLine)
                    .ToListAsync();
                
                Console.WriteLine($"Nombre de questions trouvées sans ligne de compétence : {questions.Count}");
            }
            
            return questions;
        }
    }
}
