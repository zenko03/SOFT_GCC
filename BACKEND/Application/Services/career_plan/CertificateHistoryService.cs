using soft_carriere_competence.Core.Entities.career_plan;
using soft_carriere_competence.Core.Interface;

namespace soft_carriere_competence.Application.Services.career_plan
{
    public class CertificateHistoryService
    {
        private readonly ICrudRepository<CertificateHistory> _repository;

        public CertificateHistoryService(ICrudRepository<CertificateHistory> repository)
        {
            _repository = repository;
        }

        public async Task<IEnumerable<CertificateHistory>> GetAll()
        {
            return await _repository.GetAll();
        }

        public async Task<CertificateHistory> GetById(int id)
        {
            return await _repository.GetById(id);
        }

        public async Task Add(CertificateHistory certificateHistory)
        {
            await _repository.Add(certificateHistory);
        }

        public async Task Update(CertificateHistory certificateHistory, byte[]? pdfFile)
        {
            if (pdfFile != null)
            {
                certificateHistory.PdfFile = pdfFile;
            }
            await _repository.Update(certificateHistory);
        }

        public async Task Delete(int id)
        {
            await _repository.Delete(id);
        }
    }
}
