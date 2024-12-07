﻿using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using soft_carriere_competence.Application.Dtos;
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

		[HttpGet("questions")]
		public async Task<IActionResult> GetEvaluationQuestions(int evaluationTypeId, int postId)
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
			try
			{
				await _evaluationService.SaveEvaluationResultsAsync(
					dto.EvaluationId,
					dto.Ratings,
					dto.OverallScore,
					dto.Strengths,
					dto.Weaknesses,
					dto.GeneralEvaluation);

				return Ok(new { message = "Evaluation results saved successfully." });
			}
			catch (Exception ex)
			{
				return StatusCode(500, new { error = ex.Message });
			}
		}

		[HttpPost("suggestions")]
		public async Task<IActionResult> GetTrainingSuggestions([FromBody] TrainingSuggestionsRequestDto dto)
		{
			try
			{
				var suggestions = await _evaluationService.GetTrainingSuggestionsByQuestionsAsync(dto.EvaluationId, dto.Ratings);
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


		[HttpPost("create-evaluation")]
		public async Task<IActionResult> CreateEvaluation([FromBody] CreateEvaluationDto dto)
		{
			try
			{
				var evaluationId = await _evaluationService.CreateEvaluationAsync(
					dto.UserId,
					dto.EvaluationTypeId,
					dto.SupervisorId,
					dto.StartDate,
					dto.EndDate
				);

				return Ok(new { evaluationId, message = "Evaluation created successfully." });
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
