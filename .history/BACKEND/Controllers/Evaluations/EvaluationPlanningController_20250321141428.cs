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
			foreach (var pos in positions)
			{
				Console.WriteLine("les postes: " + pos.title);
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
						dto.SupervisorIds,
						dto.StartDate,
						dto.EndDate
					);
					// Send email to user
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

		[HttpGet("rappel-evaluation")]
		public async Task<IActionResult> rappelerEvaluation([FromQuery] int idEvaluation)
		{

			int state_result = await _evaluationService.rappelerEvaluation(idEvaluation);
			if (state_result == 0)
			{
				return StatusCode(500, new { error = "Erreur lors du rappel de l'evaluation" });
			}

			return Ok(new { idEvaluation, message = "Rappel avec succes.Un mail a été envoyé" });
		}

		[HttpGet("employees-without-evaluations-paginated")]
		public async Task<IActionResult> GetEmployeesWithoutEvaluationsPaginated(
	int pageNumber = 1,
	int pageSize = 10,
	int? position = null,
	int? department = null,
	string? search = null)
		{
			var (employees, totalPages) = await _evaluationPlanningService.GetEmployeesWithoutEvaluationsPaginatedAsync(
				pageNumber,
				pageSize,
				position,
				department,
				search);

			return Ok(new
			{
				Employees = employees,
				TotalPages = totalPages,
				CurrentPage = pageNumber,
				PageSize = pageSize
			});
		}

		[HttpPost("send-automatic-reminders")]
		public async Task<IActionResult> SendAutomaticReminders()
		{
			try
			{
				await _evaluationService.SendAutomaticRemindersAsync();
				return Ok(new { message = "Rappels automatiques envoyés avec succès." });
			}
			catch (Exception ex)
			{
				return StatusCode(500, new { error = ex.Message });
			}
		}

		

	}

}
