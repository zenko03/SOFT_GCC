using Microsoft.EntityFrameworkCore;
using soft_carriere_competence.Core.Entities.salary_skills;
using soft_carriere_competence.Core.Interface;
using soft_carriere_competence.Infrastructure.Data;

namespace soft_carriere_competence.Application.Services.salary_skills
{
	public class EmployeeService
	{
		private readonly ICrudRepository<Employee> _repository;
		private readonly ApplicationDbContext _context;

		public EmployeeService(ICrudRepository<Employee> repository, ApplicationDbContext context)
		{
			_repository = repository;
			_context = context;
		}

		public async Task<IEnumerable<VEmployee>> GetAll()
		{
			return await _context.VEmployee.ToListAsync();
		}


		public async Task<Employee> GetById(int id)
		{
			return await _repository.GetById(id);
		}

		public async Task Add(Employee employee)
		{
			await _repository.Add(employee);
		}

		public async Task Update(Employee employee)
		{
			await _repository.Update(employee);
		}

		public async Task Delete(int id)
		{
			await _repository.Delete(id);
		}
	}
}
