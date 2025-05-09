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
				// Récupérer l'évaluation
				var evaluation = await _context.Evaluations
					.Include(e => e.EvaluationType)
					.FirstOrDefaultAsync(e => e.EvaluationId == id);

				if (evaluation == null)
					return NotFound($"Évaluation avec ID {id} non trouvée");

				// Récupérer l'utilisateur
				var user = await _context.Users
					.Include(u => u.Position)
					.Include(u => u.Department)
					.FirstOrDefaultAsync(u => u.Id == evaluation.UserId);

				if (user == null)
					return NotFound("Utilisateur associé à l'évaluation non trouvé");

				// Récupérer les questions sélectionnées pour cette évaluation
				var selectedQuestions = await _context.evaluationSelectedQuestions
					.Where(sq => sq.EvaluationId == id)
					.Include(sq => sq.SelectedQuestion)
					.Select(sq => new
					{
						questionId = sq.SelectedQuestion.questiondId,
						text = sq.SelectedQuestion.question,
						evaluationTypeId = sq.SelectedQuestion.evaluationTypeId,
						postId = sq.SelectedQuestion.positionId,
						competenceLineId = sq.CompetenceLineId,
						// Vérifier si la question a des options QCM
						responseType = _context.evaluationQuestionOptions
							.Any(o => o.QuestionId == sq.SelectedQuestion.questiondId) 
							? "QCM" 
							: "TEXT"
					})
					.ToListAsync();

				// Construire la réponse
				var response = new
				{
					evaluationId = evaluation.EvaluationId,
					title = evaluation.EvaluationType.Designation,
					description = $"Évaluation du {evaluation.StartDate.ToShortDateString()} au {evaluation.EndDate.ToShortDateString()}",
					employeeName = $"{user.FirstName} {user.LastName}",
					position = user.Position?.PositionName,
					department = user.Department.Name,
					questions = selectedQuestions
				};

				return Ok(response);
			}
			catch (Exception ex)
			{
				return StatusCode(500, new { error = ex.Message });
			}
		}

		// Ajouter ces nouveaux endpoints

		[HttpGet("{evaluationId}/options")]
		public async Task<IActionResult> GetQuestionOptions(int evaluationId)
		{
			try
			{
				var options = await _responseService.GetQuestionOptionsAsync(evaluationId);
				return Ok(options);
			}
			catch (Exception ex)
			{
				return StatusCode(500, new { error = ex.Message });
			}
		}

		[HttpPost("{evaluationId}/save-progress")]
		public async Task<IActionResult> SaveProgress(int evaluationId, [FromBody] EvaluationProgressDto progress)
		{
			try
			{
				await _responseService.SaveProgressAsync(evaluationId, progress);
				return Ok(new { message = "Progression sauvegardée" });
			}
			catch (Exception ex)
			{
				return StatusCode(500, new { error = ex.Message });
			}
		}

		[HttpGet("{evaluationId}/time-remaining")]
		public async Task<IActionResult> GetTimeRemaining(int evaluationId)
		{
			try
			{
				var timeRemaining = await _responseService.GetTimeRemainingAsync(evaluationId);
				return Ok(timeRemaining);
			}
			catch (Exception ex)
			{
				return StatusCode(500, new { error = ex.Message });
			}
		}

		[HttpPost("{evaluationId}/submit")]
		public async Task<IActionResult> SubmitEvaluation(int evaluationId, [FromBody] EvaluationSubmissionDto submission)
		{
			try
			{
				// Log des données reçues
				Console.WriteLine($"Reçu demande de soumission pour l'évaluation {evaluationId}");
				Console.WriteLine($"Nombre de réponses: {submission.Responses?.Count ?? 0}");

				// Vérifier si les réponses sont nulles
				if (submission.Responses == null)
				{
					return BadRequest("Aucune réponse fournie");
				}

				// Sauvegarder les réponses avec validation des dates
				var minValidDate = new DateTime(1753, 1, 1);
				foreach (var response in submission.Responses)
				{
					if (response.StartTime < minValidDate || response.EndTime < minValidDate)
					{
						return BadRequest("Les dates doivent être supérieures ou égales au 1er janvier 1753.");
					}

					// Vérifier si la réponse est correcte
					bool isCorrect = false;
					if (response.ResponseType == "QCM")
					{
						isCorrect = await _responseService.IsResponseCorrect(response.QuestionId, response.ResponseValue);
					}
					else if (response.ResponseType == "SCORE")
					{
						// Pour les questions de type SCORE, on considère que la réponse est correcte si elle est dans une plage acceptable
						// Par exemple, si le score est entre 3 et 5 sur 5
						int score = int.Parse(response.ResponseValue);
						isCorrect = score >= 3;
					}

					var evaluationResponse = new EvaluationResponses
					{
						EvaluationId = evaluationId,
						QuestionId = response.QuestionId,
						ResponseType = response.ResponseType,
						ResponseValue = response.ResponseValue,
						TimeSpent = response.TimeSpent,
						StartTime = response.StartTime,
						EndTime = response.EndTime,
						IsCorrect = isCorrect,
						State = 1, // État par défaut
						CreatedAt = DateTime.UtcNow
					};

					await _context.evaluationResponses.AddAsync(evaluationResponse);
				}

				await _context.SaveChangesAsync();
				return Ok(new { success = true });
			}
			catch (Exception ex)
			{
				// Log l'erreur pour le débogage
				Console.WriteLine($"Erreur lors de la soumission de l'évaluation: {ex.Message}");
				return StatusCode(500, "Une erreur est survenue lors de la soumission de l'évaluation.");
			}
		}

		[HttpPost("{evaluationId}/process-responses")]
		public async Task<IActionResult> ProcessResponses(int evaluationId)
		{
			try
			{
				var result = await _responseService.ProcessResponsesAfterSubmission(evaluationId);
				if (!result)
				{
					return StatusCode(500, "Une erreur est survenue lors du traitement des réponses.");
				}
				return Ok(new { success = true, message = "Les réponses ont été traitées avec succès." });
			}
			catch (Exception ex)
			{
				Console.WriteLine($"Erreur lors du traitement des réponses: {ex.Message}");
				return StatusCode(500, "Une erreur est survenue lors du traitement des réponses.");
			}
		}

		[HttpGet("evaluation/{evaluationId}/selected-questions")]
		public async Task<IActionResult> GetSelectedQuestionsAndResponses(int evaluationId)
		{
			try
			{
				// Récupérer les questions sélectionnées
				var selectedQuestions = await _context.evaluationSelectedQuestions
					.Where(sq => sq.EvaluationId == evaluationId)
					.Include(sq => sq.SelectedQuestion)
					.Select(sq => new
					{
						questionId = sq.SelectedQuestion.questiondId,
						text = sq.SelectedQuestion.question,
						responseType = sq.SelectedQuestion.responseType
					})
					.ToListAsync();

				// Récupérer les réponses de l'employé
				var responses = await _context.evaluationResponses
					.Where(r => r.EvaluationId == evaluationId)
					.ToDictionaryAsync(r => r.QuestionId, r => new
					{
						responseValue = r.ResponseValue,
						isCorrect = r.IsCorrect,
						timeSpent = r.TimeSpent
					});

				// Récupérer les bonnes réponses
				var correctAnswers = await _context.evaluationQuestionOptions
					.Where(o => selectedQuestions.Select(q => q.questionId).Contains(o.QuestionId))
					.Where(o => o.IsCorrect)
					.ToDictionaryAsync(o => o.QuestionId, o => o.OptionText);

				return Ok(new
				{
					questions = selectedQuestions,
					responses = responses,
					correctAnswers = correctAnswers
				});
			}
			catch (Exception ex)
			{
				return StatusCode(500, new { error = ex.Message });
			}
		}
	}
}
