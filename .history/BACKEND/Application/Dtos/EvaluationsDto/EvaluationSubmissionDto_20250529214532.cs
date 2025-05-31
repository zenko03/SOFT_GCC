using System;
using System.Collections.Generic;

namespace soft_carriere_competence.Application.Dtos.EvaluationsDto
{
    public class EvaluationSubmissionDto
    {
        public List<EvaluationResponseSubmissionDto> Responses { get; set; }
        public string OverallFeedback { get; set; }
        public decimal AverageScore { get; set; }
        public DateTime CompletionDate { get; set; } = DateTime.UtcNow;
    }

    public class EvaluationResponseSubmissionDto
    {
        public int QuestionId { get; set; }
        public string ResponseType { get; set; }
        public string ResponseValue { get; set; }
        public int TimeSpent { get; set; }
        public DateTime StartTime { get; set; }
        public DateTime EndTime { get; set; }
    }
} 