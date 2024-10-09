using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using soft_carriere_competence.Application.Services;
using soft_carriere_competence.Application.Services.competences_salaries;
using soft_carriere_competence.Core.Entities;

namespace soft_carriere_competence.Controllers.competences_salaries
{
	[Route("api/[controller]")]
	[ApiController]
	public class DegreeController : ControllerBase
	{
		private readonly DegreeService _service;

		public DegreeController(DegreeService service)
		{
			_service = service;
		}

		[HttpGet]
		public async Task<IActionResult> GetAll()
		{
			var degrees = await _service.GetAllDegrees();
			return Ok(degrees);
		}

		[HttpGet("{id}")]
		public async Task<IActionResult> Get(int id)
		{
			var degree = await _service.GetDegreeById(id);
			if (degree == null) return NotFound();
			return Ok(degree);
		}

		[HttpPost]
		[Route("degree")]
		public async Task<IActionResult> Create(Degree degree)
		{
			await _service.AddDegree(degree);
			return CreatedAtAction(nameof(Get), new { id = degree.DegreeId }, degree);
		}

		[HttpPut("{id}")]
		public async Task<IActionResult> Update(int id, Degree degree)
		{
			if (id != degree.DegreeId) return BadRequest();
			await _service.UpdateDegree(degree);
			return NoContent();
		}

		[HttpDelete("{id}")]
		public async Task<IActionResult> Delete(int id)
		{
			await _service.DeleteDegree(id);
			return NoContent();
		}
	}
}
