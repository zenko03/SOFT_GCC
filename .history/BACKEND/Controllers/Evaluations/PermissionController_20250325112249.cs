using Microsoft.AspNetCore.Mvc;
using soft_carriere_competence.Application.Services.Evaluations;
using soft_carriere_competence.Core.Entities.Evaluations;

namespace soft_carriere_competence.Controllers.Evaluations
{
    // Classe pour la désérialisation
    public class PermissionUpdateModel
    {
        public List<int> permissionIds { get; set; }
    }

    [Route("api/[controller]")]
    [ApiController]
    public class PermissionController : ControllerBase
    {
        private readonly PermissionService _permissionService;

        public PermissionController(PermissionService permissionService)
        {
            _permissionService = permissionService;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<Permission>>> GetAll()
        {
            var permissions = await _permissionService.GetAllAsync();
            return Ok(permissions);
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<Permission>> GetById(int id)
        {
            var permission = await _permissionService.GetByIdAsync(id);
            if (permission == null)
                return NotFound();
            return Ok(permission);
        }

        [HttpPost]
        public async Task<ActionResult<Permission>> Create(Permission permission)
        {
            try
            {
                permission.State = 1; // Définir l'état par défaut
                var createdPermission = await _permissionService.CreateAsync(permission);
                return CreatedAtAction(nameof(GetById), new { id = createdPermission.PermissionId }, createdPermission);
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> Update(int id, Permission permission)
        {
            if (id != permission.PermissionId)
                return BadRequest();

            try
            {
                await _permissionService.UpdateAsync(permission);
                return NoContent();
            }
            catch (Exception ex)
            {
                return NotFound(ex.Message);
            }
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            try
            {
                await _permissionService.DeleteAsync(id);
                return NoContent();
            }
            catch (Exception ex)
            {
                return NotFound(ex.Message);
            }
        }

        [HttpGet("role/{roleId}")]
        public async Task<ActionResult<IEnumerable<Permission>>> GetPermissionsByRoleId(int roleId)
        {
            try
            {
                var permissions = await _permissionService.GetPermissionsByRoleIdAsync(roleId);
                if (!permissions.Any())
                    return NotFound(new { message = "Aucune permission trouvée pour ce rôle." });
                return Ok(permissions);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpGet("user/{userId}")]
        public async Task<ActionResult<IEnumerable<Permission>>> GetUserPermissions(int userId)
        {
            var permissions = await _permissionService.GetUserPermissionsAsync(userId);
            return Ok(permissions);
        }

        [HttpPut("role/{roleId}")]
        public async Task<IActionResult> UpdateRolePermissions(int roleId, [FromBody] PermissionUpdateModel request)
        {
            try
            {
                // Log pour debug
                Console.WriteLine($"Mise à jour des permissions pour le rôle {roleId}");
                Console.WriteLine($"Objet reçu: {request != null}");

                if (request == null || request.permissionIds == null || !request.permissionIds.Any())
                {
                    return BadRequest(new { message = "La liste des permissions ne peut pas être vide." });
                }

                Console.WriteLine($"Nombre de permissions reçues: {request.permissionIds.Count}");
                Console.WriteLine("IDs des permissions reçues:");
                foreach (var id in request.permissionIds)
                {
                    Console.WriteLine($"- {id}");
                }

                // Vérifier si toutes les permissions existent et sont actives
                var invalidPermissions = new List<int>();
                foreach (var permissionId in request.permissionIds)
                {
                    var permission = await _permissionService.GetByIdAsync(permissionId);
                    if (permission == null || permission.State != 1)
                    {
                        invalidPermissions.Add(permissionId);
                    }
                }

                if (invalidPermissions.Any())
                {
                    return BadRequest(new { 
                        message = "Certaines permissions n'existent pas ou ne sont pas actives.",
                        invalidPermissions = invalidPermissions
                    });
                }

                await _permissionService.UpdateRolePermissionsAsync(roleId, request.permissionIds);
                return Ok(new { message = "Permissions mises à jour avec succès." });
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Erreur lors de la mise à jour des permissions: {ex.Message}");
                Console.WriteLine($"Stack trace: {ex.StackTrace}");
                return BadRequest(new { message = ex.Message });
            }
        }
    }
} 