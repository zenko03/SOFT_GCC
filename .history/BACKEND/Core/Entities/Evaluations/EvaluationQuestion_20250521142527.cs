using soft_carriere_competence.Core.Entities.crud_career;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text.Json.Serialization;

namespace soft_carriere_competence.Core.Entities.Evaluations
{
    [Table("Evaluation_questions")]
    public class EvaluationQuestion
    {
        [Key]
        [Column("Question_id")]
        public int questionId { get; set; }
        [Column("evaluationTypeId")]
        public int evaluationTypeId { get; set; }
        [Column("positionId")]
        public int positionId { get; set; }
        [Column("CompetenceLineId")]
        public int? CompetenceLineId { get; set; }
        [Column("question")]
        public string question { get; set; }
        [Column("ResponseTypeId")]
        public int ResponseTypeId { get; set; } = 1; // Par défaut, type TEXT
        [Column("state")]
        public int state { get; set; }
        
        [ForeignKey("evaluationTypeId")]
        [JsonIgnore]
        public EvaluationType? EvaluationType { get; set; }
        [ForeignKey("positionId")]
        [JsonIgnore]
        public Position? Position { get; set; }
        [ForeignKey("CompetenceLineId")]
        [JsonIgnore]
        public CompetenceLine? CompetenceLine { get; set; }
        [ForeignKey("ResponseTypeId")]
        [JsonIgnore]
        public ResponseType? ResponseType { get; set; }
    }
}
