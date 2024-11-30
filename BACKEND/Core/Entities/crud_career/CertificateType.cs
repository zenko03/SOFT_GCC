using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace soft_carriere_competence.Core.Entities.crud_career
{
	[Table("Certificate_type")]
	public class CertificateType
	{
		[Key]
		[Column("Certificate_type_id")]
		public int CertificateTypeId { get; set; }


		[Column("Certificate_type_name")]
		public string? CertificateTypeName { get; set; }
	}
}
