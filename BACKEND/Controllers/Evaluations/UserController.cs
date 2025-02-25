﻿using Microsoft.AspNetCore.Mvc;
using soft_carriere_competence.Application.Services.Evaluations;
using soft_carriere_competence.Core.Interface.AuthInterface;

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
	public async Task<IActionResult> GetVEmployeeDetailsPaginated(int pageNumber = 1, int pageSize = 10)
	{
		var (employees, totalPages) = await _employeeService.GetVEmployeeDetailsPaginatedAsync(pageNumber, pageSize);

		return Ok(new
		{
			Employees = employees,
			TotalPages = totalPages,
			CurrentPage = pageNumber,
			PageSize = pageSize
		});
	}

}
