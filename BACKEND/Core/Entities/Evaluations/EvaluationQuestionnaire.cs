using System.ComponentModel.DataAnnotations.Schema;
using System.ComponentModel.DataAnnotations;

namespace soft_carriere_competence.Core.Entities.Evaluations
{
    [Table("Evaluation_questionnaire")]
    public class EvaluationQuestionnaire
    {
        [Key]
        public int EvaluationQuestionnaireId { get; set; }

        public int EvaluationId { get; set; }

        [MaxLength(255)]
        public string Question { get; set; }

        [Column(TypeName = "decimal(5, 2)")]
        public decimal Score { get; set; }

        public string Comments { get; set; }

        [ForeignKey("EvaluationId")]
        public Evaluation Evaluation { get; set; }
    }
}
