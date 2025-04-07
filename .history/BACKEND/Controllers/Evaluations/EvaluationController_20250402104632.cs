using Microsoft.AspNetCore.Http;
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
	public class EvaluationController : ControllerBase
	{
		private readonly EvaluationService _evaluationService;
		private readonly EvaluationResponseService _responseService;

		private readonly ApplicationDbContext _context;


		public EvaluationController(EvaluationService evaluationService, 
		ApplicationDbContext context, EvaluationResponseService responseService)
		{
			_evaluationService = evaluationService;
			_context = context;
			_responseService = responseService;
		}

		// Create a new evaluation question
		[HttpPost("questions")]
		public async Task<IActionResult> CreateEvaluationQuestion([FromBody] EvaluationQuestion question)
		{
			if (question == null)
			{
				return BadRequest("Question data is required.");
			}

			try
			{
				await _evaluationService.CreateEvaluationQuestionAsync(question);
				return CreatedAtAction(nameof(GetEvaluationQuestionById), new { id = question.questiondId }, question);
			}
			catch (Exception ex)
			{
				return StatusCode(500, new { error = ex.Message });
			}
		}
		// Get all evaluation questions
		[HttpGet("questionsAll")]
		public async Task<IActionResult> GetAllEvaluationQuestions()
		{
			var questions = await _evaluationService.GetAllEvaluationQuestionsAsync();
			return Ok(questions);
		}

		// Delete an evaluation question
		[HttpDelete("questions/{id}")]
		public async Task<IActionResult> DeleteEvaluationQuestion(int id)
		{
			try
			{
				var deleted = await _evaluationService.DeleteEvaluationQuestionAsync(id);
				if (!deleted)
				{
					return NotFound($"Question with ID {id} not found.");
				}
				return NoContent(); // 204 No Content
			}
			catch (Exception ex)
			{
				return StatusCode(500, new { error = ex.Message });
			}
		}


		// Update an existing evaluation question
		[HttpPut("questions/{id}")]
		public async Task<IActionResult> UpdateEvaluationQuestion(int id, [FromBody] EvaluationQuestion question)
		{
			if (question == null || question.questiondId != id)
			{
				return BadRequest("Invalid question data.");
			}

			try
			{
				var updated = await _evaluationService.UpdateEvaluationQuestionAsync(question);
				if (!updated)
				{
					return NotFound($"Question with ID {id} not found.");
				}
				return NoContent(); // 204 No Content
			}
			catch (Exception ex)
			{
				return StatusCode(500, new { error = ex.Message });
			}
		}

		// Get a specific evaluation question by ID
		[HttpGet("questions/{id}")]
		public async Task<IActionResult> GetEvaluationQuestionById(int id)
		{
			var question = await _evaluationService.GetEvaluationQuestionByIdAsync(id);
			if (question == null)
			{
				return NotFound($"Question with ID {id} not found.");
			}
			return Ok(question);
		}
		[HttpGet("questions")]
		public async Task<IActionResult> GetEvaluationQuestions([FromQuery] int evaluationTypeId, [FromQuery] int positionId)
		{
			Console.WriteLine("Before the try");

			try
			{
				Console.WriteLine("in the block try, before function getEvalQuestions");

				var questions = await _evaluationService.GetEvaluationQuestionsAsync(evaluationTypeId, positionId);
				Console.WriteLine("in the block try, after calling getEvalQuestions");

				// Add explicit null check
				if (questions == null)
				{
					return NotFound($"No questions found for evaluationTypeId {evaluationTypeId} and positionId {positionId}");
				}

				return Ok(questions);
			}
			catch (Exception ex)
			{
				// Log the full exception details
				Console.WriteLine($"Error in GetEvaluationQuestions: {ex.Message}");
				Console.WriteLine($"Stack Trace: {ex.StackTrace}");

				return StatusCode(500, new
				{
					message = "An error occurred while fetching evaluation questions",
					details = ex.Message
				});
			}
		}

		[HttpGet("types")]
		public async Task<IActionResult> GetEvaluationTypes()
		{
			var evaluationTypes = await _evaluationService.GetEvaluationTypeAsync();
			if (evaluationTypes == null || !evaluationTypes.Any())
				return NotFound("No evaluation types found.");

			return Ok(evaluationTypes);
		}

		[HttpGet("postes")]
		public async Task<IActionResult> GetPostes()
		{
			var posts = await _evaluationService.GetPostesAsync(); // Assuming you have a method in your service to get posts
			if (posts == null || !posts.Any())
				return NotFound("No posts found.");

			return Ok(posts);
		}

		[HttpPost("calculate-average")]
		public IActionResult CalculateAverage([FromBody] Dictionary<int, int> ratings)
		{
			if (ratings == null || ratings.Count == 0)
			{
				return BadRequest("No ratings provided.");
			}

			double average = _evaluationService.CalculateAverageRating(ratings);
			return Ok(new { average = Math.Round(average, 2) });
		}



		[HttpPost("save-evaluation-results")]
		public async Task<IActionResult> SaveEvaluationResults([FromBody] EvaluationResultsDto dto)
		{
			// Log des données reçues
			Console.WriteLine("==== Données reçues dans SaveEvaluationResults ====");
			Console.WriteLine($"EvaluationId: {dto.EvaluationId}");
			Console.WriteLine("Ratings:");
			foreach (var rating in dto.Ratings)
			{
				Console.WriteLine($"  QuestionId: {rating.Key}, Score: {rating.Value}");
			}
			Console.WriteLine($"OverallScore: {dto.OverallScore}");
			Console.WriteLine($"Strengths: {dto.Strengths}");
			Console.WriteLine($"Weaknesses: {dto.Weaknesses}");
			Console.WriteLine($"GeneralEvaluation: {dto.GeneralEvaluation}");

			try
			{
				Console.WriteLine("==== Appel du service SaveEvaluationResultsAsync ====");

				// Appel au service pour sauvegarder les données
				await _evaluationService.SaveEvaluationResultsAsync(
					dto.EvaluationId,
					dto.Ratings,
					dto.OverallScore,
					dto.Strengths,
					dto.Weaknesses,
					dto.GeneralEvaluation
				);

				Console.WriteLine("==== Sauvegarde réussie ====");

				return Ok(new { message = "Evaluation results saved successfully." });
			}
			catch (Exception ex)
			{
				// Log de l'exception
				Console.WriteLine("==== Erreur lors de la sauvegarde ====");
				Console.WriteLine(ex.Message);

				return StatusCode(500, new { error = ex.Message });
			}
		}


		[HttpPost("suggestions")]
		public async Task<IActionResult> GetTrainingSuggestions([FromBody] TrainingSuggestionsRequestDto dto)
		{
			try
			{
				var suggestions = await _evaluationService.GetTrainingSuggestionsByQuestionsAsync(dto.Ratings);
				return Ok(suggestions);
			}
			catch (Exception ex)
			{
				return StatusCode(500, new { error = ex.Message });
			}
		}



		[HttpPost("validate-evaluation")]
		public async Task<IActionResult> ValidateEvaluation([FromBody] EvaluationValidationDto dto)
		{
			try
			{
				var success = await _evaluationService.ValidateEvaluationAsync(
					dto.EvaluationId,
					dto.IsServiceApproved,
					dto.IsDgApproved,
					dto.ServiceApprovalDate,
					dto.DgApprovalDate);

				if (success)
				{
					return Ok(new { message = "Evaluation validated successfully." });
				}
				return BadRequest("Failed to validate evaluation.");
			}
			catch (Exception ex)
			{
				return StatusCode(500, new { error = ex.Message });
			}
		}




		[HttpPost("create-training-suggestion")]
		public async Task<IActionResult> CreateTrainingSuggestion([FromBody] TrainingSuggestionCreationDto dto)
		{
			try
			{
				var suggestion = new TrainingSuggestion
				{
					evaluationTypeId = dto.EvaluationTypeId,
					questionId = dto.QuestionId,
					Training = dto.Training,
					Details = dto.Details,
					scoreThreshold = dto.ScoreThreshold,
					state = dto.State
				};
				await _evaluationService.CreateTrainingSuggestionAsync(suggestion);
				return Ok(new { message = "Training suggestion created successfully." });
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
				response.EvaluationId = evaluationId;
				var savedResponse = await _responseService.SaveResponseAsync(response);
				return Ok(savedResponse);
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
				var responses = await _responseService.GetResponsesByEvaluationIdAsync(evaluationId);
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
				var response = await _responseService.GetResponseByQuestionIdAsync(evaluationId, questionId);
				if (response == null)
					return NotFound();
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
				var result = await _responseService.UpdateResponseAsync(responseId, response);
				return Ok(new { message = "Réponse mise à jour avec succès" });
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
				var result = await _responseService.DeleteResponseAsync(responseId);
				return Ok(new { message = "Réponse supprimée avec succès" });
			}
			catch (Exception ex)
			{
				return StatusCode(500, new { error = ex.Message });
			}
		}



		//CRUD TRAINING SUGGESTIONS
		// Get all training suggestions
		[HttpGet("training-suggestions")]
		public async Task<IActionResult> GetAllTrainingSuggestions()
		{
			try
			{
				var suggestions = await _evaluationService.GetAllTrainingSuggestionsAsync();
				return Ok(suggestions);
			}
			catch (Exception ex)
			{
				return StatusCode(500, new { error = ex.Message });
			}
		}

		// Get a specific training suggestion by ID
		[HttpGet("training-suggestions/{id}")]
		public async Task<IActionResult> GetTrainingSuggestionById(int id)
		{
			try
			{
				var suggestion = await _evaluationService.GetTrainingSuggestionByIdAsync(id);
				if (suggestion == null)
				{
					return NotFound($"Training suggestion with ID {id} not found.");
				}
				return Ok(suggestion);
			}
			catch (Exception ex)
			{
				return StatusCode(500, new { error = ex.Message });
			}
		}

		// Update an existing training suggestion
		[HttpPut("training-suggestions/{id}")]
		public async Task<IActionResult> UpdateTrainingSuggestion(int id, [FromBody] TrainingSuggestionCreationDto dto)
		{
			try
			{
				var suggestion = new TrainingSuggestion
				{
					TrainingSuggestionId = id,
					evaluationTypeId = dto.EvaluationTypeId,
					questionId = dto.QuestionId,
					Training = dto.Training,
					Details = dto.Details,
					scoreThreshold = dto.ScoreThreshold,
					state = dto.State
				};

				var updated = await _evaluationService.UpdateTrainingSuggestionAsync(suggestion);
				if (!updated)
				{
					return NotFound($"Training suggestion with ID {id} not found.");
				}
				return NoContent(); // 204 No Content
			}
			catch (Exception ex)
			{
				return StatusCode(500, new { error = ex.Message });
			}
		}

		// Delete a training suggestion
		[HttpDelete("training-suggestions/{id}")]
		public async Task<IActionResult> DeleteTrainingSuggestion(int id)
		{
			try
			{
				var deleted = await _evaluationService.DeleteTrainingSuggestionAsync(id);
				if (!deleted)
				{
					return NotFound($"Training suggestion with ID {id} not found.");
				}
				return NoContent(); // 204 No Content
			}
			catch (Exception ex)
			{
				return StatusCode(500, new { error = ex.Message });
			}
		}


		[HttpGet("training-suggestions/paginated")]
		public IActionResult GetPaginatedTrainingSuggestions([FromQuery] int pageNumber = 1, [FromQuery] int pageSize = 10)
		{
			try
			{
				if (pageNumber < 1) pageNumber = 1;
				if (pageSize < 1) pageSize = 10;
				if (pageSize > 100) pageSize = 100; // Limite supérieure pour éviter les requêtes excessives

				var (items, totalPages) = _evaluationService.GetPaginatedTrainingSuggestionsAsync(pageNumber, pageSize).Result;

				return Ok(new
				{
					Items = items,
					PageNumber = pageNumber,
					PageSize = pageSize,
					TotalPages = totalPages
				});
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
				if (pageNumber < 1) pageNumber = 1;
				if (pageSize < 1) pageSize = 10;
				if (pageSize > 100) pageSize = 100; // Limite supérieure pour éviter les requêtes excessives

				var (items, totalPages) = _evaluationService.GetPaginatedEvaluationQuestionsAsync(pageNumber, pageSize).Result;

				return Ok(new
				{
					Items = items,
					PageNumber = pageNumber,
					PageSize = pageSize,
					TotalPages = totalPages
				});
			}
			catch (Exception ex)
			{
				return StatusCode(500, new { error = ex.Message });
			}
		}


		//EVALUATIONSALARY LOGIN

		[HttpGet("validate-token")]
		public IActionResult ValidateToken()
		{
			// Le jeton est déjà validé par le middleware d'authentification
			// Si cette méthode est atteinte, c'est que le jeton est valide
			return Ok(new { valid = true });
		}

		[HttpGet("{id}")]
		public async Task<IActionResult> GetEvaluationDetails(int id)
		{
			try
			{
				// Récupérer l'évaluation avec toutes les relations nécessaires
				var evaluation = await _context.Evaluations
					.Include(e => e.EvaluationType)
					.Include(e => e.User)
						.ThenInclude(u => u.Position)
					.Include(e => e.User)
						.ThenInclude(u => u.Department)
					.Include(e => e.Supervisors)
						.ThenInclude(s => s.Supervisor)
					.FirstOrDefaultAsync(e => e.EvaluationId == id);

				if (evaluation == null)
					return NotFound($"Évaluation avec ID {id} non trouvée");

				// Récupérer les questions sélectionnées pour cette évaluation
				var selectedQuestions = await _context.evaluationSelectedQuestions
					.Where(sq => sq.EvaluationId == id)
					.Include(sq => sq.Question)
					.Select(sq => new
					{
						questionId = sq.Question.questiondId,
						text = sq.Question.question,
						competenceLineId = sq.CompetenceLineId,
						responseType = sq.Question.responseType ?? "SCORE", // Type par défaut si non spécifié
						options = sq.Question.options ?? new string[] { } // Options pour les questions QCM
					})
					.ToListAsync();

				// Récupérer les réponses existantes
				var existingResponses = await _context.EvaluationResponses
					.Where(r => r.EvaluationId == id)
					.ToDictionaryAsync(r => r.QuestionId, r => r);

				// Construire la réponse avec toutes les informations nécessaires
				var response = new
				{
					evaluationId = evaluation.EvaluationId,
					title = evaluation.EvaluationType.Designation,
					description = $"Évaluation du {evaluation.StartDate.ToShortDateString()} au {evaluation.EndDate.ToShortDateString()}",
					employeeInfo = new
					{
						id = evaluation.User.Id,
						name = $"{evaluation.User.FirstName} {evaluation.User.LastName}",
						position = evaluation.User.Position?.PositionName,
						department = evaluation.User.Department?.Name
					},
					supervisors = evaluation.Supervisors.Select(s => new
					{
						id = s.Supervisor.Id,
						name = $"{s.Supervisor.FirstName} {s.Supervisor.LastName}"
					}),
					questions = selectedQuestions.Select(q => new
					{
						questionId = q.questionId,
						text = q.text,
						competenceLineId = q.competenceLineId,
						responseType = q.responseType,
						options = q.options,
						existingResponse = existingResponses.ContainsKey(q.questionId) ? new
						{
							value = existingResponses[q.questionId].ResponseValue,
							timeSpent = existingResponses[q.questionId].TimeSpent,
							startTime = existingResponses[q.questionId].StartTime,
							endTime = existingResponses[q.questionId].EndTime
						} : null
					}),
					status = new
					{
						isCompleted = evaluation.state == 20,
						isServiceApproved = evaluation.IsServiceApproved,
						isDgApproved = evaluation.isDgApproved,
						serviceApprovalDate = evaluation.serviceApprovalDate,
						dgApprovalDate = evaluation.dgApprovalDate
					},
					results = evaluation.state == 20 ? new
					{
						overallScore = evaluation.OverallScore,
						strengths = evaluation.strengths,
						weaknesses = evaluation.weaknesses,
						comments = evaluation.Comments
					} : null
				};

				return Ok(response);
			}
			catch (Exception ex)
			{
				return StatusCode(500, new { error = ex.Message });
			}
		}
	}
}
