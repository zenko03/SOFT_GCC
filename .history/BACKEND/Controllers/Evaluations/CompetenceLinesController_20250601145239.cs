using Microsoft.AspNetCore.Mvc;
using soft_carriere_competence.Application.Services.Evaluations;
using soft_carriere_competence.Infrastructure.Data;

namespace soft_carriere_competence.Controllers.Evaluations
{
    [Route("api/CompetenceLines")]
    [ApiController]
    public class CompetenceLinesController : CompetenceController
    {
        public CompetenceLinesController(CompetenceLineService competenceLineService, ApplicationDbContext context)
            : base(competenceLineService, context)
        {
            // Réutilise les méthodes du CompetenceController parent
        }
    }
} 