using Microsoft.AspNetCore.Mvc;
using soft_carriere_competence.Application.Dtos.EvaluationsDto;
using soft_carriere_competence.Application.Services.Evaluations;

namespace soft_carriere_competence.Controllers.Evaluations
{
	[ApiController]
	[Route("api/[controller]")]
	public class EvaluationPlanningController : ControllerBase
	{
		private readonly EvaluationPlanningService _evaluationPlanningService;
		private readonly EvaluationService _evaluationService;


		public EvaluationPlanningController(EvaluationPlanningService evaluationPlanningService, EvaluationService evaluationService)
		{
			_evaluationPlanningService = evaluationPlanningService;
			_evaluationService = evaluationService;
		}

		[HttpGet("employees-without-evaluations")]
		public async Task<IActionResult> GetEmployeesWithoutEvaluations(
	[FromQuery] int? position,
	[FromQuery] int? department,
	[FromQuery] string? search)
		{
			var employees = await _evaluationPlanningService.GetEmployeesWithoutEvaluationsAsync(position, department, search);
			return Ok(employees);
		}


		[HttpGet("positions")]
		public async Task<IActionResult> GetAllPostes()
		{
			var positions = await _evaluationPlanningService.GetAllPostesAsync();
			foreach(var pos in positions)
			{
				Console.WriteLine("les postes: "+pos.title);
			}
			return Ok(positions);
		}

		[HttpGet("departments")]
		public async Task<IActionResult> GetAllDepartments()
		{
			var departments = await _evaluationPlanningService.GetAllDepartmentsAsync();
			return Ok(departments);
		}


		[HttpPost("create-evaluation")]
		public async Task<IActionResult> CreateEvaluation([FromBody] List<CreateEvaluationDto> dtos)
		{
			try
			{
				var evaluationIds = new List<int>();

				foreach (var dto in dtos)
				{
					var evaluationId = await _evaluationService.CreateEvaluationAsync(
						dto.UserId,
						dto.EvaluationTypeId,
						dto.SupervisorId,
						dto.StartDate,
						dto.EndDate
					);
					evaluationIds.Add(evaluationId);
				}

				return Ok(new { evaluationIds, message = "Evaluations created successfully." });
			}
			catch (Exception ex)
			{
				return StatusCode(500, new { error = ex.Message });
			}
		}



		[HttpGet("evaluation-types")]
		public async Task<IActionResult> GetEvaluationTypes()
		{
			var evaluationTypes = await _evaluationService.GetEvaluationTypeAsync();
			if (evaluationTypes == null || !evaluationTypes.Any())
				return NotFound("No evaluation types found.");

			return Ok(evaluationTypes);
		}


	}


}
