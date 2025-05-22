using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using soft_carriere_competence.Application.Services.history;
using soft_carriere_competence.Application.Services.salary_skills;
using soft_carriere_competence.Core.Entities.history;
using soft_carriere_competence.Core.Entities.salary_skills;

namespace soft_carriere_competence.Controllers.salary_skills
{
	[Route("api/[controller]")]
	[ApiController]
	public class EmployeeEducationController : ControllerBase
	{
		private readonly EmployeeEducationService _employeeEducationService;
		private readonly HistoryService _historyService;

		public EmployeeEducationController(EmployeeEducationService service, HistoryService historyService)
		{
			_employeeEducationService = service;
			_historyService = historyService;
		}

		[HttpGet]
		public async Task<IActionResult> GetAll()
		{
			var employeeEducations = await _employeeEducationService.GetAll();
			return Ok(employeeEducations);
		}

		[HttpGet("{id}")]
		public async Task<IActionResult> Get(int id)
		{
			var employeeEducations = await _employeeEducationService.GetById(id);
			if (employeeEducations == null) return NotFound();
			return Ok(employeeEducations);
		}

		[HttpPost]
		public async Task<IActionResult> Create(EmployeeEducation employeeEducation)
		{
			await _employeeEducationService.Add(employeeEducation);
			var activityLog = new ActivityLog
			{
				UserId = 1,
				Module = 1,
				Action = "Création",
				Description = "L'user 1 a crée une nouvelle éducation ID " + employeeEducation.EmployeeEducationId + " pour l'employé ID " + employeeEducation.EmployeeId,
				Timestamp = DateTime.UtcNow,
				Metadata = HttpContext.Connection.RemoteIpAddress.ToString()
			};

			await _historyService.Add(activityLog);
			return CreatedAtAction(nameof(Get), new { id = employeeEducation.EmployeeEducationId }, employeeEducation);
		}

		[HttpPut("{id}")]
		public async Task<IActionResult> Update(int id, EmployeeEducation employeeEducation)
		{
			if (id != employeeEducation.EmployeeEducationId) return BadRequest();
			await _employeeEducationService.Update(employeeEducation);
			var activityLog = new ActivityLog
			{
				UserId = 1,
				Module = 1,
				Action = "Modification",
				Description = "L'user 1 a modifié l'éducation ID " + employeeEducation.EmployeeEducationId + " pour l'employé ID " + employeeEducation.EmployeeId,
				Timestamp = DateTime.UtcNow,
				Metadata = HttpContext.Connection.RemoteIpAddress.ToString()
			};

			await _historyService.Add(activityLog);
			return NoContent();
		}

		[HttpDelete("{id}")]
		public async Task<IActionResult> Delete(int id)
		{

			var employeeEducation = await _employeeEducationService.GetById(id);
			var activityLog = new ActivityLog
			{
				UserId = 1,
				Module = 1,
				Action = "Suppression",
				Description = "L'user 1 a supprimé l'éducation ID " + employeeEducation.EmployeeEducationId + " pour l'employé ID " + employeeEducation.EmployeeId,
				Timestamp = DateTime.UtcNow,
				Metadata = HttpContext.Connection.RemoteIpAddress.ToString()
			};

			await _employeeEducationService.Delete(id);
			await _historyService.Add(activityLog);
			return NoContent();
		}

		[HttpGet]
		[Route("employee/{id}")]
		public async Task<IActionResult> GetEmployeeEducations(int id)
		{
			var employeeEducations = await _employeeEducationService.GetEmployeeEducations(id);
			if (employeeEducations == null) return NotFound();
			return Ok(employeeEducations);
		}
	}
}
