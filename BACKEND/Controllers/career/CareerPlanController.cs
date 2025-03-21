using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using soft_carriere_competence.Application.Services.career_plan;
using soft_carriere_competence.Application.Services.crud_career;
using soft_carriere_competence.Application.Services.history;
using soft_carriere_competence.Application.Services.retirement;
using soft_carriere_competence.Application.Services.salary_skills;
using soft_carriere_competence.Core.Entities.career_plan;
using soft_carriere_competence.Core.Entities.crud_career;
using soft_carriere_competence.Core.Entities.history;
using soft_carriere_competence.Core.Entities.retirement;
using soft_carriere_competence.Core.Entities.salary_skills;

namespace soft_carriere_competence.Controllers.career
{
	[Route("api/[controller]")]
	[ApiController]
	public class CareerPlanController : ControllerBase
	{
		private readonly CareerPlanService _careerPlanService;
		private readonly HistoryService _historyService;
		private readonly AssignmentTypeService _assignmentTypeService;

		public CareerPlanController(CareerPlanService service, HistoryService historyService, AssignmentTypeService assignmentTypeService)
		{
			_careerPlanService = service;
			_historyService = historyService;
			_assignmentTypeService = assignmentTypeService;
		}

	/// Recupérer un plan de carrière par son çid
		[HttpGet("{id}")]
		public async Task<IActionResult> Get(int id)
		{
			var assignment = await _careerPlanService.GetById(id);
			if (assignment == null) return NotFound();
			return Ok(assignment);
		}

		// Creationd'un plan de carrière
		[HttpPost]
		public async Task<IActionResult> Create(CareerPlan careerPlan)
		{
			if (careerPlan == null)
			{
				return BadRequest("Le plan de carrière est requis.");
			}

			try
			{
				// Récupérer l'AssignmentType en vérifiant s'il est null
				AssignmentType? assignmentType = await _assignmentTypeService.GetById((int)careerPlan.AssignmentTypeId);
				if (assignmentType == null)
				{
					return NotFound("Type d'affectation introuvable.");
				}

				// Vérifier s'il existe déjà un plan de carrière pour cet employé et ce type de contrat
				CareerPlan? lastCareerPlan = await _careerPlanService.GetByEmployeeAndContractType(
					careerPlan.RegistrationNumber, careerPlan.EmployeeTypeId
				);

				if (lastCareerPlan == null)
				{
					// Ajouter le plan de carrière
					await _careerPlanService.Add(careerPlan);
				}
				else
				{
					lastCareerPlan.EndingContract = careerPlan.AssignmentDate;
					await _careerPlanService.Update(lastCareerPlan);
					await _careerPlanService.Add(careerPlan);
				}

				// Création du journal d'activité
				var activityLog = new ActivityLog
				{
					UserId = 1, // Id utilisateur à remplacer par l'ID du contexte actuel si possible
					Module = 2,
					Action = "Création",
					Description = $"L'utilisateur 1 a créé un nouveau plan de carrière de type {assignmentType.AssignmentTypeName} pour l'employé {careerPlan.RegistrationNumber}",
					Timestamp = DateTime.UtcNow,
					Metadata = HttpContext.Connection.RemoteIpAddress?.ToString() ?? "IP inconnue"
				};

				await _historyService.Add(activityLog);

				return CreatedAtAction(nameof(Get), new { id = careerPlan.CareerPlanId }, careerPlan);
			}
			catch (Exception ex)
			{
				return StatusCode(500, $"Une erreur est survenue : {ex.Message}");
			}
		}

		// Récuperer les données de type nomination
		[HttpGet]
		[Route("employee/{registrationNumber}/appointment")]
		public async Task<IActionResult> GetAssignmentAppointment(string registrationNumber)
		{
			Console.WriteLine(registrationNumber);
			var list = await _careerPlanService.GetAssignmentAppointment(registrationNumber);
			if (list == null) return NotFound();
			return Ok(list);
		}

