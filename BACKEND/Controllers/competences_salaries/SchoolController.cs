using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using soft_carriere_competence.Application.Services.competences_salaries;
using soft_carriere_competence.Core.Entities;

namespace soft_carriere_competence.Controllers.competences_salaries
{
	[Route("api/[controller]")]
	[ApiController]
	public class SchoolController : ControllerBase
	{
		private readonly SchoolService _service;

		public SchoolController(SchoolService service)
		{
			_service = service;
		}

		[HttpGet]
		public async Task<IActionResult> GetAll()
		{
			var schools = await _service.GetAllSchools();
			return Ok(schools);
		}

		[HttpGet("{id}")]
		public async Task<IActionResult> Get(int id)
		{
			var school = await _service.GetSchoolById(id);
			if (school == null) return NotFound();
			return Ok(school);
		}

		[HttpPost]
		public async Task<IActionResult> Create(School school)
		{
			await _service.AddSchool(school);
			return CreatedAtAction(nameof(Get), new { id = school.SchoolId }, school);
		}

		[HttpPut("{id}")]
		public async Task<IActionResult> Update(int id, School school)
		{
			if (id != school.SchoolId) return BadRequest();
			await _service.UpdateSchool(school);
			return NoContent();
		}

		[HttpDelete("{id}")]
		public async Task<IActionResult> Delete(int id)
		{
			await _service.DeleteSchool(id);
			return NoContent();
		}
	}
}
