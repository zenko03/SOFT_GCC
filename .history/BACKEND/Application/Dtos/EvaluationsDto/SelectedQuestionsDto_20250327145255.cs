using System.Collections.Generic;

namespace soft_carriere_competence.Application.Dtos.EvaluationsDto
{
    public class SelectedQuestionsDto
    {
        public int EmployeeId { get; set; }
        public int EvaluationTypeId { get; set; }
        public List<int> SelectedQuestionIds { get; set; }
    }

    public class CreateEvaluationWithQuestionsDto
    {
        public List<SelectedQuestionsDto> EmployeeQuestions { get; set; }
        public List<int> SupervisorIds { get; set; }
        public DateTime StartDate { get; set; }
        public DateTime EndDate { get; set; }
    }
} 