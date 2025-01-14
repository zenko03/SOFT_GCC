using Microsoft.AspNetCore.Mvc;
using soft_carriere_competence.Application.Services.Evaluations;

namespace soft_carriere_competence.Controllers.Evaluations
{
	[ApiController]
	[Route("api/[controller]")]
	public class EvaluationHistoryController : ControllerBase
	{
		private readonly EvaluationHistoryService _evaluationHistoryService;

		public EvaluationHistoryController(EvaluationHistoryService evaluationHistoryService)
		{
			_evaluationHistoryService = evaluationHistoryService;
		}

		[HttpGet("history")]
		public async Task<IActionResult> GetEvaluationHistory(
		[FromQuery] DateTime? startDate,
		[FromQuery] DateTime? endDate,
		[FromQuery] string? evaluationType,
		[FromQuery] string? department,
		[FromQuery] string? employeeName
		)
		{
			var result = await _evaluationHistoryService.GetEvaluationHistoryAsync(
				startDate, endDate, evaluationType, department, employeeName);
			return Ok(result);
		}

		[HttpGet("detail/{evaluationId}")]
		public async Task<IActionResult> GetEvaluationDetail(int evaluationId)
		{
			var result = await _evaluationHistoryService.GetEvaluationDetailAsync(evaluationId);
			return Ok(result);
		}

		[HttpGet("statistics")]
		public async Task<IActionResult> GetEvaluationStatistics(
	[FromQuery] DateTime? startDate,
	[FromQuery] DateTime? endDate)
		{
			var result = await _evaluationHistoryService.GetEvaluationStatisticsAsync(startDate, endDate);
			return Ok(result);
		}

	}
}