		// Récuperer les données de type avancement
		[HttpGet]
		[Route("employee/{registrationNumber}/advancement")]
		public async Task<IActionResult> GetAssignmentAdvancement(string registrationNumber)
		{
			var list = await _careerPlanService.GetAssignmentAdvancement(registrationNumber);
			if (list == null) return NotFound();
			return Ok(list);
		}

		// Récuperer les données de type mise en disponobilté
		[HttpGet]
		[Route("employee/{registrationNumber}/availability")]
		public async Task<IActionResult> GetAssignmentAvailability(string registrationNumber)
		{
			var list = await _careerPlanService.GetAssignmentAvailability(registrationNumber);
			if (list == null) return NotFound();
			return Ok(list);
		}

		// Historique du plan de carrière
		[HttpGet]
		[Route("employee/{registrationNumber}/history")]
		public async Task<IActionResult> GetHistory(string registrationNumber)
		{
			var list = await _careerPlanService.GetHistory(registrationNumber);
			if (list == null) return NotFound();
			return Ok(list);
		}

		// Mis à jour du plan carrière
		[HttpPut("{id}")]
		public async Task<IActionResult> Update(int id, CareerPlan careerPlan)
		{
			if (id != careerPlan.CareerPlanId) return BadRequest();
			await _careerPlanService.Update(careerPlan);

			AssignmentType assignmentType = await _assignmentTypeService.GetById((int)careerPlan.AssignmentTypeId);
			var activityLog = new ActivityLog
			{
				UserId = 1,
				Module = 2,
				Action = "Modification",
				Description = "L'user 1 a modifié un plan de carrière de type " + assignmentType.AssignmentTypeName + " pour l'employé " + careerPlan.RegistrationNumber,
				Timestamp = DateTime.UtcNow,
				Metadata = HttpContext.Connection.RemoteIpAddress.ToString()
			};

			await _historyService.Add(activityLog);
			return NoContent();
		}

		// Avoir la liste des carrières
		[HttpGet]
		[Route("careers")]
		public async Task<IActionResult> GetListCareers(int pageNumber = 1, int pageSize = 2)
		{
			var careers = await _careerPlanService.GetAllCareers(pageNumber, pageSize);
			if (careers == null) return NotFound();
			return Ok(careers);
		}

		// Récupération des données du filtre multi-crotère
		[HttpGet]
		[Route("filter")]
		public async Task<IActionResult> GetListCareersFilter(
			string keyWord=null, 
			string departmentId=null, 
			string positionId=null, 
			int pageNumber = 1, 
			int pageSize = 2)
		{
			try
			{
				// Appel au service pour récupérer les données et le total
				var (data, totalCount) = await _careerPlanService.GetAllCareersFilter(
					keyWord, departmentId, positionId, pageNumber, pageSize);

				// Structure de réponse standard
				var response = new
				{
					Success = data != null && data.Any(),
					Message = data != null && data.Any()
						? "Données récupérées avec succès."
						: "Aucun résultat trouvé avec les critères donnés.",
					Data = data ?? Enumerable.Empty<object>(),
					TotalCount = totalCount,
					TotalPages = data != null && data.Any()
						? (int)Math.Ceiling((double)totalCount / pageSize)
						: 0,
					CurrentPage = pageNumber,
					PageSize = pageSize
				};

				return Ok(response);
			}
			catch (ArgumentException ex)
			{
				// Exception de validation des paramètres (message personnalisé)
				return Ok(new
				{
					Success = false,
					Message = ex.Message,
					Data = Enumerable.Empty<object>(),
					TotalCount = 0,
					TotalPages = 0,
					CurrentPage = pageNumber,
					PageSize = pageSize
				});
			}
			catch (Exception ex)
			{
				// Exception générique (message standard)
				return Ok(new
				{
					Success = false,
					Message = "Une erreur inattendue s'est produite. Veuillez réessayer plus tard.",
					Details = ex.Message,
					Data = Enumerable.Empty<object>(),
					TotalCount = 0,
					TotalPages = 0,
					CurrentPage = pageNumber,
					PageSize = pageSize
				});
			}
		}

