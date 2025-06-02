using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using soft_carriere_competence.Application.Services.Evaluations;
using soft_carriere_competence.Core.Entities.Evaluations;
using soft_carriere_competence.Infrastructure.Data;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace soft_carriere_competence.Controllers.Evaluations
{
    [Route("api/[controller]")]
    [ApiController]
    public class CompetenceController : ControllerBase
    {
        private readonly CompetenceLineService _competenceLineService;
        private readonly ApplicationDbContext _context;

        public CompetenceController(CompetenceLineService competenceLineService, ApplicationDbContext context)
        {
            _competenceLineService = competenceLineService;
            _context = context;
        }

        // GET: api/Competence
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

        // GET: api/Competence/lines
        // Endpoint équivalent à api/CompetenceLine
        [HttpGet("lines")]
        public async Task<ActionResult<IEnumerable<CompetenceLine>>> GetLines()
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

        // POST: api/Competence/batch
        // Récupère les lignes de compétences pour une liste d'IDs
        [HttpPost("batch")]
        public async Task<ActionResult<IEnumerable<CompetenceLine>>> GetBatch([FromBody] List<int> competenceLineIds)
        {
            try
            {
                if (competenceLineIds == null || !competenceLineIds.Any())
                {
                    return BadRequest("La liste d'IDs ne peut pas être vide");
                }

                var competenceLines = await _context.competenceLines
                    .Where(cl => competenceLineIds.Contains(cl.CompetenceLineId))
                    .Include(cl => cl.SkillPosition)
                        .ThenInclude(sp => sp.Skill)
                    .Include(cl => cl.SkillPosition)
                        .ThenInclude(sp => sp.Position)
                    .ToListAsync();

                return Ok(competenceLines);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { error = ex.Message });
            }
        }
    }
} 