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

        [Column(TypeName = "decimal(5, 2)")]
        public decimal OverallScore { get; set; }

        public string Comments { get; set; }

        public string ActionPlan { get; set; }
       

        [ForeignKey("EvaluationTypeId")]
        public EvaluationType EvaluationType { get; set; }

        [ForeignKey("UserId")]
        public User User { get; set; }

        [ForeignKey("SupervisorId")]
        public User Supervisor { get; set; }
    }
}
