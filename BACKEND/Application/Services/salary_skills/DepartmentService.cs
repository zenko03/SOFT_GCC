using soft_carriere_competence.Core.Entities.salary_skills;
using soft_carriere_competence.Core.Interface;

namespace soft_carriere_competence.Application.Services.salary_skills
{
	public class DepartmentService
	{
		private readonly ICrudRepository<Department> _repository;

		public DepartmentService(ICrudRepository<Department> repository)
		{
			_repository = repository;
		}

		public async Task<IEnumerable<Department>> GetAll()
		{
			return await _repository.GetAll();
		}

		public async Task<Department> GetById(int id)
		{
			return await _repository.GetById(id);
		}

		public async Task Add(Department department)
		{
			await _repository.Add(department);
		}

		public async Task Update(Department department)
		{
			await _repository.Update(department);
		}

		public async Task Delete(int id)
		{
			await _repository.Delete(id);
		}
	}
}
