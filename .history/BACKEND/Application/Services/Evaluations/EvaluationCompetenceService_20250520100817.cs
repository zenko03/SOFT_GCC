using Microsoft.EntityFrameworkCore;
using soft_carriere_competence.Application.Dtos.EvaluationsDto;
using soft_carriere_competence.Core.Entities.Evaluations;
using soft_carriere_competence.Core.Entities.salary_skills;
using soft_carriere_competence.Core.Entities.wish_evolution;
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

        /// <summary>
        /// Calcule et enregistre les résultats par compétence pour une évaluation
        /// </summary>
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

                // 2. Récupérer les questions sélectionnées pour cette évaluation et leurs compétences associées
                var selectedQuestions = await _context.evaluationSelectedQuestions
                    .Where(esq => esq.EvaluationId == evaluationId)
                    .ToListAsync();

                if (selectedQuestions == null || !selectedQuestions.Any())
                {
                    Console.WriteLine($"Aucune question sélectionnée trouvée pour l'évaluation {evaluationId}");
                    return false;
                }

                // 3. Extraire les IDs de compétence distincts
                var distinctCompetences = selectedQuestions
                    .Select(sq => sq.CompetenceLineId)
                    .Distinct()
                    .ToList();

                Console.WriteLine($"Nombre de compétences distinctes: {distinctCompetences.Count}");

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

        /// <summary>
        /// Met à jour ou crée les entrées dans EmployeeSkill basées sur les résultats d'évaluation
        /// </summary>
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
                Console.WriteLine($"Mise à jour des compétences pour l'employé ID: {employeeId}");

                // 3. Pour chaque résultat de compétence
                foreach (var result in competenceResults)
                {
                    try
                    {
                        // Trouver la CompetenceLine pour obtenir la SkillPosition
                        var competenceLine = await _context.competenceLines
                            .Include(cl => cl.SkillPosition)
                            .FirstOrDefaultAsync(cl => cl.CompetenceLineId == result.CompetenceLineId);

                        if (competenceLine == null)
                        {
                            Console.WriteLine($"CompetenceLine {result.CompetenceLineId} non trouvée.");
                            continue;
                        }

                        if (competenceLine.SkillPosition == null)
                        {
                            Console.WriteLine($"SkillPosition pour CompetenceLine {competenceLine.CompetenceLineId} non trouvée.");
                            continue;
                        }

                        // Récupérer le SkillId
                        int skillId = competenceLine.SkillPosition.SkillId;
                        Console.WriteLine($"Traitement de la compétence (SkillId): {skillId}");

                        // Récupérer le Skill à partir de la base
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
                            int domainSkillId = 0;
                            
                            try
                            {
                                // 1. Recherche du DomainSkillId le plus courant pour cette compétence
                                var mostCommonDomainSkillId = await _context.EmployeeSkill
                                    .Where(es => es.SkillId == skillId)
                                    .GroupBy(es => es.DomainSkillId)
                                    .OrderByDescending(group => group.Count())
                                    .Select(group => group.Key)
                                    .FirstOrDefaultAsync();

                                if (mostCommonDomainSkillId != 0)
                                {
                                    domainSkillId = mostCommonDomainSkillId;
                                    Console.WriteLine($"Utilisation du domaine le plus courant ({domainSkillId}) pour la compétence {skillId}");
                                }
                                else
                                {
                                    // 2. Si aucun usage existant, rechercher un domaine pertinent
                                    var domainSkills = await _context.DomainSkill
                                        .Where(ds => ds.Name != null) // Filtrer les entrées nulles
                                        .ToListAsync();
                                        
                                    var skillName = skill.Name?.ToLower() ?? "";
                                    
                                    if (!string.IsNullOrEmpty(skillName))
                                    {
                                        // Recherche par correspondance de nom
                                        var matchingDomain = domainSkills
                                            .Where(ds => ds.Name != null) // Vérification supplémentaire
                                            .FirstOrDefault(ds => 
                                                skillName.Contains(ds.Name.ToLower()) || 
                                                ds.Name.ToLower().Contains(skillName));
                                        
                                        if (matchingDomain != null)
                                        {
                                            domainSkillId = matchingDomain.DomainSkillId;
                                            Console.WriteLine($"Domaine trouvé par correspondance de nom ({domainSkillId}) pour la compétence {skillId}");
                                        }
                                    }
                                    
                                    // 3. Si aucune correspondance n'est trouvée, utiliser le premier domaine non-null
                                    if (domainSkillId == 0)
                                    {
                                        var firstDomain = await _context.DomainSkill
                                            .Where(ds => ds.Name != null)
                                            .FirstOrDefaultAsync();
                                            
                                        if (firstDomain != null)
                                        {
                                            domainSkillId = firstDomain.DomainSkillId;
                                            Console.WriteLine($"Utilisation du premier domaine disponible ({domainSkillId}) pour la compétence {skillId}");
                                        }
                                        else
                                        {
                                            // Aucun domaine disponible avec un nom non-null
                                            Console.WriteLine("Aucun domaine valide trouvé dans la base de données.");
                                            continue;
                                        }
                                    }
                                }
                            }
                            catch (Exception ex)
                            {
                                Console.WriteLine($"Erreur lors de la recherche d'un domaine: {ex.Message}");
                                
                                // Tenter de prendre le premier domaine disponible
                                try
                                {
                                    var fallbackDomain = await _context.DomainSkill.FirstOrDefaultAsync();
                                    if (fallbackDomain != null)
                                    {
                                        domainSkillId = fallbackDomain.DomainSkillId;
                                        Console.WriteLine($"Fallback: Utilisation du premier domaine ({domainSkillId})");
                                    }
                                    else
                                    {
                                        Console.WriteLine("Impossible de trouver un domaine de compétence. Création impossible.");
                                        continue;
                                    }
                                }
                                catch
                                {
                                    Console.WriteLine("Échec total de récupération de domaine. Création impossible.");
                                    continue;
                                }
                            }

                            // Création d'une nouvelle entrée de compétence
                            if (domainSkillId > 0)
                            {
                                var newEmployeeSkill = new EmployeeSkill
                                {
                                    EmployeeId = employeeId,
                                    SkillId = skillId,
                                    DomainSkillId = domainSkillId,
                                    Level = scoreDouble,
                                    State = 1,
                                    CreationDate = DateTime.Now,
                                    UpdateDate = DateTime.Now
                                };
                                
                                await _context.EmployeeSkill.AddAsync(newEmployeeSkill);
                                Console.WriteLine($"Nouvelle compétence {skillId} créée pour l'employé {employeeId} avec le niveau {scoreDouble}");
                            }
                            else
                            {
                                Console.WriteLine($"Impossible de créer la compétence pour l'employé {employeeId} - domaine non valide");
                            }
                        }
                    }
                    catch (Exception ex)
                    {
                        Console.WriteLine($"Erreur lors du traitement du résultat de compétence {result.CompetenceLineId}: {ex.Message}");
                        // Continuer avec le prochain résultat
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

        /// <summary>
        /// Récupère les résultats de compétences pour un utilisateur
        /// </summary>
        public async Task<List<CompetenceResultDto>> GetUserCompetenceResultsAsync(int employeeId)
        {
            try
            {
                // Récupérer les résultats de compétences les plus récents pour chaque compétence de l'employé
                var latestResults = await _context.EvaluationCompetenceResults
                    .Where(ecr => ecr.EmployeeId == employeeId)
                    .GroupBy(ecr => ecr.CompetenceLineId)
                    .Select(group => group.OrderByDescending(ecr => ecr.CreatedAt).First())
                    .ToListAsync();

                // Récupérer les informations de compétence correspondantes
                var competenceIds = latestResults.Select(lr => lr.CompetenceLineId).ToList();
                var competenceLines = await _context.competenceLines
                    .Include(cl => cl.SkillPosition)
                        .ThenInclude(sp => sp.Skill)
                    .Where(cl => competenceIds.Contains(cl.CompetenceLineId))
                    .ToListAsync();

                // Récupérer les informations d'évaluation correspondantes
                var evaluationIds = latestResults.Select(lr => lr.EvaluationId).Distinct().ToList();
                var evaluations = await _context.Evaluations
                    .Where(e => evaluationIds.Contains(e.EvaluationId))
                    .ToListAsync();

                // Construire les DTOs
                var resultDtos = latestResults.Select(result =>
                {
                    var competenceLine = competenceLines.FirstOrDefault(cl => cl.CompetenceLineId == result.CompetenceLineId);
                    var evaluation = evaluations.FirstOrDefault(e => e.EvaluationId == result.EvaluationId);
                    
                    return new CompetenceResultDto
                    {
                        CompetenceId = result.CompetenceLineId,
                        CompetenceName = competenceLine?.SkillPosition?.Skill?.Name ?? "Inconnu",
                        Description = competenceLine?.Description ?? "",
                        Score = result.Score,
                        EvaluationId = result.EvaluationId,
                        EvaluationDate = evaluation?.EndDate ?? DateTime.MinValue
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

        /// <summary>
        /// Récupère les résultats des compétences pour une évaluation spécifique
        /// </summary>
        public async Task<List<CompetenceResultDto>> GetEvaluationCompetenceResultsAsync(int evaluationId)
        {
            try
            {
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
                    .Include(cl => cl.SkillPosition)
                        .ThenInclude(sp => sp.Skill)
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
                        // Utiliser le nom de compétence à partir de SkillPosition -> Skill
                        CompetenceName = competenceLine?.SkillPosition?.Skill?.Name ?? "Inconnu",
                        // Pas de description directe, utiliser le nom de compétence ou une chaîne vide
                        Description = competenceLine?.SkillPosition?.Skill?.Name ?? "",
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

        /// <summary>
        /// Récupère l'historique des résultats de compétence pour un utilisateur et une compétence spécifique
        /// </summary>
        public async Task<List<CompetenceResultHistoryDto>> GetCompetenceResultHistoryAsync(int employeeId, int competenceId)
        {
            try
            {
                var results = await _context.EvaluationCompetenceResults
                    .Where(ecr => ecr.EmployeeId == employeeId && ecr.CompetenceLineId == competenceId)
                    .OrderByDescending(ecr => ecr.CreatedAt)
                    .ToListAsync();

                if (results == null || !results.Any())
                {
                    return new List<CompetenceResultHistoryDto>();
                }

                var evaluationIds = results.Select(r => r.EvaluationId).ToList();
                var evaluations = await _context.Evaluations
                    .Include(e => e.EvaluationType)
                    .Where(e => evaluationIds.Contains(e.EvaluationId))
                    .ToListAsync();

                var competenceLine = await _context.competenceLines
                    .Include(cl => cl.SkillPosition)
                        .ThenInclude(sp => sp.Skill)
                    .FirstOrDefaultAsync(cl => cl.CompetenceLineId == competenceId);

                var historyDtos = results.Select(r =>
                {
                    var evaluation = evaluations.FirstOrDefault(e => e.EvaluationId == r.EvaluationId);
                    return new CompetenceResultHistoryDto
                    {
                        ResultId = r.ResultId,
                        CompetenceId = competenceId,
                        CompetenceName = competenceLine?.SkillPosition?.Skill?.Name ?? "Inconnu",
                        Score = r.Score,
                        EvaluationId = r.EvaluationId,
                        EvaluationDate = evaluation?.EndDate ?? DateTime.MinValue,
                        EvaluationType = evaluation?.EvaluationType?.Designation ?? "Inconnu"
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