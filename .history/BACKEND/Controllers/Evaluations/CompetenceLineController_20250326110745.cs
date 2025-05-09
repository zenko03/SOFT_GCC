using Microsoft.AspNetCore.Mvc;
using soft_carriere_competence.Application.Services.Evaluations;
using soft_carriere_competence.Core.Entities.Evaluations;

namespace soft_carriere_competence.Controllers.Evaluations
{
    [Route("api/[controller]")]
    [ApiController]
    public class CompetenceLineController : ControllerBase
    {
        private readonly CompetenceLineService _competenceLineService;

        public CompetenceLineController(CompetenceLineService competenceLineService)
        {
            _competenceLineService = competenceLineService;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<CompetenceLine>>> GetAll()
        {
            var competenceLines = await _competenceLineService.GetAllAsync();
            return Ok(competenceLines);
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<CompetenceLine>> GetById(int id)
        {
            var competenceLine = await _competenceLineService.GetByIdAsync(id);
            if (competenceLine == null)
                return NotFound();
            return Ok(competenceLine);
        }

        [HttpGet("position/{positionId}")]
        public async Task<ActionResult<IEnumerable<CompetenceLine>>> GetByPositionId(int positionId)
        {
            var competenceLines = await _competenceLineService.GetByPositionIdAsync(positionId);
            return Ok(competenceLines);
        }

        [HttpPost]
        public async Task<ActionResult<CompetenceLine>> Create(CompetenceLine competenceLine)
        {
            try
            {
                var createdCompetenceLine = await _competenceLineService.CreateAsync(competenceLine);
                return CreatedAtAction(nameof(GetById), new { id = createdCompetenceLine.CompetenceLineId }, createdCompetenceLine);
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> Update(int id, CompetenceLine competenceLine)
        {
            if (id != competenceLine.CompetenceLineId)
                return BadRequest("ID mismatch");

            try
            {
                await _competenceLineService.UpdateAsync(competenceLine);
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
                await _competenceLineService.DeleteAsync(id);
                return NoContent();
            }
            catch (Exception ex)
            {
                return NotFound(ex.Message);
            }
        }
    }
} 