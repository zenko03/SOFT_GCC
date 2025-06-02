using ClosedXML.Excel;
using DocumentFormat.OpenXml.Spreadsheet;
using iTextSharp.text;
using iTextSharp.text.pdf;
using Microsoft.AspNetCore.Http;
using Microsoft.EntityFrameworkCore;
using soft_carriere_competence.Application.Dtos.EvaluationsDto;
using soft_carriere_competence.Core.Entities.crud_career;
using soft_carriere_competence.Core.Entities.Evaluations;
using soft_carriere_competence.Core.Entities.salary_skills;
using soft_carriere_competence.Core.Interface;
using soft_carriere_competence.Infrastructure.Data;
using System.Text;

namespace soft_carriere_competence.Application.Services.Evaluations
{
    public class EvaluationHistoryService
    {
        private readonly ApplicationDbContext _context;
        private readonly IGenericRepository<VEvaluationHistory> _evaluationHistoryRepository;
        private readonly EvaluationInterviewService _evaluationService;
        private readonly UserService _userService;
        private readonly IGenericRepository<Department> _departementRepository;
        private readonly IGenericRepository<Position> _posteRepository;





        public EvaluationHistoryService(ApplicationDbContext context, IGenericRepository<VEvaluationHistory> evaluationHistoryRepository, EvaluationInterviewService evaluationService
            , UserService userService, IGenericRepository<Department> departementRepository)
        {
            _context = context;
            _evaluationHistoryRepository = evaluationHistoryRepository;
            _evaluationService = evaluationService;
            _userService = userService;
            _departementRepository = departementRepository;
        }

        public async Task<List<EvaluationHistoryDto>> GetEvaluationHistoryAsync(
    DateTime? startDate,
    DateTime? endDate,
    string? evaluationType,
    string? department,
    string? employeeName)
        {
            var query = _context.vEvaluationHistories.AsQueryable();

            if (startDate.HasValue)
                query = query.Where(e => e.StartDate >= startDate.Value);

            if (endDate.HasValue)
                query = query.Where(e => e.EndDate <= endDate.Value);

            if (!string.IsNullOrEmpty(evaluationType))
                query = query.Where(e => e.EvaluationType != null && e.EvaluationType == evaluationType);

            if (!string.IsNullOrEmpty(department))
                query = query.Where(e => e.Department != null && e.Department == department);

            if (!string.IsNullOrEmpty(employeeName))
                query = query.Where(e =>
                    (e.LastName != null && e.LastName.Contains(employeeName)) ||
                    (e.FirstName != null && e.FirstName.Contains(employeeName))
                );

            return await query.Select(e => new EvaluationHistoryDto
            {
                EvaluationId = e.EvaluationId,
                StartDate = e.StartDate,
                EndDate = e.EndDate,
                EvaluationType = e.EvaluationType ?? "",
                OverallScore = e.OverallScore,
                Status = e.status ,
                Recommendations = e.Recommendations ?? "",
                FirstName =e.FirstName,
                LastName=e.LastName,
                Position=e.Position
            }).ToListAsync();
        }

