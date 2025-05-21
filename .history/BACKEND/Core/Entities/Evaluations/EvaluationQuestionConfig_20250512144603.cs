using System.ComponentModel.DataAnnotations.Schema;
using System.ComponentModel.DataAnnotations;

namespace soft_carriere_competence.Core.Entities.Evaluations
{
    [Table("Evaluation_question_config")]
    public class EvaluationQuestionConfig
    {
        [Key]
        [Column("evaluation_question_config_id")]
        public int EvaluationQuestionConfigId { get; set; }

        [Column("questionId")]
        public int questionId {  get; set; }

        [Column("maxTimeInMinutes")]
        public int MaxTimeInMinutes { get; set; }

        [ForeignKey("questionId")]
        public EvaluationQuestion evaluationQuestion { get; set; }


    }
}
