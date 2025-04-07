using Microsoft.EntityFrameworkCore;
using soft_carriere_competence.Core.Entities.Evaluations;
using soft_carriere_competence.Infrastructure.Data;

namespace soft_carriere_competence.Application.Services.Evaluations
{
    public class PermissionService
    {
        private readonly ApplicationDbContext _context;

        public PermissionService(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<IEnumerable<Permission>> GetAllAsync()
        {
            return await _context.Permissions
                .Where(p => p.State == null || p.State == 1)
                .ToListAsync();
        }

        public async Task<Permission> GetByIdAsync(int id)
        {
            return await _context.Permissions
                .FirstOrDefaultAsync(p => p.PermissionId == id && (p.State == null || p.State == 1));
        }

        public async Task<Permission> CreateAsync(Permission permission)
        {
            permission.State = 1;
            _context.Permissions.Add(permission);
            await _context.SaveChangesAsync();
            return permission;
        }

        public async Task<Permission> UpdateAsync(Permission permission)
        {
            var existingPermission = await _context.Permissions.FindAsync(permission.PermissionId);
            if (existingPermission == null)
                throw new Exception("Permission non trouvée");

            existingPermission.Name = permission.Name;
            existingPermission.Description = permission.Description;
            existingPermission.State = permission.State;
            await _context.SaveChangesAsync();
            return existingPermission;
        }

        public async Task DeleteAsync(int id)
        {
            var permission = await _context.Permissions.FindAsync(id);
            if (permission == null)
                throw new Exception("Permission non trouvée");

            permission.State = 0;
            await _context.SaveChangesAsync();
        }

        public async Task<IEnumerable<Permission>> GetPermissionsByRoleIdAsync(int roleId)
        {
            return await _context.RolePermissions
                .Where(rp => rp.RoleId == roleId)
                .Include(rp => rp.Permission)
                .Select(rp => rp.Permission)
                .ToListAsync();
        }

        public async Task UpdateRolePermissionsAsync(int roleId, List<int> permissionIds)
        {
            // Supprimer les anciennes associations
            var existingPermissions = await _context.RolePermissions
                .Where(rp => rp.RoleId == roleId)
                .ToListAsync();

            _context.RolePermissions.RemoveRange(existingPermissions);

            // Ajouter les nouvelles associations
            foreach (var permissionId in permissionIds)
            {
                _context.RolePermissions.Add(new RolePermission
                {
                    RoleId = roleId,
                    PermissionId = permissionId
                });
            }

            await _context.SaveChangesAsync();
        }
    }
} 