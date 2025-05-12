using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace soft_carriere_competence.Core.Entities.Evaluations
{
    [Table("Evaluation_Responses")]
    public class EvaluationResponses
    {
        [Key]
        [Column("ResponseId")]
        public int EvaluationResponseId { get; set; }
        public int EvaluationId { get; set; }
        public int QuestionId { get; set; }
        public string Response { get; set; }
        public DateTime ResponseDate { get; set; }
    }
}
