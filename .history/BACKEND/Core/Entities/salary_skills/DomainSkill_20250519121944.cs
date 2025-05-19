using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace soft_carriere_competence.Core.Entities.salary_skills
{
	[Table("Domain_skill")]
	public class DomainSkill
	{
		[Key]
		[Column("Domain_skill_id")]
		public int DomainSkillId { get; set; }

		[Required]
		[Column("Domain_skill_name")]
		public string Name { get; set; }

		// Navigation property
		public virtual ICollection<Skill> Skills { get; set; }
	}
}
