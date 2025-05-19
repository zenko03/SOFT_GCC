using Microsoft.EntityFrameworkCore;
using soft_carriere_competence.Application.Dtos.EvaluationsDto;
using soft_carriere_competence.Core.Entities.Evaluations;
using soft_carriere_competence.Core.Entities.salary_skills;
using soft_carriere_competence.Infrastructure.Data;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace soft_carriere_competence.Application.Services.Evaluations
{
    public class EvaluationCompetenceService
    {
        private readonly ApplicationDbContext _context;

        public EvaluationCompetenceService(ApplicationDbContext context)
        {
            _context = context;
        }

        /// Calcule et enregistre les résultats par compétence pour une évaluation
        public async Task<bool> CalculateAndSaveCompetenceResultsAsync(int evaluationId)
        {
            try
            {
                Console.WriteLine($"Début du calcul des résultats par compétence pour l'évaluation {evaluationId}");

                // 1. Récupérer l'évaluation avec l'employé associé
                var evaluation = await _context.Evaluations
                    .Include(e => e.Employee)
                    .FirstOrDefaultAsync(e => e.EvaluationId == evaluationId);

                if (evaluation == null)
                {
                    throw new Exception($"Évaluation avec ID {evaluationId} non trouvée.");
                }

                int employeeId = evaluation.EmployeeId;
                decimal overallScore = evaluation.OverallScore ?? 0;

                Console.WriteLine($"Score global de l'évaluation: {overallScore}");

                // 2. Récupérer toutes les compétences distinctes liées à cette évaluation
                var selectedQuestions = await _context.evaluationSelectedQuestions
                    .Where(esq => esq.EvaluationId == evaluationId)
                    .ToListAsync();

                // Obtenir les compétences distinctes
                var distinctCompetences = selectedQuestions
                    .Select(sq => sq.CompetenceLineId)
                    .Distinct()
                    .ToList();

                Console.WriteLine($"Nombre de compétences distinctes: {distinctCompetences.Count}");
                Console.WriteLine($"IDs des compétences: {string.Join(", ", distinctCompetences)}");

                // 3. Supprimer les anciennes entrées pour cette évaluation
                var existingResults = await _context.EvaluationCompetenceResults
                    .Where(ecr => ecr.EvaluationId == evaluationId)
                    .ToListAsync();

                if (existingResults.Any())
                {
                    Console.WriteLine($"Suppression de {existingResults.Count} résultats existants");
                    _context.EvaluationCompetenceResults.RemoveRange(existingResults);
                    await _context.SaveChangesAsync();
                }

                // 4. Créer une entrée de résultat pour chaque compétence distincte avec le score global
                foreach (var competenceId in distinctCompetences)
                {
                    Console.WriteLine($"Création du résultat pour la compétence ID: {competenceId}");
                    
                    // Créer une nouvelle entrée de résultat avec le score global
                    var competenceResult = new EvaluationCompetenceResult
                    {
                        EvaluationId = evaluationId,
                        EmployeeId = employeeId,
                        CompetenceLineId = competenceId,
                        Score = overallScore,
                        CreatedAt = DateTime.UtcNow,
                        State = 1 // Actif
                    };

                    await _context.EvaluationCompetenceResults.AddAsync(competenceResult);
                }

                await _context.SaveChangesAsync();
                Console.WriteLine("Calcul et sauvegarde des résultats par compétence terminés avec succès");
                
                // 5. Mise à jour des compétences des employés
                await UpdateEmployeeSkillsAfterEvaluation(evaluationId);
                
                return true;
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Erreur dans CalculateAndSaveCompetenceResultsAsync: {ex.Message}");
                throw;
            }
        }

        /// Met à jour ou crée les entrées dans Employee_skill basées sur les résultats d'évaluation
        public async Task UpdateEmployeeSkillsAfterEvaluation(int evaluationId)
        {
            try
            {
                // 1. Récupérer les résultats de compétence pour cette évaluation
                var competenceResults = await _context.EvaluationCompetenceResults
                    .Where(ecr => ecr.EvaluationId == evaluationId)
                    .ToListAsync();

                if (!competenceResults.Any())
                {
                    Console.WriteLine($"Pas de résultats de compétence trouvés pour l'évaluation {evaluationId}");
                    return;
                }

                // 2. Récupérer les ID d'employé et les détails d'évaluation
                var evaluation = await _context.Evaluations
                    .FirstOrDefaultAsync(e => e.EvaluationId == evaluationId);

                if (evaluation == null)
                {
                    throw new Exception($"Évaluation {evaluationId} non trouvée.");
                }

                int employeeId = evaluation.EmployeeId;

                // 3. Pour chaque résultat de compétence
                foreach (var result in competenceResults)
                {
                    // Trouver la CompetenceLine pour obtenir la SkillPosition
                    var competenceLine = await _context.competenceLines
                        .FirstOrDefaultAsync(cl => cl.CompetenceLineId == result.CompetenceLineId);

                    if (competenceLine == null)
                    {
                        Console.WriteLine($"CompetenceLine {result.CompetenceLineId} non trouvée.");
                        continue;
                    }

                    // Trouver la SkillPosition correspondante
                    var skillPosition = await _context.SkillPosition
                        .FirstOrDefaultAsync(sp => sp.SkillPositionId == competenceLine.SkillPositionId);

                    if (skillPosition == null)
                    {
                        Console.WriteLine($"SkillPosition pour CompetenceLine {competenceLine.CompetenceLineId} non trouvée.");
                        continue;
                    }

                    // Récupérer le SkillId
                    int skillId = skillPosition.SkillId;

                    // Récupérer le Skill pour obtenir le DomainSkillId
                    var skill = await _context.Skill
                        .FirstOrDefaultAsync(s => s.SkillId == skillId);

                    if (skill == null)
                    {
                        Console.WriteLine($"Skill {skillId} non trouvée.");
                        continue;
                    }

                    // Vérifier si l'employé a déjà cette compétence
                    var existingSkill = await _context.EmployeeSkill
                        .FirstOrDefaultAsync(es => 
                            es.EmployeeId == employeeId && 
                            es.SkillId == skillId);

                    double scoreDouble = (double)result.Score;

                    if (existingSkill != null)
                    {
                        // Mise à jour de la compétence existante
                        existingSkill.Level = scoreDouble;
                        existingSkill.UpdateDate = DateTime.Now;
                        _context.EmployeeSkill.Update(existingSkill);
                        Console.WriteLine($"Compétence {skillId} mise à jour pour l'employé {employeeId} avec le niveau {scoreDouble}");
                    }
                    else
                    {
                        // Création d'une nouvelle entrée de compétence
                        var newEmployeeSkill = new EmployeeSkill
                        {
                            EmployeeId = employeeId,
                            SkillId = skillId,
                            DomainSkillId = skill.DomainSkillId,
                            Level = scoreDouble,
                            State = 1,
                            CreationDate = DateTime.Now,
                            UpdateDate = DateTime.Now
                        };
                        
                        await _context.EmployeeSkill.AddAsync(newEmployeeSkill);
                        Console.WriteLine($"Nouvelle compétence {skillId} créée pour l'employé {employeeId} avec le niveau {scoreDouble}");
                    }
                }

                await _context.SaveChangesAsync();
                Console.WriteLine($"Mise à jour des compétences terminée pour l'employé {employeeId}");
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Erreur dans UpdateEmployeeSkillsAfterEvaluation: {ex.Message}");
                // On log l'erreur mais on ne la propage pas pour ne pas bloquer le processus principal
                Console.WriteLine(ex.StackTrace);
            }
        }

        /// Récupère les résultats de compétences pour un utilisateur
        public async Task<List<CompetenceResultDto>> GetUserCompetenceResultsAsync(int userId)
        {
            try
            {
                // Récupérer les résultats de compétences les plus récents pour chaque compétence de l'utilisateur
                var latestResults = await _context.EvaluationCompetenceResults
                    .Where(ecr => ecr.UserId == userId)
                    .GroupBy(ecr => ecr.CompetenceLineId)
                    .Select(group => group.OrderByDescending(ecr => ecr.CreatedAt).First())
                    .ToListAsync();

                // Récupérer les informations de compétence correspondantes
                var competenceIds = latestResults.Select(lr => lr.CompetenceLineId).ToList();
                var competenceLines = await _context.competenceLines
                    .Where(cl => competenceIds.Contains(cl.CompetenceLineId))
                    .ToListAsync();

                // Combiner les résultats avec les informations de compétence
                var resultDtos = latestResults.Select(lr =>
                {
                    var competenceLine = competenceLines.FirstOrDefault(cl => cl.CompetenceLineId == lr.CompetenceLineId);
                    return new CompetenceResultDto
                    {
                        CompetenceId = lr.CompetenceLineId,
                        CompetenceName = competenceLine?.CompetenceName ?? "Inconnu",
                        Description = competenceLine?.Description ?? "",
                        Score = lr.Score,
                        EvaluationId = lr.EvaluationId,
                        EvaluationDate = _context.Evaluations
                            .Where(e => e.EvaluationId == lr.EvaluationId)
                            .Select(e => e.EndDate)
                            .FirstOrDefault()
                    };
                }).ToList();

                return resultDtos;
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Erreur dans GetUserCompetenceResultsAsync: {ex.Message}");
                throw;
            }
        }

        /// Récupère les résultats de compétences pour une évaluation spécifique
        public async Task<List<CompetenceResultDto>> GetEvaluationCompetenceResultsAsync(int evaluationId)
        {
            try
            {
                // Vérifier si nous avons des résultats existants
                var results = await _context.EvaluationCompetenceResults
                    .Where(ecr => ecr.EvaluationId == evaluationId)
                    .ToListAsync();

                // Si aucun résultat n'existe, calculer les résultats automatiquement
                if (results == null || !results.Any())
                {
                    Console.WriteLine($"Aucun résultat trouvé pour l'évaluation {evaluationId}, calcul automatique...");
                    await CalculateAndSaveCompetenceResultsAsync(evaluationId);
                    
                    // Récupérer les résultats fraîchement calculés
                    results = await _context.EvaluationCompetenceResults
                        .Where(ecr => ecr.EvaluationId == evaluationId)
                        .ToListAsync();
                }

                if (results == null || !results.Any())
                {
                    return new List<CompetenceResultDto>();
                }

                var competenceIds = results.Select(r => r.CompetenceLineId).ToList();
                var competenceLines = await _context.competenceLines
                    .Where(cl => competenceIds.Contains(cl.CompetenceLineId))
                    .ToListAsync();

                var evaluation = await _context.Evaluations
                    .FirstOrDefaultAsync(e => e.EvaluationId == evaluationId);

                var resultDtos = results.Select(r =>
                {
                    var competenceLine = competenceLines.FirstOrDefault(cl => cl.CompetenceLineId == r.CompetenceLineId);
                    return new CompetenceResultDto
                    {
                        CompetenceId = r.CompetenceLineId,
                        CompetenceName = competenceLine?.CompetenceName ?? "Inconnu",
                        Description = competenceLine?.Description ?? "",
                        Score = r.Score,
                        EvaluationId = evaluationId,
                        EvaluationDate = evaluation?.EndDate ?? DateTime.MinValue
                    };
                }).ToList();

                return resultDtos;
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Erreur dans GetEvaluationCompetenceResultsAsync: {ex.Message}");
                throw;
            }
        }

        /// Récupère l'historique des résultats de compétence pour un utilisateur et une compétence spécifique
        public async Task<List<CompetenceResultHistoryDto>> GetCompetenceResultHistoryAsync(int userId, int competenceId)
        {
            try
            {
                var results = await _context.EvaluationCompetenceResults
                    .Where(ecr => ecr.UserId == userId && ecr.CompetenceLineId == competenceId)
                    .OrderByDescending(ecr => ecr.CreatedAt)
                    .ToListAsync();

                var evaluationIds = results.Select(r => r.EvaluationId).ToList();
                var evaluations = await _context.Evaluations
                    .Where(e => evaluationIds.Contains(e.EvaluationId))
                    .ToListAsync();

                var competenceLine = await _context.competenceLines
                    .FirstOrDefaultAsync(cl => cl.CompetenceLineId == competenceId);

                var historyDtos = results.Select(r =>
                {
                    var evaluation = evaluations.FirstOrDefault(e => e.EvaluationId == r.EvaluationId);
                    return new CompetenceResultHistoryDto
                    {
                        ResultId = r.ResultId,
                        CompetenceId = competenceId,
                        CompetenceName = competenceLine?.CompetenceName ?? "Inconnu",
                        Score = r.Score,
                        EvaluationId = r.EvaluationId,
                        EvaluationDate = evaluation?.EndDate ?? DateTime.MinValue,
                        EvaluationType = _context.EvaluationTypes
                            .Where(et => et.EvaluationTypeId == evaluation.EvaluationTypeId)
                            .Select(et => et.Designation)
                            .FirstOrDefault() ?? "Inconnu"
                    };
                }).ToList();

                return historyDtos;
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Erreur dans GetCompetenceResultHistoryAsync: {ex.Message}");
                throw;
            }
        }
    }

    // DTOs pour les résultats de compétence
    public class CompetenceResultDto
    {
        public int CompetenceId { get; set; }
        public string CompetenceName { get; set; }
        public string Description { get; set; }
        public decimal Score { get; set; }
        public int EvaluationId { get; set; }
        public DateTime EvaluationDate { get; set; }
    }

    public class CompetenceResultHistoryDto
    {
        public int ResultId { get; set; }
        public int CompetenceId { get; set; }
        public string CompetenceName { get; set; }
        public decimal Score { get; set; }
        public int EvaluationId { get; set; }
        public DateTime EvaluationDate { get; set; }
        public string EvaluationType { get; set; }
    }
}