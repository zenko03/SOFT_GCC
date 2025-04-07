using Microsoft.AspNetCore.Mvc;
using soft_carriere_competence.Application.Services.Evaluations;
using soft_carriere_competence.Core.Entities.Evaluations;

namespace soft_carriere_competence.Controllers.Evaluations
{
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
        public async Task<IActionResult> UpdateRolePermissions(int roleId, [FromBody] object rawData)
        {
            try
            {
                // Log pour debug
                Console.WriteLine($"Mise à jour des permissions pour le rôle {roleId}");
                Console.WriteLine($"Données brutes reçues: {rawData}");
                
                // Conversion des données brutes en liste d'IDs
                List<int> permissionIds;
                try {
                    // Essayer de convertir directement si c'est un tableau JSON
                    permissionIds = System.Text.Json.JsonSerializer.Deserialize<List<int>>(rawData.ToString());
                    Console.WriteLine("Conversion réussie en utilisant la méthode directe");
                }
                catch (Exception ex) {
                    Console.WriteLine($"Erreur lors de la désérialisation directe: {ex.Message}");
                    
                    try {
                        // Si la première méthode échoue, essayer une autre approche
                        var jsonElement = (System.Text.Json.JsonElement)rawData;
                        
                        if (jsonElement.ValueKind == System.Text.Json.JsonValueKind.Array)
                        {
                            permissionIds = new List<int>();
                            foreach (var item in jsonElement.EnumerateArray())
                            {
                                if (item.TryGetInt32(out int value))
                                {
                                    permissionIds.Add(value);
                                }
                            }
                            Console.WriteLine("Conversion réussie en utilisant la méthode EnumerateArray");
                        }
                        else
                        {
                            Console.WriteLine($"Le format reçu n'est pas un tableau: {jsonElement.ValueKind}");
                            return BadRequest(new { message = "Format de données invalide, un tableau d'IDs est attendu." });
                        }
                    }
                    catch (Exception innerEx) {
                        Console.WriteLine($"Erreur lors de la seconde méthode de désérialisation: {innerEx.Message}");
                        return BadRequest(new { message = "Impossible de convertir les données reçues en liste d'IDs de permissions." });
                    }
                }
                
                Console.WriteLine($"Nombre de permissions après conversion: {permissionIds?.Count ?? 0}");
                if (permissionIds != null && permissionIds.Any())
                {
                    Console.WriteLine("IDs des permissions après conversion:");
                    foreach (var id in permissionIds)
                    {
                        Console.WriteLine($"- {id}");
                    }
                }

                if (permissionIds == null || !permissionIds.Any())
                    return BadRequest(new { message = "La liste des permissions ne peut pas être vide." });

                // Vérifier si toutes les permissions existent et sont actives
                var invalidPermissions = new List<int>();
                foreach (var permissionId in permissionIds)
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

                await _permissionService.UpdateRolePermissionsAsync(roleId, permissionIds);
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