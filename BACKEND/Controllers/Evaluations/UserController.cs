using Microsoft.AspNetCore.Mvc;
using soft_carriere_competence.Application.Services.Evaluations;

[Route("api/User")]
[ApiController]
public class UserController : ControllerBase
{
	private readonly UserService _employeeService;


	public UserController(UserService employeeService)
	{
		_employeeService = employeeService;
	}

	// Endpoint GET : api/User pour récupérer tous les employés avec leurs détails
	[HttpGet("details")]
	public async Task<ActionResult<IEnumerable<object>>> GetEmployeesWithDetails()
	{
		var employees = await _employeeService.GetAllEmployeesWithDetailsAsync();
		
		return Ok(employees);
	}
	[HttpGet("managers-directors")]
	public async Task<ActionResult<IEnumerable<object>>> GetAllManagerAndDirector()
	{
		var dm = await _employeeService.GetManagerAndDirector();
		return Ok(dm);
	}

	[HttpGet("{id}")]
	public async Task<IActionResult> GetEmployee(int id)
	{
		Console.WriteLine("avant la fonction getEmployeeAsync");
		var employee = await _employeeService.GetEmployeeAsync(id);
		Console.WriteLine("apres la fonction getEmployeeAsync");


		if (employee == null)
		{
			return NotFound("L'employé n'existe pas.");
		}

		Console.WriteLine($"id and name of selected salary {employee.EmployeeId}, {employee.FirstName}");
		return Ok(employee);


	}


}
