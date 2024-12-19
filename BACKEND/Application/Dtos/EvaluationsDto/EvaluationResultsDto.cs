namespace soft_carriere_competence.Application.Dtos.EvaluationsDto
{
    public class EvaluationResultsDto
    {
        public int EvaluationId { get; set; }
        public Dictionary<int, int> Ratings { get; set; }
        public decimal OverallScore { get; set; }
        public string Strengths { get; set; }
        public string Weaknesses { get; set; }
        public string GeneralEvaluation { get; set; }
    }
}
