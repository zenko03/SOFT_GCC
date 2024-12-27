namespace soft_carriere_competence.Core.Entities.Evaluations
{
    public class VEmployeesFinishedEvaluation
    {
        public int? EmployeeId { get; set; }
        public string? FirstName { get; set; }
        public string? LastName { get; set; }
        public string? Position { get; set; }
        public int? postId { get; set; }
        public string? Department { get; set; }
        public DateTime? startDate { get; set; }
        public DateTime? endDate { get; set; }
        public int? DepartmentId { get; set; }
        public int? state { get; set; }
        public string? weaknesses { get; set; }
        public string? strengths { get; set; }
        public string? comments {  get; set; }
        public DateTime? InterviewDate {  get; set; }
        public int? InterviewStatus { get; set; }
        public int? evaluationId {  get; set; }
    }
}
