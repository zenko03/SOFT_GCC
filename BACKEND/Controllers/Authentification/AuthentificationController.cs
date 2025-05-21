using Microsoft.AspNetCore.Mvc;
using soft_carriere_competence.Application.Dtos.LoginDto;
using soft_carriere_competence.Application.Services.Evaluations;
using soft_carriere_competence.Core.Interface.AuthInterface;

namespace soft_carriere_competence.Controllers.Authentification
{
	[ApiController]
	[Route("api/[controller]")]
	public class AuthentificationController : ControllerBase
	{
		private readonly UserService _userService;

		public AuthentificationController(UserService userService)
		{
			_userService = userService;
		}
		[HttpPost("register")]
		public async Task<IActionResult> Register([FromBody] RegisterDto dto)
		{
			var result = await _userService.RegisterAsync(dto);
			return Ok(new { message = result });
		}

		[HttpPost("login")]
		public async Task<IActionResult> Login([FromBody] LoginDto dto)
		{
			var token = await _userService.LoginAsync(dto);
			return Ok(new { token });
		}

		[HttpPost("forgotpassword")]
		public async Task<IActionResult> ForgotPassword([FromBody] string email)
		{
			var result = await _userService.ForgotPasswordAsync(email);
			return Ok(new { message = result });
		}

		[HttpPost("resetpassword")]
		public async Task<IActionResult> ResetPassword([FromBody] ResetPasswordDto dto)
		{
			var result = await _userService.ResetPasswordAsync(dto);
			return Ok(new { message = result });
		}

		// Dans AuthentificationController.cs
		[HttpGet("user")]
		public async Task<IActionResult> GetUserByEmail([FromQuery] string email)
		{
			var user = await _userService.GetUserByEmailAsync(email);
			if (user == null) return NotFound();
			return Ok(user);
		}

		[HttpGet("current-user")]
		public async Task<IActionResult> GetCurrentUser()
		{
			var userIdClaim = User.FindFirst("userId")?.Value; // Récupération de l'ID utilisateur depuis le token
			if (string.IsNullOrEmpty(userIdClaim))
			{
				return Unauthorized("Utilisateur non authentifié.");
			}

			var user = await _userService.GetUserByIdAsync(int.Parse(userIdClaim));
			if (user == null) return NotFound("Utilisateur introuvable.");

			return Ok(new
			{
				id = user.Id,
				email = user.Email,
				firstName = user.FirstName,
				lastName = user.LastName,
				roleId = user.RoleId,
				roleTitle = user.Role?.Title ?? "Unknown"
				
			});
		}


		// Dans UserService.cs

	}
}
