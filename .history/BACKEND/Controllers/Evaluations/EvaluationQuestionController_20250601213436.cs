using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using soft_carriere_competence.Application.Dtos.EvaluationsDto;
using soft_carriere_competence.Application.Services.Evaluations;
using soft_carriere_competence.Core.Entities.Evaluations;
using soft_carriere_competence.Infrastructure.Data;
using Microsoft.Extensions.Logging;
using soft_carriere_competence.Infrastructure;
using soft_carriere_competence.Core.Interface.GenericRepository;
using System.Text.Json;

namespace soft_carriere_competence.Controllers.Evaluations
{
    [ApiController]
    [Route("api/[controller]")]
    public class EvaluationQuestionController : ControllerBase
    {
        private readonly EvaluationService _evaluationService;
        private readonly EvaluationResponseService _responseService;
        private readonly ApplicationDbContext _context;
        private readonly ILogger<EvaluationQuestionController> _logger;
        private readonly IGenericRepository<EvaluationQuestion> _questionRepository;
        private readonly IGenericRepository<EvaluationCompetence> _competenceRepository;

        public class EvaluationQuestionModel
        {
            public int QuestionId { get; set; }
            public string QuestionText { get; set; }
            public int CompetenceLineId { get; set; }
            public string CompetenceName { get; set; }
        }
        
        public class QuestionResponseDTO
        {
            public int QuestionId { get; set; }
            public int Rating { get; set; }
            public string Comment { get; set; }
        }
        
        public class SaveResponsesDTO
        {
            public int EvaluationId { get; set; }
            public int EmployeeId { get; set; }
            public List<QuestionResponseDTO> Questions { get; set; }
            public string Notes { get; set; }
            public decimal Average { get; set; }
        }

        public EvaluationQuestionController(
            EvaluationService evaluationService,
            ApplicationDbContext context,
            EvaluationResponseService responseService,
            ILogger<EvaluationQuestionController> logger,
            IGenericRepository<EvaluationQuestion> questionRepository,
            IGenericRepository<EvaluationCompetence> competenceRepository)
        {
            _evaluationService = evaluationService;
            _context = context;
            _responseService = responseService;
            _logger = logger;
            _questionRepository = questionRepository;
            _competenceRepository = competenceRepository;
        }

        [HttpGet("questions")]
        public async Task<IActionResult> GetEvaluationQuestions(
            [FromQuery] int positionId,
            [FromQuery] int? evaluationTypeId = null,
            [FromQuery] int? competenceLineId = null)
        {
            try
            {
                Console.WriteLine($"Requête reçue - positionId: {positionId}, evaluationTypeId: {evaluationTypeId}, competenceLineId: {competenceLineId}");

                if (evaluationTypeId.HasValue && competenceLineId.HasValue)
                {
                    var questions = await _evaluationService.GetEvaluationQuestionsByTypePositionAndCompetenceAsync(
                        evaluationTypeId.Value,
                        positionId,
                        competenceLineId.Value
                    );

                    Console.WriteLine($"Nombre de questions trouvées : {questions.Count()}");
                    
                    if (!questions.Any())
                    {
                        // Vérifier si des questions existent pour cette position
                        var questionsForPosition = await _evaluationService.GetEvaluationQuestionsByPositionAsync(positionId);
                        Console.WriteLine($"Nombre total de questions pour cette position : {questionsForPosition.Count()}");
                        
                        return Ok(new { 
                            message = "Aucune question trouvée pour cette combinaison de paramètres",
                            questions = new List<EvaluationQuestion>(),
                            totalQuestionsForPosition = questionsForPosition.Count()
                        });
                    }

                    return Ok(questions);
                }
                else
                {
                    var questions = await _evaluationService.GetEvaluationQuestionsByPositionAsync(positionId);
                    Console.WriteLine($"Nombre de questions trouvées pour la position : {questions.Count()}");
                    return Ok(questions);
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Erreur lors de la récupération des questions : {ex.Message}");
                Console.WriteLine($"Stack trace : {ex.StackTrace}");
                return StatusCode(500, new { error = ex.Message, details = ex.StackTrace });
            }
        }

        [HttpGet("questions/{id}")]
        public async Task<IActionResult> GetEvaluationQuestionById(int id)
        {
            try
            {
                var question = await _evaluationService.GetEvaluationQuestionByIdAsync(id);
                if (question == null)
                {
                    return NotFound($"Question with ID {id} not found.");
                }
                return Ok(question);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { error = ex.Message });
            }
        }

        [HttpGet("paginated")]
        public async Task<IActionResult> GetPaginatedEvaluationQuestions([FromQuery] int pageNumber = 1, [FromQuery] int pageSize = 10)
        {
            try
            {
                var questions = await _evaluationService.GetPaginatedEvaluationQuestionsAsync(pageNumber, pageSize);
                return Ok(questions);
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }

        [HttpGet("evaluation/{evaluationId}/selected-questions")]
        public async Task<IActionResult> GetSelectedQuestionsAndResponses(int evaluationId)
        {
            try
            {
                var selectedQuestions = await _context.evaluationSelectedQuestions
                    .Where(esq => esq.EvaluationId == evaluationId)
                    .Join(_context.evaluationQuestions,
                        esq => esq.QuestionId,
                        eq => eq.questionId,
                        (esq, eq) => new
                        {
                            QuestionId = eq.questionId,
                            QuestionText = eq.question,
                            CompetenceLineId = eq.CompetenceLineId,
                            ResponseTypeId = eq.ResponseTypeId,
                            Response = _context.evaluationResponses
                                .FirstOrDefault(er => er.EvaluationId == evaluationId && er.QuestionId == eq.questionId)
                        })
                    .Join(_context.ResponseTypes,
                        q => q.ResponseTypeId,
                        rt => rt.ResponseTypeId,
                        (q, rt) => new
                        {
                            q.QuestionId,
                            q.QuestionText,
                            q.CompetenceLineId,
                            ResponseTypeId = q.ResponseTypeId,
                            ResponseType = rt.TypeName,
                            q.Response
                        })
                    .Join(_context.competenceLines.Include(cl => cl.SkillPosition).ThenInclude(sp => sp.Skill),
                        q => q.CompetenceLineId,
                        cl => cl.CompetenceLineId,
                        (q, cl) => new
                        {
                            q.QuestionId,
                            q.QuestionText,
                            q.ResponseTypeId,
                            q.ResponseType,
                            CompetenceLine = new
                            {
                                cl.CompetenceLineId,
                                CompetenceName = cl.SkillPosition.Skill.Name ?? cl.Description
                            },
                            q.Response
                        })
                    .ToListAsync();

                return Ok(selectedQuestions);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { error = ex.Message });
            }
        }

