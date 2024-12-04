using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using soft_carriere_competence.Application.Services.Evaluations;

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



	}
}
