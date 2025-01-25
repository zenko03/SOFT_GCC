using Microsoft.AspNetCore.Mvc;
using soft_carriere_competence.Application.Dtos.EvaluationsDto;
using soft_carriere_competence.Application.Services.Evaluations;
using soft_carriere_competence.Application.Services.salary_skills;

namespace soft_carriere_competence.Controllers.Evaluations
{
	[ApiController]
	[Route("api/[controller]")]
	public class EvaluationInterviewController : ControllerBase
	{
		private readonly EvaluationService _evaluationService;
		private readonly EvaluationInterviewService _evaluationInterviewService;

		public EvaluationInterviewController(EvaluationService evaluationService, EvaluationInterviewService evaluationInterviewService)
		{
			_evaluationService = evaluationService;
			_evaluationInterviewService = evaluationInterviewService;
		}

		[HttpGet("employees-finished-evaluations")]
		public async Task<IActionResult> GetEmployeesFinishedEvaluations(
	[FromQuery] int? position,
	[FromQuery] int? department,
	[FromQuery] string? search)
		{
			var employees = await _evaluationInterviewService.GetEmployeesWithFinishedEvalAsync(position, department, search);
			return Ok(employees);
		}

		[HttpGet("employees-finished-evaluations-paginated")]
		public async Task<IActionResult> GetEmployeesWithFinishedEvalPaginated(
	int pageNumber = 1,
	int pageSize = 10,
	int? position = null,
	int? department = null,
	string? search = null)
		{
			var (employees, totalPages) = await _evaluationInterviewService.GetEmployeesWithFinishedEvalPaginatedAsync(
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


		[HttpGet("positions")]
		public async Task<IActionResult> GetAllPostes()
		{
			var positions = await _evaluationInterviewService.GetAllPostesAsync();
			foreach (var pos in positions)
			{
				Console.WriteLine("les postes: " + pos.title);
			}
			return Ok(positions);
		}

		[HttpGet("departments")]
		public async Task<IActionResult> GetAllDepartments()
		{
			var departments = await _evaluationInterviewService.GetAllDepartmentsAsync();
			return Ok(departments);
		}

		[HttpGet("evaluation-types")]
		public async Task<IActionResult> GetEvaluationTypes()
		{
			var evaluationTypes = await _evaluationService.GetEvaluationTypeAsync();
			if (evaluationTypes == null || !evaluationTypes.Any())
				return NotFound("No evaluation types found.");

			return Ok(evaluationTypes);
		}


		[HttpPost("schedule-interview")]
		public async Task<IActionResult> ScheduleInterview([FromBody] ScheduleInterviewRequest request)
		{
			if (request == null)
			{
				return BadRequest(new { message = "Requête invalide." });
			}

			if (request.ScheduledDate < DateTime.Now)
			{
				return BadRequest(new { message = "La date planifiée ne peut pas être dans le passé." });
			}

			if (request.Participants == null || !request.Participants.Any())
			{
				return BadRequest(new { message = "La liste des participants est vide ou invalide." });
			}

			var result = await _evaluationInterviewService.ScheduleInterviewAsync(
				request.EvaluationId,
				request.ScheduledDate,
				request.Participants
			);

			if (!result.Success)
			{
				return BadRequest(new { message = result.Message });
			}

			return Ok(new { InterviewId = result.InterviewId });
		}



		[HttpPut("update-interview/{interviewId}")]
		public async Task<IActionResult> UpdateInterview(int interviewId, [FromBody] UpdateInterviewDto dto)
		{
			var result = await _evaluationInterviewService.UpdateInterviewAsync(interviewId, dto.NewDate, dto.NewParticipantIds, dto.NewStatus);

			if (!result)
				return NotFound("Interview not found or invalid update");

			return NoContent();
		}

		[HttpPut("start-interview/{interviewId}")]
		public async Task<IActionResult> StartInterview(int interviewId)
		{
			var result = await _evaluationInterviewService.StartInterviewAsync(interviewId);

			if (!result)
				return BadRequest("Cannot start the interview");

			return NoContent();
		}

		[HttpPut("complete-interview/{interviewId}")]
		public async Task<IActionResult> CompleteInterview(int interviewId, [FromBody] CompleteInterviewDto dto)
		{
			var result = await _evaluationInterviewService.CompleteInterviewAsync(interviewId, dto.ManagerApproval, dto.ManagerComments, dto.DirectorApproval, dto.DirectorComments, dto.Notes);

			if (!result)
				return BadRequest("Cannot complete the interview");

			return NoContent();
		}

		[HttpGet("interview-details/{interviewId}")]
		public async Task<IActionResult> GetInterviewDetails(int interviewId)
		{
			var interview = await _evaluationInterviewService.GetInterviewDetailsAsync(interviewId);

			if (interview == null)
				return NotFound("Interview not found");

			return Ok(interview);
		}

		[HttpGet("{id}")]
		public async Task<IActionResult> GetEmployee(int id)
		{
			Console.WriteLine("avant la fonction getEmployeeAsync");
			var employee = await _evaluationInterviewService.GetEmployeeAsync(id);
			Console.WriteLine("apres la fonction getEmployeeAsync");


			if (employee == null)
			{
				return NotFound("L'employé n'existe pas.");
			}

			Console.WriteLine($"id and name of selected salary {employee.EmployeeId}, {employee.FirstName}");
			return Ok(employee);
		}

		[HttpGet("get-interview-by-participant/{participantId}")]
		public async Task<IActionResult> GetInterviewByParticipant(int participantId)
		{
			try
			{
				// Appel du service pour récupérer l'entretien
				var interview = await _evaluationInterviewService.GetInterviewByParticipantIdAsync(participantId);

				if (interview == null)
				{
					return NotFound(new { message = "Aucun entretien trouvé pour ce participant." });
				}

				return Ok(interview);
			}
			catch (Exception ex)
			{
				return BadRequest(new { message = $"Erreur lors de la récupération de l'entretien : {ex.Message}" });
			}
		}

	}
}
