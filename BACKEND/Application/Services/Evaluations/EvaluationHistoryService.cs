using Microsoft.EntityFrameworkCore;
using soft_carriere_competence.Application.Dtos.EvaluationsDto;
using soft_carriere_competence.Core.Entities.Evaluations;
using soft_carriere_competence.Core.Interface;
using soft_carriere_competence.Infrastructure.Data;

namespace soft_carriere_competence.Application.Services.Evaluations
{
    public class EvaluationHistoryService
    {
        private readonly ApplicationDbContext _context;
        private readonly IGenericRepository<VEvaluationHistory> _evaluationHistoryRepository;

        public EvaluationHistoryService(ApplicationDbContext context, IGenericRepository<VEvaluationHistory> evaluationHistoryRepository)
        {
            _context = context;
            _evaluationHistoryRepository = evaluationHistoryRepository;
        }

        public async Task<List<EvaluationHistoryDto>> GetEvaluationHistoryAsync(
    DateTime? startDate,
    DateTime? endDate,
    string? evaluationType,
    string? department,
    string? employeeName)
        {
            var query = _context.vEvaluationHistories.AsQueryable();

            if (startDate.HasValue)
                query = query.Where(e => e.StartDate >= startDate.Value);

            if (endDate.HasValue)
                query = query.Where(e => e.EndDate <= endDate.Value);

            if (!string.IsNullOrEmpty(evaluationType))
                query = query.Where(e => e.EvaluationType != null && e.EvaluationType == evaluationType);

            if (!string.IsNullOrEmpty(department))
                query = query.Where(e => e.Department != null && e.Department == department);

            if (!string.IsNullOrEmpty(employeeName))
                query = query.Where(e => e.LastName != null && e.LastName.Contains(employeeName));

            return await query.Select(e => new EvaluationHistoryDto
            {
                EvaluationId = e.EvaluationId,
                StartDate = e.StartDate,
                EndDate = e.EndDate,
                EvaluationType = e.EvaluationType ?? "",
                OverallScore = e.OverallScore,
                Status = e.status ,
                Recommendations = e.Recommendations ?? "",
                FirstName =e.FirstName,
                LastName=e.LastName,
                Position=e.Position
            }).ToListAsync();
        }


        public async Task<EvaluationHistoryDetailDto> GetEvaluationDetailAsync(int evaluationId)
        {
            var evaluation = await _context.vEvaluationHistories
                .Where(e => e.EvaluationId == evaluationId)
                .Select(e => new
                {
                    e.EvaluationId,
                    e.LastName,
                    e.FirstName,
                    e.Position,
                    e.EvaluationType,
                    e.StartDate,
                    e.EndDate,
                    e.OverallScore,
                    e.EvaluationComments,
                    e.Strengths,
                    e.Weaknesses,
                    e.Department,
                    e.InterviewDate,
                    e.InterviewStatus,
                    e.Recommendations,
                    e.ParticipantNames
                })
                .FirstOrDefaultAsync();

            if (evaluation == null)
                throw new KeyNotFoundException("Evaluation not found.");

            // Transform ParticipantNames en une liste après la récupération des données
            var participants = evaluation.ParticipantNames?
                .Split(new[] { ',' }, StringSplitOptions.RemoveEmptyEntries)
                .Select(name => name.Trim())
                .ToList();

            return new EvaluationHistoryDetailDto
            {
                EvaluationId = evaluation.EvaluationId,
                LastName = evaluation.LastName,
                FirstName = evaluation.FirstName,
                Position = evaluation.Position,
                EvaluationType = evaluation.EvaluationType,
                StartDate = evaluation.StartDate,
                EndDate = evaluation.EndDate,
                OverallScore = evaluation.OverallScore,
                EvaluationComments = evaluation.EvaluationComments,
                Strengths = evaluation.Strengths,
                Weaknesses = evaluation.Weaknesses,
                Department = evaluation.Department,
                InterviewDate = evaluation.InterviewDate,
                InterviewStatus = evaluation.InterviewStatus,
                Recommendations = evaluation.Recommendations,
                Participants = participants
            };
        }



        public async Task<StatisticsDto> GetEvaluationStatisticsAsync(DateTime? startDate, DateTime? endDate)
        {
            var query = _context.vEvaluationHistories.AsQueryable();

            if (startDate.HasValue)
                query = query.Where(e => e.StartDate >= startDate.Value);

            if (endDate.HasValue)
                query = query.Where(e => e.EndDate <= endDate.Value);

            var totalEvaluations = await query.CountAsync();
            var completedEvaluations = await query.CountAsync(e => e.status == 20);

            var evaluationTypeDistribution = await query
                .GroupBy(e => e.EvaluationType)
                .Select(g => new { Type = g.Key, Count = g.Count() })
                .ToDictionaryAsync(x => x.Type, x => x.Count);

            return new StatisticsDto
            {
                TotalEvaluations = totalEvaluations,
                CompletedEvaluations = completedEvaluations,
                CompletionRate = totalEvaluations > 0
                    ? (decimal)completedEvaluations / totalEvaluations * 100 : 0,
                EvaluationTypeDistribution = evaluationTypeDistribution
            };
        }

    }
}
