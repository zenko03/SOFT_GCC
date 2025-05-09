using soft_carriere_competence.Application.Dtos.EvaluationsDto;
using soft_carriere_competence.Core.Entities.Evaluations;
using soft_carriere_competence.Core.Interface;
using soft_carriere_competence.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;
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

                // 1. Récupérer l'évaluation avec l'utilisateur associé
                var evaluation = await _context.Evaluations
                    .Include(e => e.User)
                    .FirstOrDefaultAsync(e => e.EvaluationId == evaluationId);

                if (evaluation == null)
                {
                    throw new Exception($"Évaluation avec ID {evaluationId} non trouvée.");
                }

                int userId = evaluation.UserId;
                decimal overallScore = evaluation.OverallScore;

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
                        UserId = userId,
                        CompetenceLineId = competenceId,
                        Score = overallScore,
                        CreatedAt = DateTime.UtcNow,
                        State = 1 // Actif
                    };

                    await _context.EvaluationCompetenceResults.AddAsync(competenceResult);
                }

                await _context.SaveChangesAsync();
                Console.WriteLine("Calcul et sauvegarde des résultats par compétence terminés avec succès");
                return true;
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Erreur dans CalculateAndSaveCompetenceResultsAsync: {ex.Message}");
                throw;
            }
        }

        /// <summary>
        /// Récupère les résultats de compétences pour un utilisateur
        /// </summary>
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

        /// <summary>
        /// Récupère les résultats de compétences pour une évaluation spécifique
        /// </summary>
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

        /// <summary>
        /// Récupère l'historique des résultats de compétence pour un utilisateur et une compétence spécifique
        /// </summary>
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