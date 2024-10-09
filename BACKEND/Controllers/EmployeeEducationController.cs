using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using soft_carriere_competence.Application.Services;
using soft_carriere_competence.Core.Entities;

namespace soft_carriere_competence.Controllers
{
	[Route("api/[controller]")]
	[ApiController]
	public class EmployeeEducationController : ControllerBase
	{
		private readonly EmployeeEducationService _service;

		public EmployeeEducationController(EmployeeEducationService service)
		{
			_service = service;
		}

		[HttpGet]
		public async Task<IActionResult> GetAll()
		{
			var educations = await _service.GetAllEmployeeEducations();
			return Ok(educations);
		}

		[HttpGet("{id}")]
		public async Task<IActionResult> Get(int id)
		{
			var education = await _service.GetEmployeeEducationById(id);
			if (education == null) return NotFound();
			return Ok(education);
		}

		[HttpPost]
		public async Task<IActionResult> Create(EmployeeEducation education)
		{
			await _service.AddEmployeeEducation(education);
			return CreatedAtAction(nameof(Get), new { id = education.EmployeeEducationId }, education);
		}

		[HttpPut("{id}")]
		public async Task<IActionResult> Update(int id, EmployeeEducation education)
		{
			if (id != education.EmployeeEducationId) return BadRequest();
			await _service.UpdateEmployeeEducation(education);
			return NoContent();
		}

		[HttpDelete("{id}")]
		public async Task<IActionResult> Delete(int id)
		{
			await _service.DeleteEmployeeEducation(id);
			return NoContent();
		}
	}
}
