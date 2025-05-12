using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using soft_carriere_competence.Application.Dtos.EvaluationsDto;
using soft_carriere_competence.Application.Services.Evaluations;
using soft_carriere_competence.Core.Entities.Evaluations;
using soft_carriere_competence.Infrastructure.Data;

namespace soft_carriere_competence.Controllers.Evaluations
{
    [ApiController]
    [Route("api/[controller]")]
    public class EvaluationQuestionController : ControllerBase
    {
        private readonly EvaluationService _evaluationService;
        private readonly EvaluationResponseService _responseService;
        private readonly ApplicationDbContext _context;

        public EvaluationQuestionController(
            EvaluationService evaluationService,
            ApplicationDbContext context,
            EvaluationResponseService responseService)
        {
            _evaluationService = evaluationService;
            _context = context;
            _responseService = responseService;
        }

        [HttpGet("questions")]
        public async Task<IActionResult> GetEvaluationQuestions([FromQuery] int evaluationTypeId, [FromQuery] int positionId)
        {
            try
            {
                var questions = await _evaluationService.GetEvaluationQuestionsAsync(evaluationTypeId, positionId);
                return Ok(questions);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { error = ex.Message });
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

        [HttpGet("questions/paginated")]
        public IActionResult GetPaginatedEvaluationQuestions([FromQuery] int pageNumber = 1, [FromQuery] int pageSize = 10)
        {
            try
            {
                var questions = _evaluationService.GetPaginatedEvaluationQuestions(pageNumber, pageSize);
                return Ok(questions);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { error = ex.Message });
            }
        }

        [HttpGet("evaluation/{evaluationId}/selected-questions")]
        public async Task<IActionResult> GetSelectedQuestionsAndResponses(int evaluationId)
        {
            try
            {
                var selectedQuestions = await _context.evaluationSelectedQuestions
                    .Where(esq => esq.evaluationId == evaluationId)
                    .Join(_context.evaluationQuestions,
                        esq => esq.questionId,
                        eq => eq.questiondId,
                        (esq, eq) => new
                        {
                            QuestionId = eq.questiondId,
                            QuestionText = eq.questionText,
                            CompetenceLineId = eq.competenceLineId,
                            Response = _context.evaluationResponses
                                .FirstOrDefault(er => er.evaluationId == evaluationId && er.questionId == eq.questiondId)
                        })
                    .Join(_context.competenceLines,
                        q => q.CompetenceLineId,
                        cl => cl.competenceLineId,
                        (q, cl) => new
                        {
                            q.QuestionId,
                            q.QuestionText,
                            CompetenceLine = new
                            {
                                cl.competenceLineId,
                                cl.competenceLineName
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
    }
} 