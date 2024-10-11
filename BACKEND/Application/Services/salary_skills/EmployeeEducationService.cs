using soft_carriere_competence.Core.Entities.salary_skills;
using soft_carriere_competence.Core.Interface;
using soft_carriere_competence.Infrastructure.Repositories;

namespace soft_carriere_competence.Application.Services.salary_skills
{
	public class EmployeeEducationService
	{
		private readonly ICrudRepository<EmployeeEducation> _repository;

		public EmployeeEducationService(ICrudRepository<EmployeeEducation> repository)
		{
			_repository = repository;
		}

		public async Task<IEnumerable<EmployeeEducation>> GetAll()
		{
			return await _repository.GetAll();
		}

		public async Task<EmployeeEducation> GetById(int id)
		{
			return await _repository.GetById(id);
		}

		public async Task Add(EmployeeEducation education)
		{
			await _repository.Add(education);
		}

		public async Task Update(EmployeeEducation education)
		{
			await _repository.Update(education);
		}

		public async Task Delete(int id)
		{
			await _repository.Delete(id);
		}
	}

}
