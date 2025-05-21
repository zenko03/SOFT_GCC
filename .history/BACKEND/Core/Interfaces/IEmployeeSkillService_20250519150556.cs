using System.Threading.Tasks;

namespace soft_carriere_competence.Core.Interfaces
{
    public interface IEmployeeSkillService
    {
        Task UpdateEmployeeSkillsAfterEvaluation(int evaluationId, int employeeId);
    }
} 