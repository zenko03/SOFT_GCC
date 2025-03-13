namespace soft_carriere_competence.Application.Dtos.EvaluationsDto
{
    public class UpdateProgressRequestDto
    {
        public int EvaluationId { get; set; }
        public int UserId { get; set; }
        public int AnsweredQuestions { get; set; }
    }
}
