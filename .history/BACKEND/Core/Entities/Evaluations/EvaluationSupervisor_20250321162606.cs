using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace soft_carriere_competence.Core.Entities.Evaluations
{
    [Table("EvaluationSupervisors")]
    public class EvaluationSupervisor
    {
        [Required]
        public int EvaluationId { get; set; }

        [Required]
        public int SupervisorId { get; set; }

        [ForeignKey("EvaluationId")]
        public virtual Evaluation Evaluation { get; set; }

        [ForeignKey("SupervisorId")]
        public virtual User Supervisor { get; set; }
    }
} 