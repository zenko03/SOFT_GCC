public class EvaluationResponseService
{
    private readonly ApplicationDbContext _context;
    private readonly IGenericRepository<EvaluationResponses> _responseRepository;
    private readonly IGenericRepository<Evaluation> _evaluationRepository;
    private readonly IGenericRepository<EvaluationQuestion> _questionRepository;

    public EvaluationResponseService(
        ApplicationDbContext context,
        IGenericRepository<EvaluationResponses> responseRepository,
        IGenericRepository<Evaluation> evaluationRepository,
        IGenericRepository<EvaluationQuestion> questionRepository)
    {
        _context = context;
        _responseRepository = responseRepository;
        _evaluationRepository = evaluationRepository;
        _questionRepository = questionRepository;
    }

    public async Task<EvaluationResponses> SaveResponseAsync(EvaluationResponseDto responseDto)
    {
        // Vérifier si l'évaluation existe
        var evaluation = await _evaluationRepository.GetByIdAsync(responseDto.EvaluationId);
        if (evaluation == null)
            throw new Exception($"Évaluation avec l'ID {responseDto.EvaluationId} non trouvée");

        // Vérifier si la question existe
        var question = await _questionRepository.GetByIdAsync(responseDto.QuestionId);
        if (question == null)
            throw new Exception($"Question avec l'ID {responseDto.QuestionId} non trouvée");

        var response = new EvaluationResponses
        {
            EvaluationId = responseDto.EvaluationId,
            QuestionId = responseDto.QuestionId,
            ResponseType = responseDto.ResponseType,
            ResponseValue = responseDto.ResponseValue,
            TimeSpent = responseDto.TimeSpent,
            StartTime = responseDto.StartTime,
            EndTime = responseDto.EndTime,
            IsCorrect = responseDto.IsCorrect,
            State = 1 // Actif
        };

        await _responseRepository.CreateAsync(response);
        await _context.SaveChangesAsync();

        return response;
    }

    public async Task<List<EvaluationResponses>> GetResponsesByEvaluationIdAsync(int evaluationId)
    {
        return await _context.evaluationResponses
            .Include(r => r.Question)
            .Where(r => r.EvaluationId == evaluationId)
            .ToListAsync();
    }

    public async Task<EvaluationResponses> GetResponseByQuestionIdAsync(int evaluationId, int questionId)
    {
        return await _context.evaluationResponses
            .Include(r => r.Question)
            .FirstOrDefaultAsync(r => r.EvaluationId == evaluationId && r.QuestionId == questionId);
    }

    public async Task<bool> UpdateResponseAsync(int responseId, EvaluationResponseDto responseDto)
    {
        var response = await _responseRepository.GetByIdAsync(responseId);
        if (response == null)
            throw new Exception($"Réponse avec l'ID {responseId} non trouvée");

        response.ResponseType = responseDto.ResponseType;
        response.ResponseValue = responseDto.ResponseValue;
        response.TimeSpent = responseDto.TimeSpent;
        response.EndTime = responseDto.EndTime;
        response.IsCorrect = responseDto.IsCorrect;

        await _responseRepository.UpdateAsync(response);
        await _context.SaveChangesAsync();

        return true;
    }

    public async Task<bool> DeleteResponseAsync(int responseId)
    {
        var response = await _responseRepository.GetByIdAsync(responseId);
        if (response == null)
            throw new Exception($"Réponse avec l'ID {responseId} non trouvée");

        await _responseRepository.DeleteAsync(response);
        await _context.SaveChangesAsync();

        return true;
    }
}