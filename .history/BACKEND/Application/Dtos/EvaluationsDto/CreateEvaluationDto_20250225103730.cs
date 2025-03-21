namespace soft_carriere_competence.Application.Dtos.EvaluationsDto
{
    public class CreateEvaluationDto
    {
        public int UserId { get; set; }
        public int EvaluationTypeId { get; set; }
        public int SupervisorId { get; set; }
        public DateTime StartDate { get; set; }
        public DateTime EndDate { get; set; }
        public int state { get; set; }
    }
}
