using soft_carriere_competence.Core.Entities;
using soft_carriere_competence.Core.Interface;
using soft_carriere_competence.Infrastructure.Repositories;

namespace soft_carriere_competence.Application.Services
{
	public class EmployeeEducationService
	{
		private readonly ICrudRepository<EmployeeEducation> _repository;

		public EmployeeEducationService(ICrudRepository<EmployeeEducation> repository)
		{
			_repository = repository;
		}

		public async Task<IEnumerable<EmployeeEducation>> GetAllEmployeeEducations()
		{
			return await _repository.GetAll();
		}

		public async Task<EmployeeEducation> GetEmployeeEducationById(int id)
		{
			return await _repository.GetById(id);
		}

		public async Task AddEmployeeEducation(EmployeeEducation education)
		{
			await _repository.Add(education);
		}

		public async Task UpdateEmployeeEducation(EmployeeEducation education)
		{
			await _repository.Update(education);
		}

		public async Task DeleteEmployeeEducation(int id)
		{
			await _repository.Delete(id);
		}
	}

}
