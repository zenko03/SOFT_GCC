namespace soft_carriere_competence.Application.Dtos.EvaluationsDto
{
    public class CreateEvaluationWithQuestionsDto
    {
        public int EvaluationTypeId { get; set; }
        public List<int> SupervisorIds { get; set; }
        public DateTime StartDate { get; set; }
        public DateTime EndDate { get; set; }
        public bool EnableReminders { get; set; } = false;
        public List<EmployeeQuestionDto> EmployeeQuestions { get; set; }
    }

    public class EmployeeQuestionDto
    {
        public int EmployeeId { get; set; }
        public int EvaluationTypeId { get; set; }
        public int PositionId { get; set; }
        public List<QuestionCompetenceDto> SelectedQuestions { get; set; }
    }

    public class QuestionCompetenceDto
    {
        public int QuestionId { get; set; }
        public int? CompetenceLineId { get; set; }
    }
} 