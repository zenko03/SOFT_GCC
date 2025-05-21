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
                Console.WriteLine($"Début de mise à jour des compétences pour l'évaluation {evaluationId}");
                
                // 1. Obtenir l'employeeId sans LINQ
                int employeeId = 0;
                try
                {
                    var evaluation = await _context.Evaluations
                        .AsNoTracking()  // Pour éviter le tracking inutile
                        .Select(e => new { e.EvaluationId, e.EmployeeId })
                        .FirstOrDefaultAsync(e => e.EvaluationId == evaluationId);
                    
                    if (evaluation != null)
                    {
                        employeeId = evaluation.EmployeeId;
                        Console.WriteLine($"EmployeeId trouvé: {employeeId}");
                    }
                    else
                    {
                        Console.WriteLine($"Évaluation {evaluationId} non trouvée");
                        return;
                    }
                }
                catch (Exception ex)
                {
                    Console.WriteLine($"Erreur lors de la récupération de l'employeeId: {ex.Message}");
                    return;
                }
                
                // 2. Obtenir les résultats d'évaluation par compétence
                List<EvaluationCompetenceResult> results = new List<EvaluationCompetenceResult>();
                try
                {
                    // Requête simplifiée sans relation
                    results = await _context.EvaluationCompetenceResults
                        .AsNoTracking()
                        .Where(r => r.EvaluationId == evaluationId)
                        .ToListAsync();
                    
                    Console.WriteLine($"Nombre de résultats de compétence trouvés: {results.Count}");
                    
                    if (results.Count == 0)
                    {
                        Console.WriteLine("Aucun résultat de compétence trouvé, fin du traitement");
                        return;
                    }
                }
                catch (Exception ex)
                {
                    Console.WriteLine($"Erreur lors de la récupération des résultats de compétence: {ex.Message}");
                    return;
                }
                
                // 3. Obtenir un domaine de compétence par défaut
                int defaultDomainId = 0;
                try
                {
                    // Requête SQL directe pour éviter les problèmes avec EF Core
                    using (var command = _context.Database.GetDbConnection().CreateCommand())
                    {
                        command.CommandText = "SELECT TOP 1 Domain_skill_id FROM Domain_skill WHERE Domain_skill_id > 0";
                        
                        if (command.Connection.State != System.Data.ConnectionState.Open)
                            await command.Connection.OpenAsync();
                            
                        using (var reader = await command.ExecuteReaderAsync())
                        {
                            if (await reader.ReadAsync())
                            {
                                defaultDomainId = reader.GetInt32(0);
                                Console.WriteLine($"Domaine par défaut trouvé: {defaultDomainId}");
                            }
                        }
                    }
                    
                    if (defaultDomainId == 0)
                    {
                        Console.WriteLine("Aucun domaine de compétence trouvé dans la base de données");
                        return;
                    }
                }
                catch (Exception ex)
                {
                    Console.WriteLine($"Erreur lors de la récupération du domaine par défaut: {ex.Message}");
                    return;
                }
                
                // 4. Traiter chaque résultat de compétence
                foreach (var result in results)
                {
                    try
                    {
                        // 4.1 Récupérer les informations de la ligne de compétence
                        int skillPositionId = 0;
                        int skillId = 0;
                        
                        // Récupérer le skillPositionId
                        try
                        {
                            using (var command = _context.Database.GetDbConnection().CreateCommand())
                            {
                                command.CommandText = "SELECT SkillPositionId FROM Competence_Lines WHERE CompetenceLineId = @id";
                                
                                var parameter = command.CreateParameter();
                                parameter.ParameterName = "@id";
                                parameter.Value = result.CompetenceLineId;
                                command.Parameters.Add(parameter);
                                
                                if (command.Connection.State != System.Data.ConnectionState.Open)
                                    await command.Connection.OpenAsync();
                                    
                                var value = await command.ExecuteScalarAsync();
                                if (value != null && value != DBNull.Value)
                                {
                                    skillPositionId = Convert.ToInt32(value);
                                    Console.WriteLine($"SkillPositionId trouvé: {skillPositionId}");
                                }
                            }
                            
                            if (skillPositionId == 0)
                            {
                                Console.WriteLine($"SkillPositionId non trouvé pour la compétence {result.CompetenceLineId}");
                                continue;
                            }
                        }
                        catch (Exception ex)
                        {
                            Console.WriteLine($"Erreur lors de la récupération du SkillPositionId: {ex.Message}");
                            continue;
                        }
                        
                        // Récupérer le skillId
                        try
                        {
                            using (var command = _context.Database.GetDbConnection().CreateCommand())
                            {
                                command.CommandText = "SELECT Skill_id FROM Skill_position WHERE Skill_position_id = @id";
                                
                                var parameter = command.CreateParameter();
                                parameter.ParameterName = "@id";
                                parameter.Value = skillPositionId;
                                command.Parameters.Add(parameter);
                                
                                if (command.Connection.State != System.Data.ConnectionState.Open)
                                    await command.Connection.OpenAsync();
                                    
                                var value = await command.ExecuteScalarAsync();
                                if (value != null && value != DBNull.Value)
                                {
                                    skillId = Convert.ToInt32(value);
                                    Console.WriteLine($"SkillId trouvé: {skillId}");
                                }
                            }
                            
                            if (skillId == 0)
                            {
                                Console.WriteLine($"SkillId non trouvé pour le SkillPosition {skillPositionId}");
                                continue;
                            }
                        }
                        catch (Exception ex)
                        {
                            Console.WriteLine($"Erreur lors de la récupération du SkillId: {ex.Message}");
                            continue;
                        }
                        
                        // 4.2 Vérifier si la compétence existe déjà pour cet employé
                        var existingSkill = await _context.EmployeeSkill
                            .AsNoTracking()
                            .FirstOrDefaultAsync(es => 
                                es.EmployeeId == employeeId && 
                                es.SkillId == skillId);
                                
                        double score = (double)result.Score;
                        
                        if (existingSkill != null)
                        {
                            // Mise à jour de la compétence existante
                            try
                            {
                                Console.WriteLine($"Mise à jour de la compétence existante {skillId} pour l'employé {employeeId}");
                                
                                using (var command = _context.Database.GetDbConnection().CreateCommand())
                                {
                                    command.CommandText = "UPDATE Employee_skill SET Level = @level, Updated_date = @date WHERE Employee_skill_id = @id";
                                    
                                    var p1 = command.CreateParameter();
                                    p1.ParameterName = "@level";
                                    p1.Value = score;
                                    command.Parameters.Add(p1);
                                    
                                    var p2 = command.CreateParameter();
                                    p2.ParameterName = "@date";
                                    p2.Value = DateTime.Now;
                                    command.Parameters.Add(p2);
                                    
                                    var p3 = command.CreateParameter();
                                    p3.ParameterName = "@id";
                                    p3.Value = existingSkill.EmployeeSkillId;
                                    command.Parameters.Add(p3);
                                    
                                    if (command.Connection.State != System.Data.ConnectionState.Open)
                                        await command.Connection.OpenAsync();
                                        
                                    var rowsAffected = await command.ExecuteNonQueryAsync();
                                    Console.WriteLine($"Compétence mise à jour, {rowsAffected} ligne(s) affectée(s)");
                                }
                            }
                            catch (Exception ex)
                            {
                                Console.WriteLine($"Erreur lors de la mise à jour de la compétence: {ex.Message}");
                            }
                        }
                        else
                        {
                            // Création d'une nouvelle compétence
                            try
                            {
                                Console.WriteLine($"Création d'une nouvelle compétence {skillId} pour l'employé {employeeId}");
                                
                                using (var command = _context.Database.GetDbConnection().CreateCommand())
                                {
                                    command.CommandText = @"
                                        INSERT INTO Employee_skill 
                                        (Domain_skill_id, Skill_id, Level, State, Creation_date, Updated_date, Employee_id) 
                                        VALUES (@domainId, @skillId, @level, 1, @date, @date, @employeeId)";
                                    
                                    var p1 = command.CreateParameter();
                                    p1.ParameterName = "@domainId";
                                    p1.Value = defaultDomainId;
                                    command.Parameters.Add(p1);
                                    
                                    var p2 = command.CreateParameter();
                                    p2.ParameterName = "@skillId";
                                    p2.Value = skillId;
                                    command.Parameters.Add(p2);
                                    
                                    var p3 = command.CreateParameter();
                                    p3.ParameterName = "@level";
                                    p3.Value = score;
                                    command.Parameters.Add(p3);
                                    
                                    var p4 = command.CreateParameter();
                                    p4.ParameterName = "@date";
                                    p4.Value = DateTime.Now;
                                    command.Parameters.Add(p4);
                                    
                                    var p5 = command.CreateParameter();
                                    p5.ParameterName = "@employeeId";
                                    p5.Value = employeeId;
                                    command.Parameters.Add(p5);
                                    
                                    if (command.Connection.State != System.Data.ConnectionState.Open)
                                        await command.Connection.OpenAsync();
                                        
                                    var rowsAffected = await command.ExecuteNonQueryAsync();
                                    Console.WriteLine($"Nouvelle compétence créée, {rowsAffected} ligne(s) affectée(s)");
                                }
                            }
                            catch (Exception ex)
                            {
                                Console.WriteLine($"Erreur lors de la création de la compétence: {ex.Message}");
                            }
                        }
                    }
                    catch (Exception ex)
                    {
                        Console.WriteLine($"Erreur lors du traitement du résultat {result.CompetenceLineId}: {ex.Message}");
                    }
                }
                
                Console.WriteLine($"Mise à jour des compétences terminée pour l'employé {employeeId}");
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Erreur dans UpdateEmployeeSkillsAfterEvaluation: {ex.Message}");
                Console.WriteLine(ex.StackTrace);
            }
        }


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