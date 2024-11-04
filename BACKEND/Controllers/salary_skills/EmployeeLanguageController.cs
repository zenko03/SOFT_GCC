using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using soft_carriere_competence.Application.Services.salary_skills;
using soft_carriere_competence.Core.Entities.salary_skills;

namespace soft_carriere_competence.Controllers.salary_skills
{
	[Route("api/[controller]")]
	[ApiController]
	public class EmployeeLanguageController : ControllerBase
	{
		private readonly EmployeeLanguageService _employeeLanguageService;

		public EmployeeLanguageController(EmployeeLanguageService service)
		{
			_employeeLanguageService = service;
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
			return CreatedAtAction(nameof(Get), new { id = employeeLanguage.EmployeeLanguageId }, employeeLanguage);
		}

		[HttpPut("{id}")]
		public async Task<IActionResult> Update(int id, EmployeeLanguage employeeLanguage)
		{
			if (id != employeeLanguage.EmployeeLanguageId) return BadRequest();
			await _employeeLanguageService.Update(employeeLanguage);
			return NoContent();
		}

		[HttpDelete("{id}")]
		public async Task<IActionResult> Delete(int id)
		{
			await _employeeLanguageService.Delete(id);
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
