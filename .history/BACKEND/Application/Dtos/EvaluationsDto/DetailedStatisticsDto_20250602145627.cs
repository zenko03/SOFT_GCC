using System;
using System.Collections.Generic;

namespace soft_carriere_competence.Application.Dtos.EvaluationsDto
{
    public class DetailedStatisticsDto
    {
        public ScoreDistributionDto ScoreDistribution { get; set; }
        public List<DistributionItemDto> DepartmentDistribution { get; set; }
        public List<DistributionItemDto> EvaluationTypeDistribution { get; set; }
        public List<YearlyPerformanceDto> PerformanceByYear { get; set; }
        public TrendDto TrendData { get; set; }
    }

    public class ScoreDistributionDto
    {
        public int Low { get; set; }
        public int Medium { get; set; }
        public int High { get; set; }
        public decimal Average { get; set; }
        public decimal Min { get; set; }
        public decimal Max { get; set; }
    }

    public class DistributionItemDto
    {
        public string Label { get; set; }
        public int Value { get; set; }
        public decimal AverageScore { get; set; }
    }

    public class YearlyPerformanceDto
    {
        public int Year { get; set; }
        public decimal AverageScore { get; set; }
        public int Count { get; set; }
        public string BestDepartment { get; set; }
    }

    public class TrendDto
    {
        public bool IsIncreasing { get; set; }
        public decimal PercentageChange { get; set; }
        public decimal StartValue { get; set; }
        public decimal EndValue { get; set; }
        public double StandardDeviation { get; set; }
    }
} 