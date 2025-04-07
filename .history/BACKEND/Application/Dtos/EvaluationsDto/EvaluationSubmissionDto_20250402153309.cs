using System;
using System.Collections.Generic;

namespace soft_carriere_competence.Application.Dtos.EvaluationsDto
{
    public class EvaluationSubmissionDto
    {
        public List<EvaluationResponseDto> Responses { get; set; }
        public decimal AverageScore { get; set; }
        public string OverallFeedback { get; set; }
    }
} 