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
	}
}
