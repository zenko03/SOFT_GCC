using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using soft_carriere_competence.Application.Dtos.EvaluationsDto;
using soft_carriere_competence.Application.Services.Evaluations;
using soft_carriere_competence.Core.Entities.Evaluations;

namespace soft_carriere_competence.Controllers.Evaluations
{
	[ApiController]
	[Route("api/[controller]")]
	public class EvaluationController : ControllerBase
	{
		private readonly EvaluationService _evaluationService;

		public EvaluationController(EvaluationService evaluationService)
		{
			_evaluationService = evaluationService;
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
	}
}
