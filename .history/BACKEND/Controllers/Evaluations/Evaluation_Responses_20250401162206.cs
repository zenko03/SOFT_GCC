using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace soft_carriere_competence.Controllers.Evaluations
{
	[Table("Evaluation_Responses")]
	public class Evaluation_Responses
	{
		[Key]
		[Column("ResponseId")]
		public int ResponseId { get; set; }
		[Column("EvaluationId")]
		public int EvaluationId { get; set; }
		[Column("QuestionId")]
		public int QuestionId { get; set; }
		[Column("ResponseType")]
		public string ResponseType { get; set; }
		[Column("ResponseValue")]
		public string ResponseValue { get; set; }
	}
}
