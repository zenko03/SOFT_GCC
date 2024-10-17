using Microsoft.AspNetCore.Mvc;

namespace soft_carriere_competence.Controllers.Authentification
{
	[ApiController]
	[Route("api/[controller]")]
	public class AuthentificationController : Controller
	{
		public IActionResult Index()
		{
			return View();
		}

	}
}
