using System.Text;
using Microsoft.Data.SqlClient;
using Microsoft.EntityFrameworkCore;
using soft_carriere_competence.Core.Entities.career_plan;
using soft_carriere_competence.Core.Entities.crud_career;
using soft_carriere_competence.Core.Entities.retirement;
using soft_carriere_competence.Core.Interface;
using soft_carriere_competence.Infrastructure.Data;

namespace soft_carriere_competence.Application.Services.retirement
{
	public class RetirementService
	{
		private readonly ICrudRepository<RetirementParameter> _repository;
		private readonly ApplicationDbContext _context;

		public RetirementService(ICrudRepository<RetirementParameter> repository, ApplicationDbContext context)
		{
			_repository = repository;
			_context = context;
		}

		public async Task<IEnumerable<RetirementParameter>> GetAll()
		{
			return await _repository.GetAll();
		}

		public async Task<RetirementParameter> GetById(int id)
		{
			return await _repository.GetById(id);
		}

		public async Task Update(RetirementParameter echelon)
		{
			await _repository.Update(echelon);
		}

		// Recuperer les departs a la retraite
		public async Task<List<VRetirement>> GetRetirementList()
		{
			return await _context.VRetirement
				.FromSqlRaw("SELECT * FROM v_retirement ORDER BY age DESC")
				.ToListAsync();
		}

		// Filtrer les departs a la retraite
		public async Task<(List<VRetirement> Data, int TotalCount)> GetRetirementFilter(
		string? keyWord = null,
		string? civiliteId = null,
		string? departmentId = null,
		string? positionId = null,
		string? age = null,
		string? year = null,
		int page = 1,
		int pageSize = 10)
		{
			var sql = new StringBuilder("SELECT * FROM v_retirement WHERE 1=1");
			var countSql = new StringBuilder("SELECT COUNT(*) AS count FROM v_retirement WHERE 1=1");
			var parameters = new List<SqlParameter>();

			// Ajouter les conditions de filtrage
			if (!string.IsNullOrWhiteSpace(keyWord))
			{
				sql.Append(" AND (registration_number LIKE @KeyWord OR name LIKE @KeyWord OR firstname LIKE @KeyWord)");
				countSql.Append(" AND (registration_number LIKE @KeyWord OR name LIKE @KeyWord OR firstname LIKE @KeyWord)");
				parameters.Add(new SqlParameter("@KeyWord", $"%{keyWord}%"));
			}

			if (!string.IsNullOrWhiteSpace(civiliteId))
			{
				sql.Append(" AND civilite_id = @CiviliteId");
				countSql.Append(" AND civilite_id = @CiviliteId");
				parameters.Add(new SqlParameter("@CiviliteId", civiliteId));
			}

			if (!string.IsNullOrWhiteSpace(departmentId))
			{
				sql.Append(" AND department_id = @DepartmentId");
				countSql.Append(" AND department_id = @DepartmentId");
				parameters.Add(new SqlParameter("@DepartmentId", departmentId));
			}

			if (!string.IsNullOrWhiteSpace(positionId))
			{
				sql.Append(" AND position_id = @PositionId");
				countSql.Append(" AND position_id = @PositionId");
				parameters.Add(new SqlParameter("@PositionId", positionId));
			}

			if (!string.IsNullOrWhiteSpace(age))
			{
				sql.Append(" AND age = @Age");
				countSql.Append(" AND age = @Age");
				parameters.Add(new SqlParameter("@Age", age));
			}

			if (!string.IsNullOrWhiteSpace(year))
			{
				sql.Append(" AND Year_retirement = @Year");
				countSql.Append(" AND Year_retirement = @Year");
				parameters.Add(new SqlParameter("@Year", year));
			}

			// Ajout de la pagination
			sql.Append(" ORDER BY date_retirement OFFSET @Offset ROWS FETCH NEXT @PageSize ROWS ONLY");
			parameters.Add(new SqlParameter("@Offset", (page - 1) * pageSize));
			parameters.Add(new SqlParameter("@PageSize", pageSize));

			// Exécution des requêtes
			var totalCount = await _context.VRetirement
				.FromSqlRaw(countSql.ToString(), parameters.ToArray())
				.CountAsync(); // La requête COUNT est maintenant correcte

			var data = await _context.VRetirement
				.FromSqlRaw(sql.ToString(), parameters.ToArray())
				.ToListAsync();

			return (data, totalCount);
		}
	}
}
