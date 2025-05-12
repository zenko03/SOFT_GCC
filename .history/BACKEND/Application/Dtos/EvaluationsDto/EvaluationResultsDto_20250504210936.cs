using System.Text.Json.Serialization;

namespace soft_carriere_competence.Application.Dtos.EvaluationsDto
{
    /// <summary>
    /// DTO pour l'envoi des résultats d'évaluation
    /// </summary>
    public class EvaluationResultsDto
    {
        /// <summary>
        /// ID de l'évaluation
        /// </summary>
        public int EvaluationId { get; set; }

        /// <summary>
        /// Notation simple par question (ID de question -> note)
        /// Pour maintenir la compatibilité avec l'ancien système
        /// </summary>
        public Dictionary<int, int> Ratings { get; set; } = new Dictionary<int, int>();

        /// <summary>
        /// Notations multicritères détaillées par question (optionnel)
        /// </summary>
        [JsonIgnore(Condition = JsonIgnoreCondition.WhenWritingNull)]
        public List<MultiCriteriaRatingDto>? DetailedRatings { get; set; }

        /// <summary>
        /// Score global de l'évaluation
        /// </summary>
        public decimal OverallScore { get; set; }

        /// <summary>
        /// Points forts identifiés
        /// </summary>
        public string? Strengths { get; set; }

        /// <summary>
        /// Points à améliorer identifiés
        /// </summary>
        public string? Weaknesses { get; set; }

        /// <summary>
        /// Évaluation générale / remarques globales
        /// </summary>
        public string? GeneralEvaluation { get; set; }

        /// <summary>
        /// Méthode utilitaire pour extraire les notes détaillées
        /// </summary>
        /// <returns>Liste des notes détaillées ou null si non disponible</returns>
        public List<MultiCriteriaRatingDto>? GetDetailedRatings()
        {
            return DetailedRatings;
        }

        /// <summary>
        /// Vérifie si des notations détaillées sont disponibles
        /// </summary>
        /// <returns>true si des notations détaillées sont présentes</returns>
        public bool HasDetailedRatings()
        {
            return DetailedRatings != null && DetailedRatings.Count > 0;
        }

        /// <summary>
        /// Synchronise les notes simples et détaillées pour assurer la cohérence
        /// </summary>
        public void SynchronizeRatings()
        {
            if (!HasDetailedRatings())
                return;

            foreach (var detailedRating in DetailedRatings)
            {
                if (detailedRating.QuestionId <= 0)
                    continue;

                // Calculer la note globale à partir des critères
                detailedRating.OverallRating = detailedRating.CalculateOverallRating();

                // Synchroniser avec le dictionnaire des notes simples
                Ratings[detailedRating.QuestionId] = (int)Math.Round(detailedRating.OverallRating);
            }
        }
    }
}
