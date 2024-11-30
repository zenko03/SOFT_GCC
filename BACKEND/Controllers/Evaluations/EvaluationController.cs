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
			var questions = await _evaluationService.GetEvaluationQuestionsAsync(evaluationTypeId, postId);
			return Ok(questions);
		}

		[HttpGet("types")]
		public async Task<IActionResult> GetEvaluationTypes()
		{
			var evaluationTypes = await _evaluationService.GetEvaluationTypeAsync();
			if (evaluationTypes == null || !evaluationTypes.Any())
				return NotFound("No evaluation types found.");

			return Ok(evaluationTypes);
		}




	}
}
