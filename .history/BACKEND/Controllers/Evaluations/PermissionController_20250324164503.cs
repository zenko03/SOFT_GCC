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
            var permissions = await _permissionService.GetPermissionsByRoleIdAsync(roleId);
            return Ok(permissions);
        }

        [HttpGet("user/{userId}")]
        public async Task<ActionResult<IEnumerable<Permission>>> GetUserPermissions(int userId)
        {
            var permissions = await _permissionService.GetUserPermissionsAsync(userId);
            return Ok(permissions);
        }

        [HttpPut("role/{roleId}")]
        public async Task<IActionResult> UpdateRolePermissions(int roleId, [FromBody] List<int> permissionIds)
        {
            try
            {
                await _permissionService.UpdateRolePermissionsAsync(roleId, permissionIds);
                return NoContent();
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }
    }
} 