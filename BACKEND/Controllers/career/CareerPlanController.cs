using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using soft_carriere_competence.Application.Services.career_plan;
using soft_carriere_competence.Application.Services.salary_skills;
using soft_carriere_competence.Core.Entities.career_plan;
using soft_carriere_competence.Core.Entities.salary_skills;

namespace soft_carriere_competence.Controllers.career
{
	[Route("api/[controller]")]
	[ApiController]
	public class CareerPlanController : ControllerBase
	{
		private readonly CareerPlanService _careerPlanService;

		public CareerPlanController(CareerPlanService service)
		{
			_careerPlanService = service;
		}


		[HttpGet("{id}")]
		public async Task<IActionResult> Get(int id)
		{
			var assignment = await _careerPlanService.GetById(id);
			if (assignment == null) return NotFound();
			return Ok(assignment);
		}

		[HttpPost]
		public async Task<IActionResult> Create(CareerPlan careerPlan)
		{
			await _careerPlanService.Add(careerPlan);
			return CreatedAtAction(nameof(Get), new { id = careerPlan.CareerPlanId }, careerPlan);
		}

		[HttpGet]
		[Route("employee/{registrationNumber}/appointment")]
		public async Task<IActionResult> GetAssignmentAppointment(string registrationNumber)
		{
			Console.WriteLine(registrationNumber);
			var list = await _careerPlanService.GetAssignmentAppointment(registrationNumber);
			if (list == null) return NotFound();
			return Ok(list);
		}

		[HttpGet]
		[Route("employee/{registrationNumber}/advancement")]
		public async Task<IActionResult> GetAssignmentAdvancement(string registrationNumber)
		{
			var list = await _careerPlanService.GetAssignmentAdvancement(registrationNumber);
			if (list == null) return NotFound();
			return Ok(list);
		}

		[HttpGet]
		[Route("employee/{registrationNumber}/availability")]
		public async Task<IActionResult> GetAssignmentAvailability(string registrationNumber)
		{
			var list = await _careerPlanService.GetAssignmentAvailability(registrationNumber);
			if (list == null) return NotFound();
			return Ok(list);
		}

		[HttpGet]
		[Route("employee/{registrationNumber}/history")]
		public async Task<IActionResult> GetHistory(string registrationNumber)
		{
			var list = await _careerPlanService.GetHistory(registrationNumber);
			if (list == null) return NotFound();
			return Ok(list);
		}

		[HttpPut("{id}")]
		public async Task<IActionResult> Update(int id, CareerPlan careerPlan)
		{
			if (id != careerPlan.CareerPlanId) return BadRequest();
			await _careerPlanService.Update(careerPlan);
			return NoContent();
		}

		[HttpGet]
		[Route("careers")]
		public async Task<IActionResult> GetListCareers(int pageNumber = 1, int pageSize = 2)
		{
			var careers = await _careerPlanService.GetAllCareers(pageNumber, pageSize);
			if (careers == null) return NotFound();
			return Ok(careers);
		}

		[HttpGet]
		[Route("filter")]
		public async Task<IActionResult> GetListCareersFilter(string keyWord, int pageNumber = 1, int pageSize = 2)
		{
			var careers = await _careerPlanService.GetAllCareersFilter(keyWord, pageNumber, pageSize);
			if (careers == null) return NotFound();
			return Ok(careers);
		}

		[HttpGet]
		[Route("careers/{registrationNumber}")]
		public async Task<IActionResult> GetCareersByEmployee(string registrationNumber)
		{
			var employeeCareer = await _careerPlanService.GetCareerByEmployee(registrationNumber);
			if (employeeCareer == null) return NotFound();
			return Ok(employeeCareer);
		}

		[HttpPut]
		[Route("delete/{careerPlanId}")]
		public async Task<IActionResult> DeleteCareerPlan(int careerPlanId)
		{
			bool isUpdated = await _careerPlanService.DeleteCareerPlan(careerPlanId);

			if (isUpdated)
			{
				return Ok("Suppression du plan de carriere reussi.");
			}
			else
			{
				return BadRequest("Échec de la suppression du plan de carriere.");
			}
		}

		[HttpPut]
		[Route("restore/{careerPlanId}")]
		public async Task<IActionResult> RestoreCareerPlan(int careerPlanId)
		{
			bool isUpdated = await _careerPlanService.RestoreCareerPlan(careerPlanId);

			if (isUpdated)
			{
				return Ok("Restauration du plan de carriere reussi.");
			}
			else
			{
				return BadRequest("Échec de la restauration du plan de carriere.");
			}
		}

		[HttpDelete]
		[Route("definitivelyDelete/{careerPlanId}")]
		public async Task<IActionResult> DefinitivelyDeleteCareerPlan(int careerPlanId)
		{
			bool isUpdated = await _careerPlanService.DeleteDefinitivelyCareerPlan(careerPlanId);

			if (isUpdated)
			{
				return Ok("Suppression definitif du plan de carriere.");
			}
			else
			{
				return BadRequest("Échec de la suppression definitif du plan de carriere.");
			}
		}

		[HttpDelete]
		[Route("History/Delete/{historyId}")]
		public async Task<IActionResult> DeleteHistory(int historyId)
		{
			bool isUpdated = await _careerPlanService.DeleteHistory(historyId);

			if (isUpdated)
			{
				return Ok("Suppression de l'historique.");
			}
			else
			{
				return BadRequest("Échec de la suppression de l'historique.");
			}
		}
	}
}
