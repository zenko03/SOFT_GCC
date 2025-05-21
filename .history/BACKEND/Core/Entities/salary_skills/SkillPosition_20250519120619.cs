using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using soft_carriere_competence.Core.Entities.crud_career;

namespace soft_carriere_competence.Core.Entities.salary_skills
{
    [Table("Skill_position")]
    public class SkillPosition
    {
        [Key]
        [Column("Skill_position_id")]
        public int SkillPositionId { get; set; }

        [Required]
        [Column("Position_id")]
        public int PositionId { get; set; }

        [Required]
        [Column("Skill_id")]
        public int SkillId { get; set; }

        [Column("State")]
        public int State { get; set; }

        [Column("Creation_date")]
        public DateTime? CreationDate { get; set; } = DateTime.Now;

        [Column("Updated_date")]
        public DateTime? UpdateDate { get; set; } = DateTime.Now;

        [ForeignKey("PositionId")]
        public Position Position { get; set; }

        [ForeignKey("SkillId")]
        public Skill Skill { get; set; }
    }
} 