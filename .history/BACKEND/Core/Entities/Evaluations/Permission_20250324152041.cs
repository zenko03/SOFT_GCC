using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace soft_carriere_competence.Core.Entities.Evaluations
{
    [Table("permissions")]
    public class Permission
    {
        [Key]
        [Column("permission_id")]
        public int PermissionId { get; set; }

        [MaxLength(100)]
        [Column("name")]
        public string Name { get; set; }

        [MaxLength(255)]
        [Column("description")]
        public string Description { get; set; }

        [Column("state")]
        public int? State { get; set; }

        // Navigation property pour la relation many-to-many avec Role
        public ICollection<RolePermission> RolePermissions { get; set; }
    }
} 