using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using soft_carriere_competence.Application.Services.salary_skills;
using soft_carriere_competence.Core.Entities.salary_skills;

namespace soft_carriere_competence.Controllers.salary_skills
{
	[Route("api/[controller]")]
	[ApiController]
	public class EmployeeController : ControllerBase
	{
		private readonly EmployeeService _employeeService;

		public EmployeeController(EmployeeService service)
		{
			_employeeService = service;
		}

		[HttpGet]
		public async Task<IActionResult> GetAll()
		{
			var employees = await _employeeService.GetAll();
			return Ok(employees);
		}

		[HttpGet("{id}")]
		public async Task<IActionResult> Get(int id)
		{
			var employee = await _employeeService.GetById(id);
			if (employee == null) return NotFound();
			return Ok(employee);
		}

		[HttpPost]
		public async Task<IActionResult> Create(Employee employee)
		{
			await _employeeService.Add(employee);
			return CreatedAtAction(nameof(Get), new { id = employee.EmployeeId }, employee);
		}

		[HttpPut("{id}")]
		public async Task<IActionResult> Update(int id, Employee employee)
		{
			if (id != employee.EmployeeId) return BadRequest();
			await _employeeService.Update(employee);
			return NoContent();
		}

		[HttpDelete("{id}")]
		public async Task<IActionResult> Delete(int id)
		{
			await _employeeService.Delete(id);
			return NoContent();
		}
	}
}
