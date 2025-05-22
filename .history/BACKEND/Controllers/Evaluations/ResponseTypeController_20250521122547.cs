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
            var responseTypes = await _responseTypeService.GetAllAsync();
            return Ok(responseTypes);
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