using soft_carriere_competence.Core.Entities;
using soft_carriere_competence.Core.Interface;

namespace soft_carriere_competence.Application.Services.competences_salaries
{
	public class StudyPathService
	{
		private readonly ICrudRepository<StudyPath> _repository;

		public StudyPathService(ICrudRepository<StudyPath> repository)
		{
			_repository = repository;
		}

		public async Task<IEnumerable<StudyPath>> GetAllStudyPaths()
		{
			return await _repository.GetAll();
		}

		public async Task<StudyPath> GetStudyPathById(int id)
		{
			return await _repository.GetById(id);
		}

		public async Task AddStudyPath(StudyPath studyPath)
		{
			await _repository.Add(studyPath);
		}

		public async Task UpdateStudyPath(StudyPath studyPath)
		{
			await _repository.Update(studyPath);
		}

		public async Task DeleteStudyPath(int id)
		{
			await _repository.Delete(id);
		}
	}
}
