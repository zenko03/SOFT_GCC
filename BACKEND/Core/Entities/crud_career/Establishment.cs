using System.ComponentModel.DataAnnotations.Schema;
using System.ComponentModel.DataAnnotations;

namespace soft_carriere_competence.Core.Entities.crud_career
{
	[Table("Establishment")]
	public class Establishment
	{
		[Key]
		[Column("Establishment_id")]
		public int EstablishmentId { get; set; }


		[Column("Establishment_name")]
		public string? EstablishmentName { get; set; }
	}
}
