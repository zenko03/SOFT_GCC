using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace soft_carriere_competence.Core.Entities.Evaluations
{
    [Table("Evaluation_progress")]
    public class EvaluationProgress
    {
        [Key]
        [Column("Progress_id")]
        public int ProgressId { get; set; }
        [Column("evaluationId")]
        public int evaluationId { get; set; }
        [Column("userId")]
        public int userId { get; set; }
        [Column("totalQuestions")]
        public int totalQuestions { get; set; }
        [Column("answeredQuestions")]
        public int answeredQuestions { get; set; }
        [Column("progressPercentage")]
        public double progressPercentage { get; set; }
        [Column("lastUpdate")]
        public DateTime lastUpdate { get; set; }

        [ForeignKey("evaluationId")]
        public Evaluation evaluation { get; set; }
        [ForeignKey("userId")]
        public User user { get; set; }
    }
}
