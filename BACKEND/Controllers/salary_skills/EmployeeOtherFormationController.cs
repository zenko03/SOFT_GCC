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
	public class EmployeeOtherFormationController : ControllerBase
	{
		private readonly EmployeeOtherFormationService _employeeOtherFormationService;
		private readonly HistoryService _historyService;

		public EmployeeOtherFormationController(EmployeeOtherFormationService service, HistoryService historyService)
		{
			_employeeOtherFormationService = service;
			_historyService = historyService;
		}

		[HttpGet]
		public async Task<IActionResult> GetAll()
		{
			var employeeOtherFormation = await _employeeOtherFormationService.GetAll();
			return Ok(employeeOtherFormation);
		}

		[HttpGet("{id}")]
		public async Task<IActionResult> Get(int id)
		{
			var employeeOtherFormation = await _employeeOtherFormationService.GetById(id);
			if (employeeOtherFormation == null) return NotFound();
			return Ok(employeeOtherFormation);
		}

		[HttpPost]
		public async Task<IActionResult> Create(EmployeeOtherFormation employeeOtherFormation)
		{
			await _employeeOtherFormationService.Add(employeeOtherFormation);
			var activityLog = new ActivityLog
			{
				UserId = 1,
				Module = 1,
				Action = "Création",
				Description = "L'user 1 a crée une nouvelle autre formation ID " + employeeOtherFormation.EmployeeOtherFormationId + " pour l'employé ID " + employeeOtherFormation.EmployeeId,
				Timestamp = DateTime.UtcNow,
				Metadata = HttpContext.Connection.RemoteIpAddress.ToString()
			};

			await _historyService.Add(activityLog);
			return CreatedAtAction(nameof(Get), new { id = employeeOtherFormation.EmployeeOtherFormationId }, employeeOtherFormation);
		}

		[HttpPut("{id}")]
		public async Task<IActionResult> Update(int id, EmployeeOtherFormation employeeOtherFormation)
		{
			if (id != employeeOtherFormation.EmployeeOtherFormationId) return BadRequest();
			await _employeeOtherFormationService.Update(employeeOtherFormation);
			var activityLog = new ActivityLog
			{
				UserId = 1,
				Module = 1,
				Action = "Modification",
				Description = "L'user 1 a modifié l'autre formation ID " + employeeOtherFormation.EmployeeOtherFormationId + " pour l'employé ID " + employeeOtherFormation.EmployeeId,
				Timestamp = DateTime.UtcNow,
				Metadata = HttpContext.Connection.RemoteIpAddress.ToString()
			};

			await _historyService.Add(activityLog);
			return NoContent();
		}

		[HttpDelete("{id}")]
		public async Task<IActionResult> Delete(int id)
		{
			await _employeeOtherFormationService.Delete(id);
			var employeeOtherFormation = await _employeeOtherFormationService.GetById(id);
			var activityLog = new ActivityLog
			{
				UserId = 1,
				Module = 1,
				Action = "Suppression",
				Description = "L'user 1 a supprimé l'autre formation ID " + employeeOtherFormation.EmployeeOtherFormationId + " pour l'employé ID " + employeeOtherFormation.EmployeeId,
				Timestamp = DateTime.UtcNow,
				Metadata = HttpContext.Connection.RemoteIpAddress.ToString()
			};

			await _historyService.Add(activityLog);
			return NoContent();
		}

		[HttpGet]
		[Route("employee/{id}")]
		public async Task<IActionResult> GetEmployeeOtherSkills(int id)
		{
			var employeeOtherSkills = await _employeeOtherFormationService.GetEmployeeOtherSkills(id);
			if (employeeOtherSkills == null) return NotFound();
			return Ok(employeeOtherSkills);
		}
	}
}
