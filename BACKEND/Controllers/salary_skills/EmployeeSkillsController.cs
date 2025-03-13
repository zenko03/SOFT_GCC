using System;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.CodeAnalysis;
using soft_carriere_competence.Application.Services.history;
using soft_carriere_competence.Application.Services.salary_skills;
using soft_carriere_competence.Core.Entities.history;
using soft_carriere_competence.Core.Entities.salary_skills;
using static System.Runtime.InteropServices.JavaScript.JSType;

namespace soft_carriere_competence.Controllers.salary_skills
{
	[Route("api/[controller]")]
	[ApiController]
	public class EmployeeSkillsController : ControllerBase
	{
		private readonly EmployeeSkillService _employeeSkillService;
		private readonly HistoryService _historyService;
		private readonly SkillService _skillService;


		public EmployeeSkillsController(EmployeeSkillService service, HistoryService historyService, SkillService skillService)
		{
			_employeeSkillService = service;
			_historyService = historyService;
			_skillService = skillService;
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
			Skill skill = await _skillService.GetById(employeeSkill.SkillId);
			var activityLog = new ActivityLog
			{
				UserId = 1,
				Module = 1,
				Action = "Création",
				Description = "L'user 1 a crée une nouvelle compétence "+skill.Name+ " pour l'employé ID "+employeeSkill.EmployeeId,
				Timestamp = DateTime.UtcNow,
				Metadata = HttpContext.Connection.RemoteIpAddress.ToString()
			};

			await _historyService.Add(activityLog);
			return CreatedAtAction(nameof(Get), new { id = employeeSkill.EmployeeSkillId }, employeeSkill);
		}

		[HttpPut("{id}")]
		public async Task<IActionResult> Update(int id, EmployeeSkill employeeSkill)
		{
			if (id != employeeSkill.EmployeeSkillId) return BadRequest();
			await _employeeSkillService.Update(employeeSkill);
			Skill skill = await _skillService.GetById(employeeSkill.SkillId);
			var activityLog = new ActivityLog
			{
				UserId = 1,
				Module = 1,
				Action = "Modification",
				Description = "L'user 1 a modifié la compétence " + skill.Name + " pour l'employé ID " + employeeSkill.EmployeeId,
				Timestamp = DateTime.UtcNow,
				Metadata = HttpContext.Connection.RemoteIpAddress.ToString()
			};

			await _historyService.Add(activityLog);
			return NoContent();
		}

		[HttpDelete("{id}")]
		public async Task<IActionResult> Delete(int id)
		{
			await _employeeSkillService.Delete(id);
			var employeeSkill = await _employeeSkillService.GetById(id);
			Skill skill = await _skillService.GetById(employeeSkill.SkillId);
			var activityLog = new ActivityLog
			{
				UserId = 1,
				Module = 1,
				Action = "Suppression",
				Description = "L'user 1 a supprimé la compétence " + skill.Name + " pour l'employé ID " + employeeSkill.EmployeeId,
				Timestamp = DateTime.UtcNow,
				Metadata = HttpContext.Connection.RemoteIpAddress.ToString()
			};

			await _historyService.Add(activityLog);
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

		[HttpGet]
		[Route("skillLevel")]
		public async Task<IActionResult> GetSkillLevel(int employeeId, int state)
		{
			var employeeDescription = await _employeeSkillService.GetSkillLevel(employeeId, state);
			if (employeeDescription == null) return NotFound();
			return Ok(employeeDescription);
		}
	}
}
