using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace soft_carriere_competence.Core.Entities.Evaluations
{
    [Table("EvaluationSupervisors")]
    public class EvaluationSupervisors
    {
        [Key]
        [Column("EvaluationId")]
        public int EvaluationId { get; set; }

        [Key]
        [Column("SupervisorId")]
        public int SupervisorId { get; set; }

        [ForeignKey("EvaluationId")]
        public Evaluation Evaluation { get; set; }

        [ForeignKey("SupervisorId")]
        public User Supervisor { get; set; }
    }
}