        public async Task<(IEnumerable<EvaluationHistoryDto> Evaluations, int TotalPages)> GetEvaluationHistoryPaginatedAsync(
    int pageNumber = 1,
    int pageSize = 10,
    DateTime? startDate = null,
    DateTime? endDate = null,
    string? evaluationType = null,
    string? department = null,
    string? employeeName = null)
        {
            var query = _context.vEvaluationHistories.AsQueryable();

            // Appliquer les filtres
            if (startDate.HasValue)
                query = query.Where(e => e.StartDate >= startDate.Value);

            if (endDate.HasValue)
                query = query.Where(e => e.EndDate <= endDate.Value);

            if (!string.IsNullOrEmpty(evaluationType))
                query = query.Where(e => e.EvaluationType != null && e.EvaluationType == evaluationType);

            if (!string.IsNullOrEmpty(department))
                query = query.Where(e => e.Department != null && e.Department == department);

            if (!string.IsNullOrEmpty(employeeName))
                query = query.Where(e => e.LastName != null && e.LastName.Contains(employeeName));

            // Calculer le nombre total d'éléments
            var totalItems = await query.CountAsync();

            // Calculer le nombre total de pages
            var totalPages = (int)Math.Ceiling((double)totalItems / pageSize);

            // Paginer les résultats
            var evaluations = await query
                .Select(e => new EvaluationHistoryDto
                {
                    EvaluationId = e.EvaluationId,
                    StartDate = e.StartDate,
                    EndDate = e.EndDate,
                    EvaluationType = e.EvaluationType ?? "",
                    OverallScore = e.OverallScore,
                    Status = e.status,
                    Recommendations = e.Recommendations ?? "",
                    FirstName = e.FirstName,
                    LastName = e.LastName,
                    Position = e.Position
                })
                .Skip((pageNumber - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync();

            return (evaluations, totalPages);
        }

        public async Task<EvaluationHistoryDetailDto> GetEvaluationDetailAsync(int evaluationId)
        {
            // Charger les informations principales de l'évaluation
            var evaluation = await _context.vEvaluationHistories
                .Where(e => e.EvaluationId == evaluationId)
                .Select(e => new
                {
                    e.EvaluationId,
                    e.LastName,
                    e.FirstName,
                    e.Position,
                    e.EvaluationType,
                    e.StartDate,
                    e.EndDate,
                    e.OverallScore,
                    e.EvaluationComments,
                    e.Strengths,
                    e.Weaknesses,
                    e.Department,
                    e.InterviewDate,
                    e.InterviewStatus,
                    e.Recommendations,
                    e.ParticipantNames
                })
                .FirstOrDefaultAsync();

            if (evaluation == null)
                throw new KeyNotFoundException("Evaluation not found.");

            // Charger les détails des questions séparément et les mapper vers le DTO
            var questionDetails = await _context.EvaluationQuestionnaires
                .Where(q => q.EvaluationId == evaluationId)
                .Select(q => new QuestionDetailDto
                {
                    QuestionId = q.questionId,
                    Question = q.evaluationQuestion.question,
                    Score = q.Score
                })
                .ToListAsync();

            // Transform ParticipantNames en une liste
            var participants = evaluation.ParticipantNames?
                .Split(new[] { ',' }, StringSplitOptions.RemoveEmptyEntries)
                .Select(name => name.Trim())
                .ToList();

            return new EvaluationHistoryDetailDto
            {
                EvaluationId = evaluation.EvaluationId,
                LastName = evaluation.LastName,
                FirstName = evaluation.FirstName,
                Position = evaluation.Position,
                EvaluationType = evaluation.EvaluationType,
                StartDate = evaluation.StartDate,
                EndDate = evaluation.EndDate,
                OverallScore = evaluation.OverallScore,
                EvaluationComments = evaluation.EvaluationComments,
                Strengths = evaluation.Strengths,
                Weaknesses = evaluation.Weaknesses,
                Department = evaluation.Department,
                InterviewDate = evaluation.InterviewDate,
                InterviewStatus = evaluation.InterviewStatus,
                Recommendations = evaluation.Recommendations,
                Participants = participants,
                QuestionDetails = questionDetails // Utilisation du nouveau DTO
            };
        }

        public async Task<StatisticsDto> GetEvaluationStatisticsAsync(DateTime? startDate, DateTime? endDate)
        {
            var query = _context.vEvaluationHistories.AsQueryable();

            if (startDate.HasValue)
                query = query.Where(e => e.StartDate >= startDate.Value);

            if (endDate.HasValue)
                query = query.Where(e => e.EndDate <= endDate.Value);

            var totalEvaluations = await query.CountAsync();
            var completedEvaluations = await query.CountAsync(e => e.status == 20);

            var evaluationTypeDistribution = await query
                .GroupBy(e => e.EvaluationType)
                .Select(g => new { Type = g.Key, Count = g.Count() })
                .ToDictionaryAsync(x => x.Type, x => x.Count);

            return new StatisticsDto
            {
                TotalEvaluations = totalEvaluations,
                CompletedEvaluations = completedEvaluations,
                CompletionRate = totalEvaluations > 0
                    ? (decimal)completedEvaluations / totalEvaluations * 100 : 0,
                EvaluationTypeDistribution = evaluationTypeDistribution
            };
        }


        public async Task<IEnumerable<GlobalPerformanceDto>> GetGlobalPerformanceAsync(DateTime? startDate, DateTime? endDate, string department, string evaluationType)
        {
            var query = _context.vEvaluationHistories.AsQueryable();

            if (startDate.HasValue)
            {
                query = query.Where(e => e.StartDate >= startDate.Value);
            }

            if (endDate.HasValue)
            {
                query = query.Where(e => e.EndDate <= endDate.Value);
            }

            if (!string.IsNullOrEmpty(department))
            {
                query = query.Where(e => e.Department == department);
            }

            if (!string.IsNullOrEmpty(evaluationType))
            {
                query = query.Where(e => e.EvaluationType == evaluationType);
            }

            var groupedData = await query
                .GroupBy(e => e.StartDate.Year)
                .Select(g => new GlobalPerformanceDto
                {
                    Year = g.Key,
                    AverageScore = g.Average(e => e.OverallScore)
                })
                .ToListAsync();

            return groupedData;
        }

        public async Task<KPIResult> GetKPIsAsync(DateTime? startDate, DateTime? endDate, string? departmentName)
        {
            Console.WriteLine($"Recherche de KPI pour département: {departmentName ?? "tous"}");
            // Récupérez les évaluations terminées
            // Convertir departmentName en departmentId si nécessaire, ou adapter la logique de filtrage
            int? departmentId = null;
            if (!string.IsNullOrEmpty(departmentName))
            {
                // Rechercher par Name qui est mappé à Department_name dans la base de données
                var department = await _context.Department.FirstOrDefaultAsync(d => d.Name == departmentName);
                if (department != null)
                {
                    departmentId = department.DepartmentId; // Utiliser DepartmentId qui est mappé à Department_id
                    Console.WriteLine($"Département trouvé: {departmentId} pour le nom {departmentName}");
                }
                else
                {
                    Console.WriteLine($"Département non trouvé pour le nom: {departmentName}");
                }
            }
            else
            {
                Console.WriteLine("Aucun nom de département spécifié, récupération de tous les départements");
            }

            var evaluations = await _evaluationService.GetEmployeesWithFinishedEvalAsync(department: departmentId);
            Console.WriteLine($"Nombre d'évaluations trouvées: {evaluations.Count()}");

            // Filtrez par dates si spécifiées
            if (startDate.HasValue)
                evaluations = evaluations.Where(e => e.startDate >= startDate.Value).ToList();

            if (endDate.HasValue)
                evaluations = evaluations.Where(e => e.endDate <= endDate.Value).ToList();

            // Récupérez le nombre total d'employés (peut nécessiter une nouvelle méthode si indisponible)
            var totalEmployees = await _userService.CountAsync();

            // Calcul des KPI
            var completedEvaluations = evaluations.Count(); // Évaluations terminées
            var approvedEvaluations = evaluations.Count(e => e.state == 20);
            var overallAverage = evaluations.Any() ? evaluations.Average(e => e.overallScore) : 0;

            // Retourner les KPI
            return new KPIResult
            {
                ParticipationRate = totalEmployees > 0 ? (completedEvaluations / (double)totalEmployees) * 100 : 0,
                ApprovalRate = evaluations.Any() ? (approvedEvaluations / (double)evaluations.Count()) * 100 : 0,
                OverallAverage = overallAverage
            };
        }

        public async Task<(byte[] Content, string ContentType, string FileName)> ExportDataAsync(string format, DateTime? startDate, DateTime? endDate)
        {
            try
            {
                // Filtrage des évaluations par date
                var evaluations = _context.Evaluations
                    .Include(e => e.EvaluationType)
                    .Include(e => e.Employee)
                    .Where(e => (!startDate.HasValue || e.StartDate >= startDate) &&
                                (!endDate.HasValue || e.EndDate <= endDate))
                    .ToList();

                switch (format.ToLower())
                {
                    case "csv":
                        var csvContent = GenerateCsv(evaluations);
                        return (csvContent, "text/csv", "Evaluations.csv");

                    case "excel":
                        var excelContent = GenerateExcel(evaluations);
                        return (excelContent, "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", "Evaluations.xlsx");

                    case "pdf":
                        var pdfContent = await GeneratePdfAsync(evaluations);
                        return (pdfContent, "application/pdf", "Evaluations.pdf");

                    default:
                        throw new ArgumentException("Format d'exportation non supporté.");
                }
            }
            catch (Exception ex)
            {
                // Log erreur (assurez-vous que le logger est configuré)
                Console.WriteLine("erreur rencontroler, "+ex.Message);
                throw; // Réémet l'exception pour renvoyer une erreur 500
            }
        }

        // Génération de contenu CSV
        private byte[] GenerateCsv(IEnumerable<Evaluation> evaluations)
        {
            var builder = new StringBuilder();
            builder.AppendLine("Date,Type d'évaluation,Employé,Score Global,Statut");

            foreach (var eval in evaluations)
            {
                var date = eval.StartDate.ToString("yyyy-MM-dd") ?? "N/A";
                var type = eval.EvaluationType?.Designation ?? "Inconnu";
                var employee = $"{eval.Employee?.FirstName ?? "N/A"} {eval.Employee?.Name ?? "N/A"}";
                var score = eval.OverallScore?.ToString() ?? "N/A";
                var state = eval.state;

                builder.AppendLine($"{date},{type},{employee},{score},{state}");
            }

            return Encoding.UTF8.GetBytes(builder.ToString());
        }


        // Génération de contenu Excel
        private byte[] GenerateExcel(IEnumerable<Evaluation> evaluations)
        {
            using var workbook = new XLWorkbook();
            var worksheet = workbook.Worksheets.Add("Historique des Évaluations");

            worksheet.Cell(1, 1).Value = "Date";
            worksheet.Cell(1, 2).Value = "Type d'évaluation";
            worksheet.Cell(1, 3).Value = "Employé";
            worksheet.Cell(1, 4).Value = "Score Global";
            worksheet.Cell(1, 5).Value = "Statut";

            int row = 2;
            foreach (var eval in evaluations)
            {
                worksheet.Cell(row, 1).Value = eval.StartDate.ToString("yyyy-MM-dd");
                worksheet.Cell(row, 2).Value = eval.EvaluationType.Designation;
                worksheet.Cell(row, 3).Value = $"{eval.Employee.FirstName} {eval.Employee.Name}";
                worksheet.Cell(row, 4).Value = eval.OverallScore;
                worksheet.Cell(row, 5).Value = eval.state;
                row++;
            }

            using var stream = new MemoryStream();
            workbook.SaveAs(stream);
            return stream.ToArray();
        }

        // Génération de contenu PDF
        private async Task<byte[]> GeneratePdfAsync(IEnumerable<Evaluation> evaluations)
        {
            using var stream = new MemoryStream();

            // Création du document PDF
            var document = new iTextSharp.text.Document();
            var writer = iTextSharp.text.pdf.PdfWriter.GetInstance(document, stream);
            document.Open();

            // Titre du document
            var titleFont = iTextSharp.text.FontFactory.GetFont(iTextSharp.text.FontFactory.HELVETICA_BOLD, 16);
            var bodyFont = iTextSharp.text.FontFactory.GetFont(iTextSharp.text.FontFactory.HELVETICA, 12);

            document.Add(new iTextSharp.text.Paragraph("Historique des Évaluations", titleFont));
            document.Add(new iTextSharp.text.Paragraph("\n")); // Ligne vide

            // Ajout des données d'évaluation
            foreach (var eval in evaluations)
            {
                document.Add(new iTextSharp.text.Paragraph($"Date : {eval.StartDate:yyyy-MM-dd}", bodyFont));
                document.Add(new iTextSharp.text.Paragraph($"Type d'évaluation : {eval.EvaluationType.Designation}", bodyFont));
                document.Add(new iTextSharp.text.Paragraph($"Employé : {eval.Employee.FirstName} {eval.Employee.Name}", bodyFont));
                document.Add(new iTextSharp.text.Paragraph($"Score Global : {eval.OverallScore}", bodyFont));
                document.Add(new iTextSharp.text.Paragraph($"Statut : {eval.state}", bodyFont));
                document.Add(new iTextSharp.text.Paragraph("\n")); // Ligne vide
            }

            document.Close();

            // Retourner le contenu du PDF en tant que tableau d'octets
            return stream.ToArray();
        }


        public async Task<Position> GetPosteByIdAsync(int posteId)
        {
            return await _posteRepository.GetByIdAsync(posteId);
        }

        public async Task<Department> GetDepartmentByIdAsync(int departmentId)
        {
            return await _departementRepository.GetByIdAsync(departmentId);
        }

        public async Task<IEnumerable<Position>> GetAllPostesAsync()
        {
            return await _posteRepository.GetAllAsync();
        }

        public async Task<IEnumerable<Department>> GetAllDepartmentsAsync()
        {
            try
            {
                return await _departementRepository.GetAllAsync();
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Erreur lors de la récupération des départements : {ex.Message}");
                return new List<Department>();
            }
        }

        public async Task<DetailedStatisticsDto> GetDetailedStatisticsAsync(DateTime? startDate, DateTime? endDate, string? department = null, string? evaluationType = null)
        {
            var query = _context.vEvaluationHistories.AsQueryable();

            // Appliquer les filtres
            if (startDate.HasValue)
                query = query.Where(e => e.StartDate >= startDate.Value);

            if (endDate.HasValue)
                query = query.Where(e => e.EndDate <= endDate.Value);

            if (!string.IsNullOrEmpty(department))
                query = query.Where(e => e.Department == department);

            if (!string.IsNullOrEmpty(evaluationType))
                query = query.Where(e => e.EvaluationType == evaluationType);

            // Récupérer toutes les évaluations filtrées
            var evaluations = await query.ToListAsync();
            
            if (evaluations.Count == 0)
            {
                return new DetailedStatisticsDto
                {
                    ScoreDistribution = new ScoreDistributionDto(),
                    DepartmentDistribution = new List<DistributionItemDto>(),
                    EvaluationTypeDistribution = new List<DistributionItemDto>(),
                    PerformanceByYear = new List<YearlyPerformanceDto>(),
                    TrendData = new TrendDto()
                };
            }

            // 1. Distribution des scores
            var scoreDistribution = new ScoreDistributionDto
            {
                Low = evaluations.Count(e => e.OverallScore.HasValue && e.OverallScore.Value < 2.5m),
                Medium = evaluations.Count(e => e.OverallScore.HasValue && e.OverallScore.Value >= 2.5m && e.OverallScore.Value < 4m),
                High = evaluations.Count(e => e.OverallScore.HasValue && e.OverallScore.Value >= 4m),
                Average = evaluations.Any(e => e.OverallScore.HasValue) ? evaluations.Where(e => e.OverallScore.HasValue).Average(e => e.OverallScore.Value) : 0m,
                Min = evaluations.Any(e => e.OverallScore.HasValue) ? evaluations.Where(e => e.OverallScore.HasValue).Min(e => e.OverallScore.Value) : 0m,
                Max = evaluations.Any(e => e.OverallScore.HasValue) ? evaluations.Where(e => e.OverallScore.HasValue).Max(e => e.OverallScore.Value) : 0m
            };

            // 2. Distribution par département
            var departmentDistribution = await query
                .GroupBy(e => e.Department)
                .Where(g => g.Key != null)
                .Select(g => new DistributionItemDto
                {
                    Label = g.Key,
                    Value = g.Count(),
                    AverageScore = g.Any(e => e.OverallScore.HasValue) ? g.Where(e => e.OverallScore.HasValue).Average(e => e.OverallScore.Value) : 0m
                })
                .ToListAsync();

            // 3. Distribution par type d'évaluation
            var evaluationTypeDistribution = await query
                .GroupBy(e => e.EvaluationType)
                .Where(g => g.Key != null)
                .Select(g => new DistributionItemDto
                {
                    Label = g.Key,
                    Value = g.Count(),
                    AverageScore = g.Any(e => e.OverallScore.HasValue) ? g.Where(e => e.OverallScore.HasValue).Average(e => e.OverallScore.Value) : 0m
                })
                .ToListAsync();

            // 4. Performance par année
            var performanceByYear = await query
                .GroupBy(e => e.StartDate.Year)
                .Select(g => new YearlyPerformanceDto
                {
                    Year = g.Key,
                    AverageScore = g.Any(e => e.OverallScore.HasValue) ? g.Where(e => e.OverallScore.HasValue).Average(e => e.OverallScore.Value) : 0m,
                    Count = g.Count(),
                    BestDepartment = g.GroupBy(e => e.Department)
                                      .OrderByDescending(dg => dg.Any(e => e.OverallScore.HasValue) ? dg.Where(e => e.OverallScore.HasValue).Average(e => e.OverallScore.Value) : 0m)
                                      .Select(dg => dg.Key)
                                      .FirstOrDefault() ?? "N/A"
                })
                .OrderBy(y => y.Year)
                .ToListAsync();

            // 5. Données de tendance
            var orderedYears = performanceByYear.OrderBy(y => y.Year).ToList();
            var trendData = new TrendDto
            {
                IsIncreasing = orderedYears.Count > 1 && 
                              orderedYears.Last().AverageScore > orderedYears.First().AverageScore,
                PercentageChange = orderedYears.Count > 1 && orderedYears.First().AverageScore != 0 ?
                                  (orderedYears.Last().AverageScore - orderedYears.First().AverageScore) / 
                                  orderedYears.First().AverageScore * 100 : 0,
                StartValue = orderedYears.FirstOrDefault()?.AverageScore ?? 0,
                EndValue = orderedYears.LastOrDefault()?.AverageScore ?? 0,
                StandardDeviation = CalculateStandardDeviation(evaluations.Where(e => e.OverallScore.HasValue).Select(e => e.OverallScore.Value).ToList())
            };

            // Retourner toutes les statistiques
            return new DetailedStatisticsDto
            {
                ScoreDistribution = scoreDistribution,
                DepartmentDistribution = departmentDistribution,
                EvaluationTypeDistribution = evaluationTypeDistribution,
                PerformanceByYear = performanceByYear,
                TrendData = trendData
            };
        }

        private double CalculateStandardDeviation(List<decimal> values)
        {
            if (!values.Any()) return 0;
            
            double avg = (double)values.Average();
            double sumOfSquaredDifferences = values.Sum(val => Math.Pow((double)val - avg, 2));
            return Math.Sqrt(sumOfSquaredDifferences / values.Count);
        }

        public async Task<IEnumerable<string>> GetEvaluationTypesAsync()
        {
            try
            {
                var types = await _context.EvaluationTypes
                    .Select(et => et.Designation)
                    .Distinct()
                    .ToListAsync();
                
                if (!types.Any())
                {
                    // Retourner des valeurs par défaut si aucun type n'est trouvé
                    return new List<string> { "Annuelle", "Trimestrielle", "Probatoire", "Promotion" };
                }
                
                return types;
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Erreur lors de la récupération des types d'évaluation : {ex.Message}");
                // Retourner des valeurs par défaut en cas d'erreur
                return new List<string> { "Annuelle", "Trimestrielle", "Probatoire", "Promotion" };
            }
        }

        public async Task<IEnumerable<object>> GetEmployeesAsync()
        {
            try
            {
                // Récupérer les employés avec leur position en utilisant la vue VEmployeePosition
                var employees = await _context.VEmployeePosition
                    .Select(e => new
                    {
                        id = e.EmployeeId,
                        firstName = e.FirstName,
                        lastName = e.Name,
                        registrationNumber = e.RegistrationNumber,
                        position = e.PositionName
                    })
                    .ToListAsync();

                // Si aucun employé n'est trouvé avec VEmployeePosition, essayer avec Employee
                if (!employees.Any())
                {
                    employees = await _context.Employee
                        .Select(e => new
                        {
                            id = e.EmployeeId,
                            firstName = e.FirstName,
                            lastName = e.Name,
                            registrationNumber = e.RegistrationNumber,
                            position = (string)null
                        })
                        .ToListAsync();
                }

                return employees;
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Erreur lors de la récupération des employés : {ex.Message}");
                
                // En cas d'erreur, essayer de récupérer uniquement les données de base des employés
                try
                {
                    return await _context.Employee
                        .Select(e => new
                        {
                            id = e.EmployeeId,
                            firstName = e.FirstName,
                            lastName = e.Name,
                            registrationNumber = e.RegistrationNumber,
                            position = (string)null
                        })
                        .ToListAsync();
                }
                catch
                {
                    return new List<object>();
                }
            }
        }

    }
}
