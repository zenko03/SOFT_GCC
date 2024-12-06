using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace soft_carriere_competence.Core.Entities.Evaluations
{
    [Table("Evaluations")]
    public class Evaluation
    {
        [Key]
        [Column("evaluations_id")]
        public int EvaluationId { get; set; }
        [Column("evaluationType_id")]
        public int EvaluationTypeId { get; set; }

        public int UserId { get; set; }

        public int SupervisorId { get; set; }

        [Column(TypeName = "date")]
        public DateTime StartDate { get; set; }

        [Column(TypeName = "date")]
        public DateTime EndDate { get; set; }

        [Column("overallScore",TypeName = "decimal(5, 2)")]
        public decimal? OverallScore { get; set; }
        [Column("comments")]

        public string? Comments { get; set; }
        [Column("actionPlan")]
        public string? ActionPlan { get; set; }

        [Column("IsServiceApproved ")]
        public bool? IsServiceApproved {  get; set; }
        [Column("isDgApproved")]
        public bool? isDgApproved {  get; set; }

        [Column("serviceApprovalDate")]
        public DateTime? serviceApprovalDate {  get; set; }
        [Column("dgApprovalDate")]
        public DateTime? dgApprovalDate {  get; set; }


        [ForeignKey("EvaluationTypeId")]
        public EvaluationType EvaluationType { get; set; }

        [ForeignKey("UserId")]
        public User User { get; set; }

        [ForeignKey("SupervisorId")]
        public User Supervisor { get; set; }
        [Column("state")]
        public int state {  get; set; }
    }
}
