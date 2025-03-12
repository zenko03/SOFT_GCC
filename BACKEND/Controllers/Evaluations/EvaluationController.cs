﻿using Microsoft.AspNetCore.Http;
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
		private readonly ApplicationDbContext _context;


		public EvaluationController(EvaluationService evaluationService, ApplicationDbContext context)
		{
			_evaluationService = evaluationService;
			_context = context;
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
		public async Task<IActionResult> GetEvaluationQuestions([FromQuery] int evaluationTypeId, [FromQuery] int postId)
		{
			Console.WriteLine("Before the try");

			try
			{
				Console.WriteLine("in the block try, before function getEvalQuestions");

				var questions = await _evaluationService.GetEvaluationQuestionsAsync(evaluationTypeId, postId);
				Console.WriteLine("in the block try, after calling getEvalQuestions");

				// Add explicit null check
				if (questions == null)
				{
					return NotFound($"No questions found for evaluationTypeId {evaluationTypeId} and postId {postId}");
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
					.Include(u => u.Poste)
					.Include(u => u.Department) // Ajouté pour récupérer le département
					.FirstOrDefaultAsync(u => u.Id == evaluation.UserId);

				if (user == null)
					return NotFound("Utilisateur associé à l'évaluation non trouvé");

				// Ajoutez du journalisation pour déboguer
				Console.WriteLine($"UserId: {user.Id}, PostId: {user.PostId}, EvaluationTypeId: {evaluation.EvaluationTypeId}");

				// Récupérer les questions pour ce type d'évaluation et ce poste
				// Note: Assurez-vous que les noms des propriétés correspondent exactement
				var questions = await _context.evaluationQuestions
					.Where(q => q.evaluationTypeId == evaluation.EvaluationTypeId &&
						   q.postId == user.PostId) // Assurez-vous que c'est le bon nom de propriété
					.Select(q => new {
						questionId = q.questiondId,
						text = q.question,
						evaluationTypeId = q.evaluationTypeId,
						postId = q.postId
					})
					.ToListAsync();

				// Journalisation du nombre de questions trouvées
				Console.WriteLine($"Nombre de questions trouvées: {questions.Count}");

				// Construire la réponse
				var response = new
				{
					evaluationId = evaluation.EvaluationId,
					title = evaluation.EvaluationType.Designation, // Vérifiez que c'est le bon nom
					description = $"Évaluation du {evaluation.StartDate.ToShortDateString()} au {evaluation.EndDate.ToShortDateString()}",
					employeeName = $"{user.FirstName} {user.LastName}",
					position = user.Poste?.title,
					department = user.Department.Name, // Ajouté pour inclure le département
					questions = questions
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
