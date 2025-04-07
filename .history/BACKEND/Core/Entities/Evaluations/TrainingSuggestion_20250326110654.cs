using System.ComponentModel.DataAnnotations.Schema;
using System.ComponentModel.DataAnnotations;

namespace soft_carriere_competence.Core.Entities.Evaluations
{
    [Table("Training_suggestions")]
    public class TrainingSuggestion
    {
        [Key]
        [Column("Training_suggestion_id")]
        public int TrainingSuggestionId { get; set; }

        [Column("evaluationTypeId")]
        public int? EvaluationTypeId { get; set; }

        [Column("questionId")]
        public int? QuestionId { get; set; }

        [Required]
        [MaxLength(255)]
        [Column("training")]
        public string Training { get; set; }

        [Column("details")]
        public string Details { get; set; }

        [Column("scoreThreshold")]
        public int ScoreThreshold { get; set; } = 2;

        [Column("CompetenceLineId")]
        public int? CompetenceLineId { get; set; }

        [Column("TrainingId")]
        public int? TrainingId { get; set; }

        [Column("state")]
        public int State { get; set; } = 1;

        // Navigation properties
        public virtual EvaluationType EvaluationType { get; set; }
        public virtual EvaluationQuestion Question { get; set; }
        public virtual CompetenceLine CompetenceLine { get; set; }
        public virtual CompetenceTraining CompetenceTraining { get; set; }
    }
}
