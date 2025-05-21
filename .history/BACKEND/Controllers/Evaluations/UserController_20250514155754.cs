using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using soft_carriere_competence.Application.Services.Evaluations;
using soft_carriere_competence.Core.Interface.AuthInterface;
using soft_carriere_competence.Infrastructure.Data;

[Route("api/User")]
[ApiController]
public class UserController : ControllerBase
{
	private readonly UserService _employeeService;
	private readonly ApplicationDbContext _context;

	public UserController(UserService employeeService, ApplicationDbContext context)
	{
		_employeeService = employeeService;
		_context = context;
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

	[HttpGet("paginated")]
	public async Task<IActionResult> GetPaginatedUsers(int pageNumber = 1, int pageSize = 10)
	{
		var (users, totalPages) = await _employeeService.GetUsersWithPaginationAsync(pageNumber, pageSize);

		return Ok(new
		{
			Users = users,
			TotalPages = totalPages,
			CurrentPage = pageNumber,
			PageSize = pageSize
		});
	}

	[HttpGet("vemployee-details-paginated")]
	public async Task<IActionResult> GetVEmployeeDetailsPaginated(
		int pageNumber = 1, 
		int pageSize = 10, 
		string? search = null,
		int? position = null,
		int? department = null,
		string? sortBy = null,
		string? sortDirection = null)
	{
		var (employees, totalPages) = await _employeeService.GetVEmployeeDetailsPaginatedAsync(
			pageNumber, 
			pageSize, 
			search,
			position,
			department,
			sortBy,
			sortDirection);

		return Ok(new
		{
			Employees = employees,
			TotalPages = totalPages,
			CurrentPage = pageNumber,
			PageSize = pageSize
		});
	}

	// Endpoint GET : api/User/roles pour récupérer tous les rôles
	[HttpGet("roles")]
	public async Task<ActionResult<IEnumerable<object>>> GetRoles()
	{
		var roles = await _context.Roles
			.Where(r => r.state == null || r.state == 1)
			.Select(r => new { roleId = r.Roleid, name = r.Title })
			.ToListAsync();
		
		return Ok(roles);
	}

}