		// Avoir un plan de carrière via son matricule
		[HttpGet]
		[Route("careers/{registrationNumber}")]
		public async Task<IActionResult> GetCareersByEmployee(string registrationNumber)
		{
			var employeeCareer = await _careerPlanService.GetCareerByEmployee(registrationNumber);
			if (employeeCareer == null) return NotFound();
			return Ok(employeeCareer);
		}

		//	Suppimer un pla de carrière
		[HttpPut]
		[Route("delete/{careerPlanId}")]
		public async Task<IActionResult> DeleteCareerPlan(int careerPlanId)
		{
			bool isUpdated = await _careerPlanService.DeleteCareerPlan(careerPlanId);

			if (isUpdated)
			{
				AssignmentType assignmentType = await _assignmentTypeService.GetById((int)careerPlanId);
				CareerPlan careerPlan = await _careerPlanService.GetById(careerPlanId);
				var activityLog = new ActivityLog
				{
					UserId = 1,
					Module = 2,
					Action = "Nettoyage",
					Description = "L'user 1 a effacé le plan de carrière de type " + assignmentType.AssignmentTypeName + " pour l'employé " + careerPlan.RegistrationNumber,
					Timestamp = DateTime.UtcNow,
					Metadata = HttpContext.Connection.RemoteIpAddress.ToString()
				};

				await _historyService.Add(activityLog);
				return Ok("Suppression du plan de carriere reussi.");
			}
			else
			{
				return BadRequest("Échec de la suppression du plan de carriere.");
			}
		}

		// Suppression d'un plan de carrière
		[HttpPut]
		[Route("restore/{careerPlanId}")]
		public async Task<IActionResult> RestoreCareerPlan(int careerPlanId)
		{
			bool isUpdated = await _careerPlanService.RestoreCareerPlan(careerPlanId);

			if (isUpdated)
			{
				AssignmentType assignmentType = await _assignmentTypeService.GetById((int)careerPlanId);
				CareerPlan careerPlan = await _careerPlanService.GetById(careerPlanId);
				var activityLog = new ActivityLog
				{
					UserId = 1,
					Module = 2,
					Action = "Restauré",
					Description = "L'user 1 a restauré le plan de carrière de type " + assignmentType.AssignmentTypeName + " pour l'employé " + careerPlan.RegistrationNumber,
					Timestamp = DateTime.UtcNow,
					Metadata = HttpContext.Connection.RemoteIpAddress.ToString()
				};

				await _historyService.Add(activityLog);
				return Ok("Restauration du plan de carriere reussi.");
			}
			else
			{
				return BadRequest("Échec de la restauration du plan de carriere.");
			}
		}

		//	Suppriler définitivement un plan de carrière
		[HttpDelete]
		[Route("definitivelyDelete/{careerPlanId}")]
		public async Task<IActionResult> DefinitivelyDeleteCareerPlan(int careerPlanId)
		{
			bool isUpdated = await _careerPlanService.DeleteDefinitivelyCareerPlan(careerPlanId);

			if (isUpdated)
			{
				AssignmentType assignmentType = await _assignmentTypeService.GetById((int)careerPlanId);
				CareerPlan careerPlan = await _careerPlanService.GetById(careerPlanId);
				var activityLog = new ActivityLog
				{
					UserId = 1,
					Module = 2,
					Action = "suppression",
					Description = "L'user 1 a supprimé le plan de carrière de type " + assignmentType.AssignmentTypeName + " pour l'employé " + careerPlan.RegistrationNumber,
					Timestamp = DateTime.UtcNow,
					Metadata = HttpContext.Connection.RemoteIpAddress.ToString()
				};

				await _historyService.Add(activityLog);
				return Ok("Suppression definitif du plan de carriere.");
			}
			else
			{
				return BadRequest("Échec de la suppression definitif du plan de carriere.");
			}
		}

		// Supprimer une historique
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
