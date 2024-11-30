using System.ComponentModel.DataAnnotations.Schema;
using System.ComponentModel.DataAnnotations;

namespace soft_carriere_competence.Core.Entities.Evaluations
{
    [Table("Evaluation_schedules")]
    public class EvaluationSchedule
    {
        [Key]
        public int EvaluationScheduleId { get; set; }

        public int UserId { get; set; }

        [Column(TypeName = "date")]
        public DateTime StartDate { get; set; }

        [Column(TypeName = "date")]
        public DateTime EndDate { get; set; }

        public bool EmailSent { get; set; } = false;

        [MaxLength(255)]
        public string EmailSubject { get; set; }

        public string EmailBody { get; set; }

        [ForeignKey("UserId")]
        public User User { get; set; }
    }
}
