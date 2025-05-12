using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using soft_carriere_competence.Core.Entities.crud_career;

namespace soft_carriere_competence.Core.Entities.Evaluations
{
    [Table("Evaluation_questions")]
    public class EvaluationQuestion
    {
        [Key]
        [Column("Question_id")]
        public int Question_id { get; set; }
        [Column("evaluationTypeId")]
        public int EvaluationTypeId { get; set; }
        [Column("positionId")]
        public int PositionId { get; set; }
        [Column("CompetenceLineId")]
        public int? CompetenceLineId { get; set; }
        [Column("question")]
        public string Question { get; set; }
        [Column("ResponseTypeId")]
        public int? ResponseTypeId { get; set; }
        [Column("state")]
        public int State { get; set; }
        [Column("MaxTimeInMinutes")]
        public int MaxTimeInMinutes { get; set; } = 15; // Temps par défaut de 15 minutes

        [ForeignKey("evaluationTypeId")]
        public EvaluationType EvaluationType { get; set; }
        [ForeignKey("positionId")]
        public Position Position { get; set; }
        [ForeignKey("CompetenceLineId")]
        public CompetenceLine CompetenceLine { get; set; }
        [ForeignKey("ResponseTypeId")]
        public ResponseType ResponseType { get; set; }
    }
}
