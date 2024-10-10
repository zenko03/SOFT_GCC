using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using soft_carriere_competence.Application.Services.salary_skills;
using soft_carriere_competence.Core.Entities.salary_skills;

namespace soft_carriere_competence.Controllers.salary_skills
{
	[Route("api/[controller]")]
	[ApiController]
	public class EmployeeEducationController : ControllerBase
	{
		private readonly EmployeeEducationService _employeeEducationService;

		public EmployeeEducationController(EmployeeEducationService service)
		{
			_employeeEducationService = service;
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
			return CreatedAtAction(nameof(Get), new { id = employeeEducation.EmployeeEducationId }, employeeEducation);
		}

		[HttpPut("{id}")]
		public async Task<IActionResult> Update(int id, EmployeeEducation employeeEducation)
		{
			if (id != employeeEducation.EmployeeEducationId) return BadRequest();
			await _employeeEducationService.Update(employeeEducation);
			return NoContent();
		}

		[HttpDelete("{id}")]
		public async Task<IActionResult> Delete(int id)
		{
			await _employeeEducationService.Delete(id);
			return NoContent();
		}
	}
}
