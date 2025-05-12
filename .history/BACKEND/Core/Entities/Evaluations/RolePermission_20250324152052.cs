using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace soft_carriere_competence.Core.Entities.Evaluations
{
    [Table("role_permissions")]
    public class RolePermission
    {
        [Key]
        [Column("role_permission_id")]
        public int RolePermissionId { get; set; }

        [Column("role_id")]
        public int RoleId { get; set; }

        [Column("permission_id")]
        public int PermissionId { get; set; }

        // Navigation properties
        public Role Role { get; set; }
        public Permission Permission { get; set; }
    }
} 