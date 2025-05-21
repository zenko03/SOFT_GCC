using Microsoft.EntityFrameworkCore;
using soft_carriere_competence.Core.Entities;
using soft_carriere_competence.Core.Interfaces;
using soft_carriere_competence.Infrastructure.Data;

namespace soft_carriere_competence.Core.Services
{
    public class PermissionService : IPermissionService
    {
        private readonly ApplicationDbContext _context;

        public PermissionService(ApplicationDbContext context)
        {
            _context = context;
        }

        // ... autres méthodes existantes ...

        public async Task DeleteRolePermissionsAsync(int roleId)
        {
            var rolePermissions = await _context.Role_Permissions
                .Where(rp => rp.role_id == roleId)
                .ToListAsync();

            if (rolePermissions.Any())
            {
                _context.Role_Permissions.RemoveRange(rolePermissions);
                await _context.SaveChangesAsync();
            }
        }

        public async Task UpdateRolePermissionsAsync(int roleId, List<int> permissionIds)
        {
            // Supprimer d'abord les anciennes permissions
            await DeleteRolePermissionsAsync(roleId);

            // Ajouter les nouvelles permissions
            var newRolePermissions = permissionIds.Select(permissionId => new Role_Permissions
            {
                role_id = roleId,
                permission_id = permissionId
            });

            await _context.Role_Permissions.AddRangeAsync(newRolePermissions);
            await _context.SaveChangesAsync();
        }
    }
} 