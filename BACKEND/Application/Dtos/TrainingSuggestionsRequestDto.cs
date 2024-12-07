namespace soft_carriere_competence.Application.Dtos
{
    public class TrainingSuggestionsRequestDto
    {
        public int EvaluationId { get; set; }
        public Dictionary<int, int> Ratings { get; set; } // QuestionId -> Score
    }
}
