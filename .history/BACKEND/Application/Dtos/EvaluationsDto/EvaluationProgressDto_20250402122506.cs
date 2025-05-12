namespace soft_carriere_competence.Application.Dtos.EvaluationsDto
{
    public class EvaluationProgressDto
    {
        public int UserId { get; set; }
        public int TotalQuestions { get; set; }
        public int AnsweredQuestions { get; set; }
        public double ProgressPercentage { get; set; }
    }
} 