using System.ComponentModel.DataAnnotations.Schema;
using System.ComponentModel.DataAnnotations;

namespace soft_carriere_competence.Core.Entities.Evaluations
{
    [Table("Training_suggestions")]
    public class TrainingSuggestion
    {
        [Key]
        public int TrainingSuggestionId { get; set; }

        public int EvaluationId { get; set; }

        [MaxLength(255)]
        public string Training { get; set; }

        public string Details { get; set; }

        [ForeignKey("EvaluationId")]
        public Evaluation Evaluation { get; set; }
    }
}
