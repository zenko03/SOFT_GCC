namespace soft_carriere_competence.Core.Entities.Evaluations
{
    public class EvaluationQuestionOption
    {
        public int OptionId { get; set; }
        public int QuestionId { get; set; }
        public string OptionText { get; set; }
        public bool IsCorrect { get; set; }
        public int State { get; set; }
    }
} 