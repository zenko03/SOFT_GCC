using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace soft_carriere_competence.Core.Entities.Evaluations
{
    [Table("EvaluationSupervisors")]
    public class EvaluationSupervisors
    {
        [Required]
        [Column("EvaluationId")]
        public int EvaluationId { get; set; }

        [Required]
        [Column("SupervisorId")]
        public int SupervisorId { get; set; }

        [ForeignKey("EvaluationId")]
        public virtual Evaluation Evaluation { get; set; }

        [ForeignKey("SupervisorId")]
        public virtual User Supervisor { get; set; }
    }
} 