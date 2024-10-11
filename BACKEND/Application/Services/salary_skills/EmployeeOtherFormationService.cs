using soft_carriere_competence.Core.Entities.salary_skills;
using soft_carriere_competence.Core.Interface;

namespace soft_carriere_competence.Application.Services.salary_skills
{
	public class EmployeeOtherFormationService
	{
		private readonly ICrudRepository<EmployeeOtherFormation> _repository;

		public EmployeeOtherFormationService(ICrudRepository<EmployeeOtherFormation> repository)
		{
			_repository = repository;
		}

		public async Task<IEnumerable<EmployeeOtherFormation>> GetAll()
		{
			return await _repository.GetAll();
		}

		public async Task<EmployeeOtherFormation> GetById(int id)
		{
			return await _repository.GetById(id);
		}

		public async Task Add(EmployeeOtherFormation employeeOtherFormation)
		{
			await _repository.Add(employeeOtherFormation);
		}

		public async Task Update(EmployeeOtherFormation employeeOtherFormation)
		{
			await _repository.Update(employeeOtherFormation);
		}

		public async Task Delete(int id)
		{
			await _repository.Delete(id);
		}
	}
}
