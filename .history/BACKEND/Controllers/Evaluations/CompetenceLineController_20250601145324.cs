using Microsoft.AspNetCore.Mvc;
using soft_carriere_competence.Application.Services.Evaluations;
using soft_carriere_competence.Core.Entities.Evaluations;
using soft_carriere_competence.Infrastructure.Data;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace soft_carriere_competence.Controllers.Evaluations
{
    [Route("api/CompetenceLine")]
    [ApiController]
    public class CompetenceLineController : ControllerBase
    {
        private readonly CompetenceLineService _competenceLineService;
        private readonly ApplicationDbContext _context;

        public CompetenceLineController(CompetenceLineService competenceLineService, ApplicationDbContext context)
        {
            _competenceLineService = competenceLineService;
            _context = context;
        }

        // GET: api/CompetenceLine
        [HttpGet]
        public async Task<ActionResult<IEnumerable<CompetenceLine>>> GetAll()
        {
            try
            {
                var competenceLines = await _competenceLineService.GetAllAsync();
                return Ok(competenceLines);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { error = ex.Message });
            }
        }

        // GET: api/CompetenceLine/{id}
        [HttpGet("{id}")]
        public async Task<ActionResult<CompetenceLine>> GetById(int id)
        {
            try
            {
                var competenceLine = await _competenceLineService.GetByIdAsync(id);
                
                if (competenceLine == null)
                {
                    return NotFound($"CompetenceLine avec ID {id} non trouvée");
                }
                
                return Ok(competenceLine);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { error = ex.Message });
            }
        }

        [HttpGet("position/{positionId}")]
        public async Task<ActionResult<IEnumerable<object>>> GetByPositionId(int positionId)
        {
            try
            {
                var competenceLines = await _competenceLineService.GetByPositionIdAsync(positionId);
                
                // Formater la réponse pour inclure toutes les informations nécessaires
                var formattedLines = competenceLines.Select(cl => new
                {
                    competenceLineId = cl.CompetenceLineId,
                    skillPositionId = cl.SkillPositionId,
                    description = cl.Description,
                    skillName = cl.SkillPosition?.Skill?.Name ?? "Non défini",
                    positionId = cl.SkillPosition?.Position?.PositionId ?? 0,
                    positionName = cl.SkillPosition?.Position?.PositionName ?? "Non défini"
                });

                return Ok(formattedLines);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Erreur lors de la récupération des lignes de compétence: {ex.Message}");
                return StatusCode(500, new { error = ex.Message });
            }
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