using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using soft_carriere_competence.Application.Services.salary_skills;
using soft_carriere_competence.Core.Entities.salary_skills;

namespace soft_carriere_competence.Controllers.salary_skills
{
	[Route("api/[controller]")]
	[ApiController]
	public class DepartmentController : ControllerBase
	{
		private readonly DepartmentService _departmentService;

		public DepartmentController(DepartmentService service)
		{
			_departmentService = service;
		}

		[HttpGet]
		public async Task<IActionResult> GetAll()
		{
			var departments = await _departmentService.GetAll();
			return Ok(departments);
		}

		[HttpGet("{id}")]
		public async Task<IActionResult> Get(int id)
		{
			var department = await _departmentService.GetById(id);
			if (department == null) return NotFound();
			return Ok(department);
		}

		[HttpPost]
		public async Task<IActionResult> Create(Department department)
		{
			await _departmentService.Add(department);
			return CreatedAtAction(nameof(Get), new { id = department.DepartmentId }, department);
		}

		[HttpPut("{id}")]
		public async Task<IActionResult> Update(int id, Department department)
		{
			if (id != department.DepartmentId) return BadRequest();
			await _departmentService.Update(department);
			return NoContent();
		}

		[HttpDelete("{id}")]
		public async Task<IActionResult> Delete(int id)
		{
			await _departmentService.Delete(id);
			return NoContent();
		}
	}
}
