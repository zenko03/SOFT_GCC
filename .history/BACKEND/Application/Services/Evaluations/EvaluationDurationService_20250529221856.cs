using Microsoft.EntityFrameworkCore;
using soft_carriere_competence.Application.Dtos.EvaluationsDto;
using soft_carriere_competence.Core.Entities.Evaluations;
using soft_carriere_competence.Infrastructure.Data;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace soft_carriere_competence.Application.Services.Evaluations
{
    public class EvaluationDurationService
    {
        private readonly ApplicationDbContext _context;

        public EvaluationDurationService(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<DurationRecommendationDto> CalculateRecommendedDurationAsync(CalculateDurationRequestDto request)
        {
            // Récupérer les données historiques si disponibles
            var historicalData = await GetHistoricalCompletionDataAsync(
                request.EvaluationTypeId, 
                request.PositionIds
            );

            // Calculer la durée de base (approche logarithmique plus réaliste)
            int baseDays = CalculateBaseDuration(request.EmployeeCount);

            // Récupérer le facteur lié au type d'évaluation
            double typeFactor = await GetEvaluationTypeFactorAsync(request.EvaluationTypeId);

            // Calculer le facteur de complexité basé sur le nombre de questions/compétences
            double complexityFactor = CalculateComplexityFactor(
                request.AverageQuestionsPerEmployee ?? 10,
                request.TotalCompetences ?? 3
            );

            // Calculer le facteur lié au nombre de superviseurs
            double supervisorFactor = CalculateSupervisorFactor(request.SupervisorCount);

            // Ajuster en fonction des données historiques
            double historicalAdjustment = historicalData?.AdjustmentFactor ?? 1.0;

            // Calculer le nombre de jours recommandé
            int recommendedDays = (int)Math.Ceiling(baseDays * typeFactor * complexityFactor * supervisorFactor * historicalAdjustment);
            
            // Plafonner à une valeur raisonnable
            recommendedDays = Math.Min(recommendedDays, 21); // Maximum 3 semaines
            
            // Calculer le nombre de semaines de façon plus intuitive (division entière)
            int recommendedWeeks = recommendedDays / 7;
            int remainingDays = recommendedDays % 7;
            
            // Si nous avons des jours restants et qu'ils sont plus de 5, on arrondit à la semaine supérieure
            if (remainingDays >= 5)
            {
                recommendedWeeks++;
                remainingDays = 0;
            }

            // Vérifier si la durée actuelle est suffisante
            bool isCurrentDurationSufficient = true;
            if (request.CurrentDurationDays.HasValue)
            {
                isCurrentDurationSufficient = request.CurrentDurationDays.Value >= recommendedDays;
            }

            // Générer les facteurs considérés pour l'explication
            var factorsConsidered = new List<string>
            {
                $"Nombre d'employés: {request.EmployeeCount}",
                $"Type d'évaluation: {await GetEvaluationTypeNameAsync(request.EvaluationTypeId)}",
                $"Complexité: {request.AverageQuestionsPerEmployee ?? 10} questions par employé en moyenne",
                $"Compétences: {request.TotalCompetences ?? 3} compétences évaluées",
                $"Superviseurs: {request.SupervisorCount} superviseur{(request.SupervisorCount > 1 ? "s" : "")}"
            };

            // Ajouter des informations sur les données historiques si disponibles
            if (historicalData != null)
            {
                factorsConsidered.Add($"Données historiques: {historicalData.CompletedEvaluationsCount} évaluations analysées");
            }

            return new DurationRecommendationDto
            {
                Days = recommendedDays,
                Weeks = recommendedWeeks,
                RemainingDays = remainingDays,
                WeeksDisplay = FormatWeeksAndDays(recommendedWeeks, remainingDays),
                IsCurrentDurationSufficient = isCurrentDurationSufficient,
                Justification = GenerateJustification(request.EmployeeCount, request.EvaluationTypeId, recommendedDays, request.SupervisorCount),
                FactorsConsidered = factorsConsidered
            };
        }

        private int CalculateBaseDuration(int employeeCount)
        {
            // Durée minimale (5 jours = 1 semaine) même pour un seul employé
            const int baseMinimum = 5;
            
            if (employeeCount <= 1)
                return baseMinimum;
                
            // Approche logarithmique plus réaliste:
            // - Croissance rapide pour les premiers employés
            // - Puis croissance plus lente pour éviter des durées excessives
            int additionalDays = (int)Math.Ceiling(2 * Math.Log(employeeCount, 2));
            
            return Math.Min(baseMinimum + additionalDays, 15); // Maximum 15 jours (environ 2 semaines)
        }

        private async Task<double> GetEvaluationTypeFactorAsync(int evaluationTypeId)
        {
            // Facteurs plus réalistes par type d'évaluation
            var evaluationTypeFactors = new Dictionary<int, double>
            {
                { 1, 1.2 }, // Évaluation annuelle (moins élevé que précédemment)
                { 2, 1.1 }, // Évaluation de performance
                { 3, 1.1 }, // Évaluation de compétences
                { 4, 0.8 }, // Évaluation de progression (plus courte)
                { 5, 1.0 }  // Autre (valeur par défaut)
            };

            // Vérifier si le type d'évaluation existe
            bool exists = await _context.EvaluationTypes.AnyAsync(et => et.EvaluationTypeId == evaluationTypeId);
            
            // Utiliser le facteur correspondant ou 1.0 par défaut
            if (exists && evaluationTypeFactors.ContainsKey(evaluationTypeId))
                return evaluationTypeFactors[evaluationTypeId];
                
            return 1.0; // Valeur par défaut
        }

        private double CalculateComplexityFactor(int averageQuestionCount, int competenceCount)
        {
            // Facteur basé sur le nombre moyen de questions (plafonné pour éviter l'inflation)
            double questionsFactor = Math.Min(1.3, 0.9 + (averageQuestionCount / 30.0));
            
            // Facteur basé sur le nombre de compétences (impact moindre)
            double competenceFactor = Math.Min(1.2, 0.9 + (competenceCount / 15.0));
            
            // Moyenne des deux facteurs pour un effet plus modéré
            return (questionsFactor + competenceFactor) / 2.0;
        }

        private double CalculateSupervisorFactor(int supervisorCount)
        {
            // Plus il y a de superviseurs, plus le facteur est petit (ce qui réduit la durée nécessaire)
            // Cependant, on limite l'effet pour éviter des durées trop courtes
            if (supervisorCount <= 1)
                return 1.0; // Pas de réduction pour un seul superviseur
                
            // Formule logarithmique pour un effet diminuant avec chaque superviseur supplémentaire
            // Par exemple : 2 superviseurs → 0.85, 3 superviseurs → 0.75, 4 superviseurs → 0.7, etc.
            return Math.Max(0.65, 1.0 - (0.15 * Math.Log10(supervisorCount + 1)));
        }

        private async Task<string> GetEvaluationTypeNameAsync(int evaluationTypeId)
        {
            var evaluationType = await _context.EvaluationTypes
                .FirstOrDefaultAsync(et => et.EvaluationTypeId == evaluationTypeId);
                
            return evaluationType?.Designation ?? "Type d'évaluation standard";
        }

        private string GenerateJustification(int employeeCount, int evaluationTypeId, int recommendedDays, int supervisorCount)
        {
            string employeeText = employeeCount > 1 ? $"{employeeCount} employés" : "un employé";
            string supervisorText = supervisorCount > 1 ? $" avec {supervisorCount} superviseurs" : "";
            
            return $"Une durée de {recommendedDays} jours est recommandée pour évaluer {employeeText}{supervisorText} " +
                   $"de manière approfondie tout en permettant une charge de travail raisonnable " +
                   $"pour les évaluateurs et une réflexion adéquate pour les employés.";
        }

        private string FormatWeeksAndDays(int weeks, int days)
        {
            if (weeks == 0)
            {
                return $"{days} jour{(days > 1 ? "s" : "")}";
            }
            else if (days == 0)
            {
                return $"{weeks} semaine{(weeks > 1 ? "s" : "")}";
            }
            else
            {
                return $"{weeks} semaine{(weeks > 1 ? "s" : "")} et {days} jour{(days > 1 ? "s" : "")}";
            }
        }

        private class HistoricalData
        {
            public int CompletedEvaluationsCount { get; set; }
            public double AverageDurationDays { get; set; }
            public double AdjustmentFactor { get; set; }
        }

        private async Task<HistoricalData> GetHistoricalCompletionDataAsync(int evaluationTypeId, List<int> positionIds)
        {
            // Récupérer les évaluations terminées avec des dates de complétion
            var completedEvaluations = await _context.Evaluations
                .Where(e => e.EvaluationTypeId == evaluationTypeId &&
                       e.state == 20 && // État terminé
                       e.completionDate != null &&
                       e.StartDate != null)
                .Select(e => new
                {
                    e.StartDate,
                    CompletionDate = e.completionDate.Value,
                    EmployeeId = e.EmployeeId
                })
                .ToListAsync();

            if (completedEvaluations.Count < 3)
                return null; // Pas assez de données historiques

            // Calculer la durée moyenne réelle
            double averageDurationDays = completedEvaluations
                .Select(e => (e.CompletionDate - e.StartDate).TotalDays)
                .Average();
                
            // Si trop différent de notre modèle, limiter l'influence
            double adjustmentFactor = 1.0;
            if (averageDurationDays > 5) // Seulement si on a des données significatives
            {
                // Limiter l'influence à +/- 20%
                adjustmentFactor = Math.Max(0.8, Math.Min(1.2, averageDurationDays / 10.0));
            }

            return new HistoricalData
            {
                CompletedEvaluationsCount = completedEvaluations.Count,
                AverageDurationDays = averageDurationDays,
                AdjustmentFactor = adjustmentFactor
            };
        }
    }
} 