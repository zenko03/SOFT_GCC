namespace soft_carriere_competence.Core.Entities.Evaluations
{
    public class VEmployeeWithoutEvaluation
    {
        public int? EmployeeId { get; set; }
        public string? FirstName { get; set; }
        public string? LastName { get; set; }
        public string? Position { get; set; }
        public int? positionId {  get; set; }
        public string? Department { get; set; }
        public DateTime? startDate {  get; set; }
        public DateTime? endDate { get; set; }
        public int? DepartmentId {  get; set; }
        public int? state {  get; set; }
    }
}
