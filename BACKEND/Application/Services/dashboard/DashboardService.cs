using Microsoft.Data.SqlClient;
using Microsoft.EntityFrameworkCore;
using soft_carriere_competence.Core.Entities.career_plan;
using soft_carriere_competence.Core.Entities.dashboard;
using soft_carriere_competence.Core.Entities.wish_evolution;
using soft_carriere_competence.Core.Interface;
using soft_carriere_competence.Infrastructure.Data;

namespace soft_carriere_competence.Application.Services.dashboard
{
	public class DashboardService
	{
		private readonly ApplicationDbContext _context;

		public DashboardService(ApplicationDbContext context)
		{
			_context = context;
		}

		// Recuperer le nombre total d'un employe
		public async Task<int> GetEmployeeCount()
		{
			using (var command = _context.Database.GetDbConnection().CreateCommand())
			{
				command.CommandText = "SELECT COALESCE(COUNT(*), 0) FROM employee";
				command.CommandType = System.Data.CommandType.Text;

				_context.Database.OpenConnection();

				var result = await command.ExecuteScalarAsync();
				return Convert.ToInt32(result);
			}
		}

		// Recuperer le nombre total des demandes souhaits
		public async Task<int> GetWishEvolutionTotal()
		{
			using (var command = _context.Database.GetDbConnection().CreateCommand())
			{
				command.CommandText = "SELECT COALESCE(COUNT(*), 0) FROM wish_evolution_career";
				command.CommandType = System.Data.CommandType.Text;

				_context.Database.OpenConnection();

				var result = await command.ExecuteScalarAsync();
				return Convert.ToInt32(result);
			}
		}

        // Compétences moyenne par employé
        public async Task<double> GetAverageSkillPerEmployee()
        {
            using (var command = _context.Database.GetDbConnection().CreateCommand())
            {
                command.CommandText = "SELECT SUM(skill_number)/count(*)  FROM v_skills";
                command.CommandType = System.Data.CommandType.Text;

                _context.Database.OpenConnection();

                var result = await command.ExecuteScalarAsync();
                return Convert.ToDouble(result);
            }
        }

        // Competences des employees par departments
        public async Task<List<VNEmployeeSkillByDepartment>> GetEmployeeSkillByDepartment(int idDepartment, int state)
		{
			return await _context.VNEmployeeSkillByDepartment
				.FromSqlRaw("SELECT * FROM v_n_employee_skill_by_department WHERE Department_id = {0} AND state = {1}", idDepartment, state)
				.ToListAsync();
		}

		// Poste de carriere des employees par departments
		public async Task<List<VNEmployeeCareerByDepartment>> GetEmployeeCareerByDepartment(int idDepartment)
		{
			return await _context.VNEmployeeCareerByDepartment
				.FromSqlRaw("SELECT * FROM v_n_employee_career_by_department WHERE Department_id = {0}", idDepartment)
				.ToListAsync();
		}
	}
}
