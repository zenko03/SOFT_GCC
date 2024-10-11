using soft_carriere_competence.Core.Entities.salary_skills;
using soft_carriere_competence.Core.Interface;

namespace soft_carriere_competence.Application.Services.salary_skills
{
	public class EmployeeSkillService
	{
			private readonly ICrudRepository<EmployeeSkill> _repository;

			public EmployeeSkillService(ICrudRepository<EmployeeSkill> repository)
			{
				_repository = repository;
			}

			public async Task<IEnumerable<EmployeeSkill>> GetAll()
			{
				return await _repository.GetAll();
			}

			public async Task<EmployeeSkill> GetById(int id)
			{
				return await _repository.GetById(id);
			}

			public async Task Add(EmployeeSkill employeeSkill)
			{
				await _repository.Add(employeeSkill);
			}

			public async Task Update(EmployeeSkill employeeSkill)
			{
				await _repository.Update(employeeSkill);
			}

			public async Task Delete(int id)
			{
				await _repository.Delete(id);
			}
	}
}