        [HttpPost("evaluation/{evaluationId}/responses")]
        public async Task<IActionResult> SaveResponse(int evaluationId, [FromBody] EvaluationResponseDto response)
        {
            try
            {
                await _responseService.SaveResponseAsync(evaluationId, response);
                return Ok();
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { error = ex.Message });
            }
        }

        [HttpGet("evaluation/{evaluationId}/responses")]
        public async Task<IActionResult> GetResponses(int evaluationId)
        {
            try
            {
                var responses = await _responseService.GetResponsesAsync(evaluationId);
                return Ok(responses);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { error = ex.Message });
            }
        }

        [HttpGet("evaluation/{evaluationId}/responses/{questionId}")]
        public async Task<IActionResult> GetResponse(int evaluationId, int questionId)
        {
            try
            {
                var response = await _responseService.GetResponseAsync(evaluationId, questionId);
                if (response == null)
                {
                    return NotFound();
                }
                return Ok(response);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { error = ex.Message });
            }
        }

        [HttpPut("responses/{responseId}")]
        public async Task<IActionResult> UpdateResponse(int responseId, [FromBody] EvaluationResponseDto response)
        {
            try
            {
                await _responseService.UpdateResponseAsync(responseId, response);
                return Ok();
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { error = ex.Message });
            }
        }

        [HttpDelete("responses/{responseId}")]
        public async Task<IActionResult> DeleteResponse(int responseId)
        {
            try
            {
                await _responseService.DeleteResponseAsync(responseId);
                return NoContent();
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { error = ex.Message });
            }
        }

        [HttpGet("evaluation/{evaluationId}/questions")]
        public async Task<IActionResult> GetQuestionsForEvaluation(int evaluationId)
        {
            _logger.LogInformation($"Récupération des questions pour l'évaluation ID: {evaluationId}");
            
            try
            {
                // Récupérer les questions associées à cette évaluation
                var templateId = await _context.Evaluations
                    .Where(e => e.EvaluationId == evaluationId)
                    .Select(e => e.TemplateId)
                    .FirstOrDefaultAsync();
                
                if (templateId <= 0)
                {
                    return NotFound(new { message = "Modèle d'évaluation non trouvé" });
                }
                
                // Joindre les compétences aux questions
                var questions = await _context.EvaluationQuestions
                    .Where(q => q.TemplateId == templateId)
                    .Join(
                        _context.EvaluationCompetences,
                        q => q.CompetenceLineId,
                        c => c.CompetenceLineId,
                        (q, c) => new EvaluationQuestionModel
                        {
                            QuestionId = q.QuestionId,
                            QuestionText = q.QuestionText,
                            CompetenceLineId = q.CompetenceLineId,
                            CompetenceName = c.CompetenceName
                        }
                    )
                    .ToListAsync();
                
                return Ok(questions);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Erreur lors de la récupération des questions pour l'évaluation {evaluationId}");
                return StatusCode(500, new { message = "Une erreur est survenue lors de la récupération des questions." });
            }
        }
        
        [HttpPost("evaluation/save-responses")]
        public async Task<IActionResult> SaveQuestionResponses([FromBody] SaveResponsesDTO request)
        {
            _logger.LogInformation($"Enregistrement des réponses pour l'évaluation ID: {request.EvaluationId}, employé: {request.EmployeeId}");
            
            if (request == null || request.Questions == null || !request.Questions.Any())
            {
                return BadRequest(new { message = "Données invalides" });
            }
            
            try
            {
                // Vérifier que l'évaluation existe
                var evaluation = await _context.Evaluations
                    .FirstOrDefaultAsync(e => e.EvaluationId == request.EvaluationId);
                
                if (evaluation == null)
                {
                    return NotFound(new { message = "Évaluation non trouvée" });
                }
                
                // Récupérer l'entretien associé
                var interview = await _context.EvaluationInterviews
                    .FirstOrDefaultAsync(i => i.EvaluationId == request.EvaluationId);
                
                if (interview == null)
                {
                    return NotFound(new { message = "Entretien d'évaluation non trouvé" });
                }
                
                // Stocker les réponses dans le champ notes de l'entretien
                var notesData = new
                {
                    questions = request.Questions,
                    notes = request.Notes,
                    average = request.Average
                };
                
                interview.notes = JsonSerializer.Serialize(notesData);
                
                // Mettre à jour le statut de l'entretien si nécessaire
                interview.status = InterviewStatus.IN_PROGRESS;
                
                await _context.SaveChangesAsync();
                
                return Ok(new { message = "Réponses enregistrées avec succès" });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Erreur lors de l'enregistrement des réponses pour l'évaluation {request.EvaluationId}");
                return StatusCode(500, new { message = "Une erreur est survenue lors de l'enregistrement des réponses." });
            }
        }
    }
} 