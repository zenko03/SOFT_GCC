using soft_carriere_competence.Core.Entities;
using soft_carriere_competence.Core.Interface;

namespace soft_carriere_competence.Application.Services.competences_salaries
{
	public class DegreeService
	{
		private readonly ICrudRepository<Degree> _repository;

		public DegreeService(ICrudRepository<Degree> repository)
		{
			_repository = repository;
		}

		public async Task<IEnumerable<Degree>> GetAllDegrees()
		{
			return await _repository.GetAll();
		}

		public async Task<Degree> GetDegreeById(int id)
		{
			return await _repository.GetById(id);
		}

		public async Task AddDegree(Degree degree)
		{
			await _repository.Add(degree);
		}

		public async Task UpdateDegree(Degree degree)
		{
			await _repository.Update(degree);
		}

		public async Task DeleteDegree(int id)
		{
			await _repository.Delete(id);
		}
	}
}
