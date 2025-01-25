﻿using Microsoft.AspNetCore.Mvc;
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

		[HttpGet("evaluation-history-paginated")]
		public async Task<IActionResult> GetEvaluationHistoryPaginated(
	
	[FromQuery] DateTime? startDate,
	[FromQuery] DateTime? endDate ,
	[FromQuery] string? evaluationType,
	[FromQuery] string? department ,
	[FromQuery] string? employeeName,
	int pageNumber = 1,
	int pageSize = 10)
		{
			var (evaluations, totalPages) = await _evaluationHistoryService.GetEvaluationHistoryPaginatedAsync(
				pageNumber,
				pageSize,
				startDate,
				endDate,
				evaluationType,
				department,
				employeeName);

			return Ok(new
			{
				Evaluations = evaluations,
				TotalPages = totalPages,
				CurrentPage = pageNumber,
				PageSize = pageSize
			});
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

		[HttpGet("global-performance")]
		public async Task<IActionResult> GetGlobalPerformance(
		   [FromQuery] DateTime? startDate,
		   [FromQuery] DateTime? endDate,
		   [FromQuery] string department = null,
		   [FromQuery] string evaluationType = null)
		{
			try
			{
				var performanceData = await _evaluationHistoryService.GetGlobalPerformanceAsync(startDate, endDate, department, evaluationType);
				return Ok(performanceData);
			}
			catch (Exception ex)
			{
				return StatusCode(500, "Erreur interne du serveur : " + ex.Message);
			}
		}

		[HttpGet("kpis")]
		public async Task<IActionResult> GetKPIs([FromQuery] DateTime? startDate, [FromQuery] DateTime? endDate, [FromQuery] int? department)
		{
			try
			{
				var kpis = await _evaluationHistoryService.GetKPIsAsync(startDate, endDate, department);
				return Ok(kpis);
			}
			catch (Exception ex)
			{
				return StatusCode(500, $"Erreur lors de la récupération des KPI : {ex.Message}");
			}
		}

		[HttpGet("export")]
		public async Task<IActionResult> ExportData([FromQuery] string format, [FromQuery] DateTime? startDate, [FromQuery] DateTime? endDate)
		{
			var file = await _evaluationHistoryService.ExportDataAsync(format, startDate, endDate);
			return File(file.Content, file.ContentType, file.FileName);
		}
	}
}
