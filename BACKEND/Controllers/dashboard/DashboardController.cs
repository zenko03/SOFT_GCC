using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using soft_carriere_competence.Application.Services.dashboard;
using soft_carriere_competence.Application.Services.wish_evolution;

namespace soft_carriere_competence.Controllers.dashboard
{
	[Route("api/[controller]")]
	[ApiController]
	public class DashboardController : ControllerBase
	{
		private readonly DashboardService _dashboardService;

		public DashboardController(DashboardService service)
		{
			_dashboardService = service;
		}

		[HttpGet]
		[Route("employeeNumberTotal")]
		public async Task<IActionResult> GetEmployeeNumberTotal()
		{
			int employeeTotal = await _dashboardService.GetEmployeeCount();
			int wishEvolutionTotal = await _dashboardService.GetWishEvolutionTotal();
			double averageSkill = await _dashboardService.GetAverageSkillPerEmployee();

			return Ok(new 
			{
				EmployeeTotal = employeeTotal,
				WishEvolutionTotal = wishEvolutionTotal,
				AverageSkill = averageSkill
			});
		}

		[HttpGet]
		[Route("employeeSkillByDepartment")]
		public async Task<IActionResult> GetEmployeeSkillByDepartment(int departmentId, int state)
		{
			var employeeSkills = await _dashboardService.GetEmployeeSkillByDepartment(departmentId, state);
			if (employeeSkills == null) return NotFound();
			return Ok(employeeSkills);
		}

		[HttpGet]
		[Route("employeeCareerByDepartment")]
		public async Task<IActionResult> GetEmployeeCareerByDepartment(int departmentId)
		{
			var employeeCareers = await _dashboardService.GetEmployeeCareerByDepartment(departmentId);
			if (employeeCareers == null) return NotFound();
			return Ok(employeeCareers);
		}
	}
}
