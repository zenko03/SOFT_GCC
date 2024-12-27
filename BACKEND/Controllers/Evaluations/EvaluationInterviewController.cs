using Microsoft.AspNetCore.Mvc;
using soft_carriere_competence.Application.Dtos.EvaluationsDto;
using soft_carriere_competence.Application.Services.Evaluations;

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
		public async Task<IActionResult> ScheduleInterview(int evaluationId, DateTime scheduledDate, List<int> participants)
		{
			var interviewId = await _evaluationInterviewService.ScheduleInterviewAsync(evaluationId, scheduledDate, participants);
			return Ok(new { InterviewId = interviewId });
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
			var result = await _evaluationInterviewService.CompleteInterviewAsync(interviewId, dto.ManagerApproval, dto.ManagerComments, dto.DirectorApproval, dto.DirectorComments);

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



	}
}
