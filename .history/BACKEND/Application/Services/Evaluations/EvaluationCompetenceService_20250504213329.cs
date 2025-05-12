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
                // 1. Récupérer l'évaluation avec l'utilisateur associé
                var evaluation = await _context.Evaluations
                    .Include(e => e.User)
                    .FirstOrDefaultAsync(e => e.EvaluationId == evaluationId);

                if (evaluation == null)
                {
                    throw new Exception($"Évaluation avec ID {evaluationId} non trouvée.");
                }

                int userId = evaluation.UserId;

                // 2. Récupérer toutes les questions associées à cette évaluation
                var selectedQuestions = await _context.evaluationSelectedQuestions
                    .Where(esq => esq.EvaluationId == evaluationId)
                    .ToListAsync();

                // Vérifier que nous avons des questions avec différentes compétences
                var distinctCompetences = selectedQuestions
                    .Select(sq => sq.CompetenceLineId)
                    .Distinct()
                    .ToList();

                Console.WriteLine($"Nombre de compétences distinctes dans l'évaluation: {distinctCompetences.Count}");
                Console.WriteLine($"Compétences trouvées: {string.Join(", ", distinctCompetences)}");

                if (distinctCompetences.Count <= 1)
                {
                    Console.WriteLine("ATTENTION: Toutes les questions sont associées à la même compétence!");
                }

                // 3. Récupérer toutes les réponses pour cette évaluation
                var responses = await _context.evaluationResponses
                    .Where(er => er.EvaluationId == evaluationId)
                    .ToListAsync();

                Console.WriteLine($"Nombre de réponses trouvées: {responses.Count}");

                // 4. Regrouper les réponses par compétence
                var competenceResults = new Dictionary<int, List<(int QuestionId, decimal Score)>>();

                foreach (var response in responses)
                {
                    // Trouver la question sélectionnée correspondante pour avoir le bon CompetenceLineId
                    var selectedQuestion = selectedQuestions.FirstOrDefault(sq => sq.QuestionId == response.QuestionId);
                    if (selectedQuestion != null)
                    {
                        int competenceId = selectedQuestion.CompetenceLineId;

                        // Extraire le score de la réponse
                        decimal score = 0;
                        if (response.ResponseType == "SCORE")
                        {
                            decimal.TryParse(response.ResponseValue, out score);
                        }
                        else if (response.ResponseType == "MULTI_CRITERIA")
                        {
                            try
                            {
                                // Transformer la réponse JSON en objet MultiCriteriaRatingDto
                                var multiCriteriaRating = System.Text.Json.JsonSerializer.Deserialize<MultiCriteriaRatingDto>(response.ResponseValue);
                                if (multiCriteriaRating != null)
                                {
                                    score = multiCriteriaRating.OverallRating;
                                }
                            }
                            catch (Exception ex)
                            {
                                Console.WriteLine($"Erreur lors de la désérialisation de la réponse: {ex.Message}");
                            }
                        }

                        Console.WriteLine($"Question ID: {response.QuestionId}, Compétence ID: {competenceId}, Score: {score}");

                        // Ajouter à la liste des scores par compétence
                        if (!competenceResults.ContainsKey(competenceId))
                        {
                            competenceResults[competenceId] = new List<(int, decimal)>();
                        }
                        competenceResults[competenceId].Add((response.QuestionId, score));
                    }
                    else
                    {
                        Console.WriteLine($"ATTENTION: Question ID {response.QuestionId} non trouvée dans les questions sélectionnées");
                    }
                }

                // 5. Supprimer les anciennes entrées pour cette évaluation
                var existingResults = await _context.EvaluationCompetenceResults
                    .Where(ecr => ecr.EvaluationId == evaluationId)
                    .ToListAsync();

                if (existingResults.Any())
                {
                    _context.EvaluationCompetenceResults.RemoveRange(existingResults);
                    await _context.SaveChangesAsync();
                }

                // 6. Calculer les moyennes et enregistrer les résultats par compétence
                foreach (var competenceEntry in competenceResults)
                {
                    int competenceId = competenceEntry.Key;
                    var scoresList = competenceEntry.Value;

                    Console.WriteLine($"Compétence ID: {competenceId}");
                    Console.WriteLine($"Nombre de questions: {scoresList.Count}");
                    Console.WriteLine($"Scores: {string.Join(", ", scoresList.Select(s => s.Score))}");

                    if (scoresList.Any())
                    {
                        decimal averageScore = scoresList.Average(item => item.Score);
                        Console.WriteLine($"Score moyen calculé: {averageScore}");

                        // Créer une nouvelle entrée de résultat
                        var competenceResult = new EvaluationCompetenceResult
                        {
                            EvaluationId = evaluationId,
                            UserId = userId,
                            CompetenceLineId = competenceId,
                            Score = Math.Round(averageScore, 2),
                            CreatedAt = DateTime.UtcNow,
                            State = 1 // Actif
                        };

                        await _context.EvaluationCompetenceResults.AddAsync(competenceResult);
                    }
                }

                await _context.SaveChangesAsync();
                return true;
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Erreur dans CalculateAndSaveCompetenceResultsAsync: {ex.Message}");
                throw;
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
                var results = await _context.EvaluationCompetenceResults
                    .Where(ecr => ecr.EvaluationId == evaluationId)
                    .ToListAsync();

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