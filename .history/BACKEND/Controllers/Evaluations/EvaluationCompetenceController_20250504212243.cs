using Microsoft.AspNetCore.Mvc;
using soft_carriere_competence.Application.Services.Evaluations;
using System.Threading.Tasks;

namespace soft_carriere_competence.Controllers.Evaluations
{
    [Route("api/[controller]")]
    [ApiController]
    public class EvaluationCompetenceController : ControllerBase
    {
        private readonly EvaluationCompetenceService _competenceService;

        public EvaluationCompetenceController(EvaluationCompetenceService competenceService)
        {
            _competenceService = competenceService;
        }

        /// Calcule et enregistre les résultats par compétence pour une évaluation
        [HttpPost("calculate/{evaluationId}")]
        public async Task<IActionResult> CalculateCompetenceResults(int evaluationId)
        {
            try
            {
                var result = await _competenceService.CalculateAndSaveCompetenceResultsAsync(evaluationId);
                return Ok(new { success = result, message = "Résultats des compétences calculés avec succès" });
            }
            catch (Exception ex)
            {
                return BadRequest(new { success = false, message = ex.Message });
            }
        }

        /// Récupère les résultats de compétences pour un utilisateur
        [HttpGet("user/{userId}")]
        public async Task<IActionResult> GetUserCompetenceResults(int userId)
        {
            try
            {
                var results = await _competenceService.GetUserCompetenceResultsAsync(userId);
                return Ok(results);
            }
            catch (Exception ex)
            {
                return BadRequest(new { success = false, message = ex.Message });
            }
        }

        /// Récupère les résultats de compétences pour une évaluation spécifique
        [HttpGet("evaluation/{evaluationId}")]
        public async Task<IActionResult> GetEvaluationCompetenceResults(int evaluationId)
        {
            try
            {
                var results = await _competenceService.GetEvaluationCompetenceResultsAsync(evaluationId);
                return Ok(results);
            }
            catch (Exception ex)
            {
                return BadRequest(new { success = false, message = ex.Message });
            }
        }

        /// Récupère l'historique des résultats pour une compétence spécifique d'un utilisateur
        [HttpGet("history/{userId}/{competenceId}")]
        public async Task<IActionResult> GetCompetenceResultHistory(int userId, int competenceId)
        {
            try
            {
                var history = await _competenceService.GetCompetenceResultHistoryAsync(userId, competenceId);
                return Ok(history);
            }
            catch (Exception ex)
            {
                return BadRequest(new { success = false, message = ex.Message });
            }
        }
    }
} 