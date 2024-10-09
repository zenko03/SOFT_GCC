using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using soft_carriere_competence.Application.Services.competences_salaries;
using soft_carriere_competence.Core.Entities;

namespace soft_carriere_competence.Controllers.competences_salaries
{
	[Route("api/[controller]")]
	[ApiController]
	public class StudyPathController : ControllerBase
	{
		private readonly StudyPathService _service;

		public StudyPathController(StudyPathService service)
		{
			_service = service;
		}

		[HttpGet]
		public async Task<IActionResult> GetAll()
		{
			var schools = await _service.GetAllStudyPaths();
			return Ok(schools);
		}

		[HttpGet("{id}")]
		public async Task<IActionResult> Get(int id)
		{
			var school = await _service.GetStudyPathById(id);
			if (school == null) return NotFound();
			return Ok(school);
		}

		[HttpPost]
		public async Task<IActionResult> Create(StudyPath studyPath)
		{
			await _service.AddStudyPath(studyPath);
			return CreatedAtAction(nameof(Get), new { id = studyPath.StudyPathId }, studyPath);
		}

		[HttpPut("{id}")]
		public async Task<IActionResult> Update(int id, StudyPath studyPath)
		{
			if (id != studyPath.StudyPathId) return BadRequest();
			await _service.UpdateStudyPath(studyPath);
			return NoContent();
		}

		[HttpDelete("{id}")]
		public async Task<IActionResult> Delete(int id)
		{
			await _service.DeleteStudyPath(id);
			return NoContent();
		}
	}
}
