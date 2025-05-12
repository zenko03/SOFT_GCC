using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace soft_carriere_competence.Core.Entities.Evaluations
{
    [Table("Evaluation_Competence_Results")]
    public class EvaluationCompetenceResult
    {
        [Key]
        public int ResultId { get; set; }
        
        [Required]
        public int EvaluationId { get; set; }
        
        [Required]
        public int UserId { get; set; }
        
        [Required]
        public int CompetenceLineId { get; set; }
        
        [Required]
        [Column(TypeName = "decimal(3,2)")]
        public decimal Score { get; set; }
        
        [Column(TypeName = "nvarchar(max)")]
        public string Comments { get; set; }
        
        public DateTime CreatedAt { get; set; }
        
        public int State { get; set; }
        
        [ForeignKey("EvaluationId")]
        public virtual Evaluations Evaluation { get; set; }
        
        [ForeignKey("UserId")]
        public virtual User User { get; set; }
        
        [ForeignKey("CompetenceLineId")]
        public virtual CompetenceLine CompetenceLine { get; set; }
    }
} 