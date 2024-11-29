using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using soft_carriere_competence.Application.Services.crud_career;
using soft_carriere_competence.Core.Entities.crud_career;

namespace soft_carriere_competence.Controllers.crud_career
{
	[Route("api/[controller]")]
	[ApiController]
	public class EstablishmentController : ControllerBase
	{
		private readonly EstablishmentService _establishmentService;

		public EstablishmentController(EstablishmentService service)
		{
			_establishmentService = service;
		}

		[HttpGet]
		public async Task<IActionResult> GetAll()
		{
			var establishments = await _establishmentService.GetAll();
			return Ok(establishments);
		}

		[HttpGet("{id}")]
		public async Task<IActionResult> Get(int id)
		{
			var establishment = await _establishmentService.GetById(id);
			if (establishment == null) return NotFound();
			return Ok(establishment);
		}

		[HttpPost]
		public async Task<IActionResult> Create(Establishment establishment)
		{
			await _establishmentService.Add(establishment);
			return CreatedAtAction(nameof(Get), new { id = establishment.EstablishmentId }, establishment);
		}

		[HttpPut("{id}")]
		public async Task<IActionResult> Update(int id, Establishment establishment)
		{
			if (id != establishment.EstablishmentId) return BadRequest();
			await _establishmentService.Update(establishment);
			return NoContent();
		}

		[HttpDelete("{id}")]
		public async Task<IActionResult> Delete(int id)
		{
			await _establishmentService.Delete(id);
			return NoContent();
		}
	}
}
