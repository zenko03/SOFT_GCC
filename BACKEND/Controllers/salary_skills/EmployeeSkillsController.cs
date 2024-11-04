using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using soft_carriere_competence.Application.Services.salary_skills;
using soft_carriere_competence.Core.Entities.salary_skills;

namespace soft_carriere_competence.Controllers.salary_skills
{
	[Route("api/[controller]")]
	[ApiController]
	public class EmployeeSkillsController : ControllerBase
	{
		private readonly EmployeeSkillService _employeeSkillService;

		public EmployeeSkillsController(EmployeeSkillService service)
		{
			_employeeSkillService = service;
		}

		[HttpGet]
		public async Task<IActionResult> GetAll()
		{
			var employeeSkills = await _employeeSkillService.GetAll();
			return Ok(employeeSkills);
		}

		[HttpGet("{id}")]
		public async Task<IActionResult> Get(int id)
		{
			var employeeSkill = await _employeeSkillService.GetById(id);
			if (employeeSkill == null) return NotFound();
			return Ok(employeeSkill);
		}

		[HttpPost]
		public async Task<IActionResult> Create(EmployeeSkill employeeSkill)
		{
			await _employeeSkillService.Add(employeeSkill);
			return CreatedAtAction(nameof(Get), new { id = employeeSkill.EmployeeSkillId }, employeeSkill);
		}

		[HttpPut("{id}")]
		public async Task<IActionResult> Update(int id, EmployeeSkill employeeSkill)
		{
			if (id != employeeSkill.EmployeeSkillId) return BadRequest();
			await _employeeSkillService.Update(employeeSkill);
			return NoContent();
		}

		[HttpDelete("{id}")]
		public async Task<IActionResult> Delete(int id)
		{
			await _employeeSkillService.Delete(id);
			return NoContent();
		}

		[HttpGet]
		[Route("employee/{id}")]
		public async Task<IActionResult> GetEmployeeSkills(int id)
		{
			var employeeSkills = await _employeeSkillService.GetEmployeeSkills(id);
			if (employeeSkills == null) return NotFound();
			return Ok(employeeSkills);
		}

		[HttpGet]
		[Route("list")]
		public async Task<IActionResult> GetListSkills(int pageNumber = 1, int pageSize = 2)
		{
			var skills = await _employeeSkillService.GetAllSkills(pageNumber, pageSize);
			if (skills == null) return NotFound();
			return Ok(skills);
		}

		[HttpGet]
		[Route("filter")]
		public async Task<IActionResult> GetListSkillsFilter(string keyWord, int pageNumber = 1, int pageSize = 2)
		{
			var skills = await _employeeSkillService.GetAllSkillsFilter(keyWord,pageNumber, pageSize);
			if (skills == null) return NotFound();
			return Ok(skills);
		}

		[HttpGet]
		[Route("description/{employeeId}")]
		public async Task<IActionResult> GetEmployeeDescription(int employeeId)
		{
			var employeeDescription = await _employeeSkillService.GetEmployeeDescription(employeeId);
			if (employeeDescription == null) return NotFound();
			return Ok(employeeDescription);
		}
	}
}
