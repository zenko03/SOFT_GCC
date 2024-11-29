using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace soft_carriere_competence.Core.Entities.Evaluations
{
    [Table("Postes")]
    public class Poste
    {
        [Key]
        [Column("Poste_id")]
        public int posteId { get; set; }
        [Column("title")]
        public string title { get; set; }
    }
}
