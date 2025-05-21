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
		private readonly EvaluationCompetenceService _evaluationCompetenceService;

		private readonly ApplicationDbContext _context;


		public EvaluationController(EvaluationService evaluationService,
		ApplicationDbContext context, EvaluationResponseService responseService, EvaluationCompetenceService evaluationCompetenceService)
		{
			_evaluationService = evaluationService;
			_context = context;
			_responseService = responseService;
			_evaluationCompetenceService = evaluationCompetenceService;

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
			
			// Log des notations détaillées si présentes
			if (dto.HasDetailedRatings())
			{
				Console.WriteLine("Notations détaillées par critères:");
				foreach (var detailedRating in dto.DetailedRatings)
				{
					Console.WriteLine($"  Question {detailedRating.QuestionId}:");
					Console.WriteLine($"    Pertinence: {detailedRating.Relevance?.ToString() ?? "0"}/5");
					Console.WriteLine($"    Technique: {detailedRating.Technical?.ToString() ?? "0"}/5");
					Console.WriteLine($"    Clarté: {detailedRating.Clarity?.ToString() ?? "0"}/5");
					Console.WriteLine($"    Note globale: {detailedRating.OverallRating}/5");
					Console.WriteLine($"    Commentaire: {(string.IsNullOrEmpty(detailedRating.Comment) ? "(aucun)" : detailedRating.Comment)}");
				}
			}

			try
			{
				Console.WriteLine("==== Appel du service SaveEvaluationResultsAsync ====");

				// Appel au service pour sauvegarder les données
				await _evaluationService.SaveEvaluationResultsAsync(dto);

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
				var evaluation = await _context.Evaluations
					.Include(e => e.User)
					.Include(e => e.EvaluationType)
					.FirstOrDefaultAsync(e => e.EvaluationId == id);

				if (evaluation == null)
				{
					return NotFound("Évaluation non trouvée.");
				}

				var result = new
				{
					evaluationId = evaluation.EvaluationId,
					title = evaluation.EvaluationType.Designation,
					description = $"Évaluation du {evaluation.StartDate.ToShortDateString()} au {evaluation.EndDate.ToShortDateString()}",
					employeeName = $"{evaluation.User.FirstName} {evaluation.User.LastName}",
					position = evaluation.User.Position?.PositionName ?? "Non défini",
					department = evaluation.User.Department?.Name ?? "Non défini",
					evaluationTypeId = evaluation.EvaluationTypeId
				};

				return Ok(result);
			}
			catch (Exception ex)
			{
				return StatusCode(500, $"Erreur lors de la récupération des détails de l'évaluation : {ex.Message}");
			}
		}

		// Ajouter ces nouveaux endpoints

		[HttpGet("{evaluationId}/options")]
		public async Task<IActionResult> GetQuestionOptions(int evaluationId)
		{
			try
			{
				// Récupérer les questions associées à l'évaluation
				var questionIds = await _context.evaluationSelectedQuestions
					.Where(esq => esq.EvaluationId == evaluationId)
					.Select(esq => esq.QuestionId)
					.ToListAsync();

				// Récupérer toutes les options pour les questions, sans filtrer par type
				var options = await _context.evaluationQuestionOptions
					.Where(opt => questionIds.Contains(opt.QuestionId))
					.ToListAsync();

				// Grouper les options par questionId
				var groupedOptions = options.GroupBy(opt => opt.QuestionId)
					.ToDictionary(g => g.Key, g => g.ToList());

				return Ok(groupedOptions);
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
						// Pour les questions QCM, vérifier si l'ID de l'option sélectionnée correspond à une option marquée comme correcte
						int optionId;
						if (int.TryParse(response.ResponseValue, out optionId))
						{
							isCorrect = await _context.evaluationQuestionOptions
								.Where(o => o.QuestionId == response.QuestionId && o.OptionId == optionId && o.IsCorrect)
								.AnyAsync();
						}
					}
					// Pour les questions de type TEXT, on n'a pas de vérification automatique d'exactitude

					var evaluationResponse = new EvaluationResponses
					{
						EvaluationId = evaluationId,
						QuestionId = response.QuestionId,
						ResponseType = response.ResponseType,
						ResponseValue = response.ResponseValue, // Stocker directement la valeur sans JSON
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
				var selectedQuestions = await _context.evaluationSelectedQuestions
					.Where(esq => esq.EvaluationId == evaluationId)
					.Join(_context.evaluationQuestions,
						esq => esq.QuestionId,
						eq => eq.questiondId,
						(esq, eq) => new
						{
							QuestionId = eq.questiondId,
							QuestionText = eq.question,
							CompetenceLineId = eq.CompetenceLineId,
							ResponseTypeId = eq.ResponseTypeId,
							// Récupérer la configuration du temps ou utiliser la valeur par défaut
							MaxTimeInMinutes = _context.evaluationQuestionConfigs
								.Where(c => c.QuestionId == eq.questiondId)
								.Select(c => c.MaxTimeInMinutes)
								.FirstOrDefault(15),
							Response = _context.evaluationResponses
								.FirstOrDefault(er => er.EvaluationId == evaluationId && er.QuestionId == eq.questiondId)
						})
					.ToListAsync();

				// Transformez les résultats pour inclure le texte de l'option pour les réponses QCM
				var formattedQuestions = new List<object>();
				foreach (var selectedQuestion in selectedQuestions)
				{
					// Récupérer le type de réponse (TEXT ou QCM)
					var responseType = await _context.ResponseTypes
						.Where(rt => rt.ResponseTypeId == selectedQuestion.ResponseTypeId)
						.Select(rt => rt.TypeName)
						.FirstOrDefaultAsync() ?? "TEXT";
					
					string formattedResponse = selectedQuestion.Response?.ResponseValue;
					bool isCorrect = selectedQuestion.Response?.IsCorrect ?? false;
					
					// Si c'est une question QCM et qu'il y a une réponse
					if (responseType == "QCM" && selectedQuestion.Response != null)
					{
						// Essayer de récupérer l'option choisie
						if (int.TryParse(selectedQuestion.Response.ResponseValue, out int optionId))
						{
							var option = await _context.evaluationQuestionOptions
								.FirstOrDefaultAsync(o => o.OptionId == optionId);
							
							// Utiliser le texte de l'option si trouvé
							if (option != null)
							{
								formattedResponse = option.OptionText;
							}
						}
					}
					
					formattedQuestions.Add(new
					{
						QuestionId = selectedQuestion.QuestionId,
						QuestionText = selectedQuestion.QuestionText,
						CompetenceLineId = selectedQuestion.CompetenceLineId,
						ResponseType = responseType,
						ResponseValue = formattedResponse,
						IsCorrect = isCorrect,
						MaxTimeInMinutes = selectedQuestion.MaxTimeInMinutes
					});
				}

				return Ok(formattedQuestions);
			}
			catch (Exception ex)
			{
				return StatusCode(500, $"Erreur interne du serveur: {ex.Message}");
			}
		}

		// API pour récupérer la liste des modèles d'évaluation (templates)
		[HttpGet("templates")]
		public async Task<IActionResult> GetEvaluationTemplates()
		{
			try
			{
				var evaluationTypes = await _context.EvaluationTypes
					.Where(et => et.state == 1)
					.Select(et => new
					{
						id = et.EvaluationTypeId,
						title = et.Designation,
						description = et.Designation, // Vous pouvez ajouter une description plus détaillée si nécessaire
						questionCount = _context.evaluationQuestions
							.Count(q => q.evaluationTypeId == et.EvaluationTypeId && q.state == 1)
					})
					.ToListAsync();

				return Ok(evaluationTypes);
			}
			catch (Exception ex)
			{
				return StatusCode(500, new { error = ex.Message });
			}
		}

		// API pour récupérer les questions d'une évaluation spécifique
		[HttpGet("{evaluationTypeId}/questions")]
		public async Task<IActionResult> GetQuestionsByEvaluationType(int evaluationTypeId)
		{
			try
			{
				var questions = await _context.evaluationQuestions
					.Where(q => q.evaluationTypeId == evaluationTypeId && q.state == 1)
					.Select(q => new
					{
						questionId = q.questiondId,
						text = q.question,
						positionId = q.positionId,
						competenceLineId = q.CompetenceLineId,
						responseType = _context.ResponseTypes
							.Where(rt => rt.ResponseTypeId == q.ResponseTypeId)
							.Select(rt => rt.TypeName)
							.FirstOrDefault() ?? "TEXT",
						// Récupérer le temps depuis la configuration ou utiliser la valeur par défaut
						maxTimeInMinutes = _context.evaluationQuestionConfigs
							.Where(c => c.QuestionId == q.questiondId)
							.Select(c => c.MaxTimeInMinutes)
							.FirstOrDefault() // Ne pas utiliser de paramètre ici
					})
					.ToListAsync();

				// Appliquer la valeur par défaut de 15 minutes pour les questions sans configuration
				foreach (var question in questions)
				{
					// Utiliser une approche de programmation dynamique pour accéder à la propriété
					var maxTime = question.GetType().GetProperty("maxTimeInMinutes").GetValue(question);
					if (maxTime == null || (int)maxTime == 0)
					{
						question.GetType().GetProperty("maxTimeInMinutes").SetValue(question, 15);
					}
				}

				return Ok(questions);
			}
			catch (Exception ex)
			{
				return StatusCode(500, new { error = ex.Message });
			}
		}

		// API pour mettre à jour le temps par question
		[HttpPost("questions/update-time")]
		public async Task<IActionResult> UpdateQuestionsTime([FromBody] List<QuestionTimeUpdateDto> questions)
		{
			try
			{
				if (questions == null || !questions.Any())
				{
					return BadRequest("Aucune question à mettre à jour");
				}

				foreach (var questionUpdate in questions)
				{
					// Chercher si une configuration existe déjà pour cette question
					var config = await _context.evaluationQuestionConfigs
						.FirstOrDefaultAsync(c => c.QuestionId == questionUpdate.QuestionId);

					if (config != null)
					{
						// Mettre à jour la configuration existante
						config.MaxTimeInMinutes = questionUpdate.MaxTimeInMinutes;
						config.UpdatedAt = DateTime.UtcNow;
					}
					else
					{
						// Créer une nouvelle configuration
						var newConfig = new EvaluationQuestionConfig
						{
							QuestionId = questionUpdate.QuestionId,
							MaxTimeInMinutes = questionUpdate.MaxTimeInMinutes
						};
						await _context.evaluationQuestionConfigs.AddAsync(newConfig);
					}
				}

				await _context.SaveChangesAsync();
				return Ok(new { success = true, message = "Temps des questions mis à jour avec succès" });
			}
			catch (Exception ex)
			{
				return StatusCode(500, new { error = ex.Message });
			}
		}
	}
}
