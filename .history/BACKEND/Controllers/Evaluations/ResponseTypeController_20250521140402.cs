using Microsoft.AspNetCore.Mvc;
using soft_carriere_competence.Application.Services.Evaluations;
using soft_carriere_competence.Core.Entities.Evaluations;

namespace soft_carriere_competence.Controllers.Evaluations
{
    [Route("api/[controller]")]
    [ApiController]
    public class ResponseTypeController : ControllerBase
    {
        private readonly ResponseTypeService _responseTypeService;

        public ResponseTypeController(ResponseTypeService responseTypeService)
        {
            _responseTypeService = responseTypeService;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<ResponseType>>> GetAll()
        {
            try
            {
                var responseTypes = await _responseTypeService.GetAllAsync();
                // Formater les données pour assurer la cohérence
                var formattedResponseTypes = responseTypes.Select(rt => new {
                    ResponseTypeId = rt.ResponseTypeId,
                    TypeName = rt.TypeName ?? "Non défini",
                    Description = rt.Description ?? "Sans description"
                }).ToList();
                
                return Ok(formattedResponseTypes);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Erreur lors de la récupération des types de réponse: {ex.Message}");
                return StatusCode(500, new { error = ex.Message });
            }
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<ResponseType>> GetById(int id)
        {
            var responseType = await _responseTypeService.GetByIdAsync(id);
            if (responseType == null)
                return NotFound();
            return Ok(responseType);
        }

        [HttpPost]
        public async Task<ActionResult<ResponseType>> Create(ResponseType responseType)
        {
            try
            {
                var createdResponseType = await _responseTypeService.CreateAsync(responseType);
                return CreatedAtAction(nameof(GetById), new { id = createdResponseType.ResponseTypeId }, createdResponseType);
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> Update(int id, ResponseType responseType)
        {
            if (id != responseType.ResponseTypeId)
                return BadRequest("ID mismatch");

            try
            {
                await _responseTypeService.UpdateAsync(responseType);
                return NoContent();
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            try
            {
                await _responseTypeService.DeleteAsync(id);
                return NoContent();
            }
            catch (Exception ex)
            {
                return NotFound(ex.Message);
            }
        }
    }
} 