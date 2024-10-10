using soft_carriere_competence.Core.Entities.salary_skills;
using soft_carriere_competence.Core.Interface;

namespace soft_carriere_competence.Application.Services.salary_skills
{
	public class EmployeeService
	{
		private readonly ICrudRepository<Employee> _repository;

		public EmployeeService(ICrudRepository<Employee> repository)
		{
			_repository = repository;
		}

		public async Task<IEnumerable<Employee>> GetAll()
		{
			return await _repository.GetAll();
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
