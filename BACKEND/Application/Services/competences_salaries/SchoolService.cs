using soft_carriere_competence.Core.Entities;
using soft_carriere_competence.Core.Interface;

namespace soft_carriere_competence.Application.Services.competences_salaries
{
	public class SchoolService
	{
		private readonly ICrudRepository<School> _repository;

		public SchoolService(ICrudRepository<School> repository)
		{
			_repository = repository;
		}

		public async Task<IEnumerable<School>> GetAllSchools()
		{
			return await _repository.GetAll();
		}

		public async Task<School> GetSchoolById(int id)
		{
			return await _repository.GetById(id);
		}

		public async Task AddSchool(School school)
		{
			await _repository.Add(school);
		}

		public async Task UpdateSchool(School school)
		{
			await _repository.Update(school);
		}

		public async Task DeleteSchool(int id)
		{
			await _repository.Delete(id);
		}
	}
}
