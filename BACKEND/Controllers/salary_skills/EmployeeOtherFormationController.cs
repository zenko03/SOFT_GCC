using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using soft_carriere_competence.Application.Services.salary_skills;
using soft_carriere_competence.Core.Entities.salary_skills;

namespace soft_carriere_competence.Controllers.salary_skills
{
	[Route("api/[controller]")]
	[ApiController]
	public class EmployeeOtherFormationController : ControllerBase
	{
		private readonly EmployeeOtherFormationService _employeeOtherFormationService;

		public EmployeeOtherFormationController(EmployeeOtherFormationService service)
		{
			_employeeOtherFormationService = service;
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
			return CreatedAtAction(nameof(Get), new { id = employeeOtherFormation.EmployeeOtherFormationId }, employeeOtherFormation);
		}

		[HttpPut("{id}")]
		public async Task<IActionResult> Update(int id, EmployeeOtherFormation employeeOtherFormation)
		{
			if (id != employeeOtherFormation.EmployeeOtherFormationId) return BadRequest();
			await _employeeOtherFormationService.Update(employeeOtherFormation);
			return NoContent();
		}

		[HttpDelete("{id}")]
		public async Task<IActionResult> Delete(int id)
		{
			await _employeeOtherFormationService.Delete(id);
			return NoContent();
		}
	}
}
