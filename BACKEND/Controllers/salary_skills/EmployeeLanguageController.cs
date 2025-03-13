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
	public class EmployeeLanguageController : ControllerBase
	{
		private readonly EmployeeLanguageService _employeeLanguageService;
		private readonly HistoryService _historyService;

		public EmployeeLanguageController(EmployeeLanguageService service, HistoryService historyService)
		{
			_employeeLanguageService = service;
			_historyService = historyService;
		}

		[HttpGet]
		public async Task<IActionResult> GetAll()
		{
			var employeeLanguageServices = await _employeeLanguageService.GetAll();
			return Ok(employeeLanguageServices);
		}

		[HttpGet("{id}")]
		public async Task<IActionResult> Get(int id)
		{
			var employeeLanguage = await _employeeLanguageService.GetById(id);
			if (employeeLanguage == null) return NotFound();
			return Ok(employeeLanguage);
		}

		[HttpPost]
		public async Task<IActionResult> Create(EmployeeLanguage employeeLanguage)
		{
			await _employeeLanguageService.Add(employeeLanguage);
			var activityLog = new ActivityLog
			{
				UserId = 1,
				Module = 1,
				Action = "Création",
				Description = "L'user 1 a crée une nouvelle language ID " + employeeLanguage.EmployeeLanguageId + " pour l'employé ID " + employeeLanguage.EmployeeId,
				Timestamp = DateTime.UtcNow,
				Metadata = HttpContext.Connection.RemoteIpAddress.ToString()
			};

			await _historyService.Add(activityLog);
			return CreatedAtAction(nameof(Get), new { id = employeeLanguage.EmployeeLanguageId }, employeeLanguage);
		}

		[HttpPut("{id}")]
		public async Task<IActionResult> Update(int id, EmployeeLanguage employeeLanguage)
		{
			if (id != employeeLanguage.EmployeeLanguageId) return BadRequest();
			await _employeeLanguageService.Update(employeeLanguage);
			var activityLog = new ActivityLog
			{
				UserId = 1,
				Module = 1,
				Action = "Modification",
				Description = "L'user 1 a modifié la language ID " + employeeLanguage.EmployeeLanguageId + " pour l'employé ID " + employeeLanguage.EmployeeId,
				Timestamp = DateTime.UtcNow,
				Metadata = HttpContext.Connection.RemoteIpAddress.ToString()
			};

			await _historyService.Add(activityLog);
			return NoContent();
		}

		[HttpDelete("{id}")]
		public async Task<IActionResult> Delete(int id)
		{
			await _employeeLanguageService.Delete(id);
			var employeeLanguage = await _employeeLanguageService.GetById(id);
			var activityLog = new ActivityLog
			{
				UserId = 1,
				Module = 1,
				Action = "Suppression",
				Description = "L'user 1 a supprimé la language ID " + employeeLanguage.EmployeeLanguageId + " pour l'employé ID " + employeeLanguage.EmployeeId,
				Timestamp = DateTime.UtcNow,
				Metadata = HttpContext.Connection.RemoteIpAddress.ToString()
			};

			await _historyService.Add(activityLog);
			return NoContent();
		}

		[HttpGet]
		[Route("employee/{id}")]
		public async Task<IActionResult> GetEmployeeLanguages(int id)
		{
			var employeeLanguages = await _employeeLanguageService.GetEmployeeLanguages(id);
			if (employeeLanguages == null) return NotFound();
			return Ok(employeeLanguages);
		}
	}
}
