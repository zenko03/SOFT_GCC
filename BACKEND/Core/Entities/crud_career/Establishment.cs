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

        [Column("Adress")]
        public string? Adress { get; set; }

        [Column("Contact")]
        public string? Contact { get; set; }

        [Column("Mail")]
        public string? Mail { get; set; }

        [Column("Website")]
        public string? Website { get; set; }

        [Column("Social_network")]
        public string? SocialNetwork { get; set; }

        [Column("Logo")]
        public byte[] Logo { get; set; }

        [Column("Creation_date")]
        public DateTime? CreationDate { get; set; }

        [Column("Updated_date")]
        public DateTime? UpdatedDate { get; set; }
    }
}
