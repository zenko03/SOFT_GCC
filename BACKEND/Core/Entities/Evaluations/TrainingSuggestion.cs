using System.ComponentModel.DataAnnotations.Schema;
using System.ComponentModel.DataAnnotations;

namespace soft_carriere_competence.Core.Entities.Evaluations
{
    [Table("Training_suggestions")]
    public class TrainingSuggestion
    {
        [Key]
        [Column("TrainingSuggestionsId")]
        public int TrainingSuggestionId { get; set; }
        [Column("evaluationId")]
        public int EvaluationId { get; set; }

        [MaxLength(255)]
        [Column("training")]
        public string Training { get; set; }
        [Column("details")]

        public string Details { get; set; }
        [Column("scoreThreshold")]
        public int scoreThreshold {  get; set; }
        [ForeignKey("EvaluationId")]
        public Evaluation Evaluation { get; set; }
    }
}
