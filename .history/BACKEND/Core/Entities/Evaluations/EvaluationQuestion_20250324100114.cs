using soft_carriere_competence.Core.Entities.crud_career;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace soft_carriere_competence.Core.Entities.Evaluations
{
    [Table("evaluation_questions")]
    public class EvaluationQuestion
    {

        [Key]
        [Column("Question_id")]
        public int questiondId { get; set; }
        [Column("evaluationTypeId")]
        public int evaluationTypeId { get; set; }
        [Column("positionId")]
        public int positionId {  get; set; }
        [Column("question")]
        public string question {  get; set; }

        [ForeignKey("evaluationTypeId")]
        public EvaluationType EvaluationType { get; set; }
        [ForeignKey("positionId")]
        public Position position { get; set; }


    }
}
