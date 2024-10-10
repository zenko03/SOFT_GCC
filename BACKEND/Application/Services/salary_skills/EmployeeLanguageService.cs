using soft_carriere_competence.Core.Entities.salary_skills;
using soft_carriere_competence.Core.Interface;

namespace soft_carriere_competence.Application.Services.salary_skills
{
	public class EmployeeLanguageService
	{
		private readonly ICrudRepository<EmployeeLanguage> _repository;

		public EmployeeLanguageService(ICrudRepository<EmployeeLanguage> repository)
		{
			_repository = repository;
		}

		public async Task<IEnumerable<EmployeeLanguage>> GetAll()
		{
			return await _repository.GetAll();
		}

		public async Task<EmployeeLanguage> GetById(int id)
		{
			return await _repository.GetById(id);
		}

		public async Task Add(EmployeeLanguage employeeLanguage)
		{
			await _repository.Add(employeeLanguage);
		}

		public async Task Update(EmployeeLanguage employeeLanguage)
		{
			await _repository.Update(employeeLanguage);
		}

		public async Task Delete(int id)
		{
			await _repository.Delete(id);
		}
	}
}
