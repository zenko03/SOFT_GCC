using System;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using soft_carriere_competence.Core.Interfaces;
using soft_carriere_competence.Infrastructure.Data;

namespace soft_carriere_competence.Infrastructure.Services
{
    public class EmployeeSkillService : IEmployeeSkillService
    {
        private readonly ApplicationDbContext _context;

        public EmployeeSkillService(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task UpdateEmployeeSkillsAfterEvaluation(int evaluationId, int employeeId)
        {
            // Récupérer les résultats de l'évaluation avec les informations de Skill_position
            var evaluationResults = await _context.EvaluationCompetenceResults
                .Include(ecr => ecr.SkillPosition)
                    .ThenInclude(sp => sp.Skill)
                .Where(r => r.EvaluationId == evaluationId)
                .ToListAsync();

            foreach (var result in evaluationResults)
            {
                // Vérifier si l'employé a déjà cette compétence
                var existingSkill = await _context.EmployeeSkills
                    .FirstOrDefaultAsync(es => 
                        es.EmployeeId == employeeId && 
                        es.SkillId == result.SkillPosition.SkillId);

                if (existingSkill != null)
                {
                    // Mise à jour simple
                    existingSkill.Level = result.Score;
                    existingSkill.UpdateDate = DateTime.Now;
                }
                else
                {
                    // Pour une nouvelle compétence, nous devons récupérer le Domain_skill_id
                    // associé à cette compétence
                    var skill = await _context.Skills
                        .FirstOrDefaultAsync(s => s.SkillId == result.SkillPosition.SkillId);

                    if (skill == null)
                    {
                        throw new Exception($"Skill with ID {result.SkillPosition.SkillId} not found");
                    }

                    // Créer un nouvel enregistrement dans Employee_skill
                    var newEmployeeSkill = new EmployeeSkill
                    {
                        EmployeeId = employeeId,
                        SkillId = result.SkillPosition.SkillId,
                        DomainSkillId = skill.DomainSkillId,
                        Level = result.Score,
                        State = 1,
                        CreationDate = DateTime.Now,
                        UpdateDate = DateTime.Now
                    };

                    _context.EmployeeSkills.Add(newEmployeeSkill);
                }
            }

            await _context.SaveChangesAsync();
        }
    }
} 