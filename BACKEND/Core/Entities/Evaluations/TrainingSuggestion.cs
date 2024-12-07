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
        [Column("evaluationTypeId")]
        public int evaluationTypeId { get; set; }
        [Column("questionId")]
        public int questionId {  get; set; }

        [MaxLength(255)]
        [Column("training")]
        public string Training { get; set; }
        [Column("details")]
        public string Details { get; set; }
        [Column("state")]
        public string state {  get; set; }
        [Column("scoreThreshold")]
        public int scoreThreshold {  get; set; }
        [ForeignKey("evaluationTypeId")]
        public EvaluationType evaluationType { get; set; }
        [ForeignKey("questionId")]
        public EvaluationQuestion evaluationQuestion {  get; set; }
    }
}
