using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using soft_carriere_competence.Core.Entities.crud_career;

namespace soft_carriere_competence.Core.Entities.Evaluations
{
    [Table("Competence_Lines")]
    public class CompetenceLine
    {
        [Key]
        [Column("CompetenceLineId")]
        public int CompetenceLineId { get; set; }

        [Required]
        [Column("PositionId")]
        public int PositionId { get; set; }

        [Required]
        [MaxLength(100)]
        [Column("CompetenceName")]
        public string CompetenceName { get; set; }

        [MaxLength(255)]
        [Column("Description")]
        public string Description { get; set; }

        [Column("state")]
        public int State { get; set; } = 1;
        [ForeignKey("PositionId")]
        public Position position { get; set; }

        // Navigation properties
        public virtual ICollection<EvaluationQuestion> EvaluationQuestions { get; set; }
        public virtual ICollection<TrainingSuggestion> TrainingSuggestions { get; set; }
        public virtual ICollection<CompetenceTraining> CompetenceTrainings { get; set; }
    }
} 