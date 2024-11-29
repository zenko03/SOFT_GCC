using Microsoft.Data.SqlClient;
using Microsoft.EntityFrameworkCore;
using soft_carriere_competence.Core.Entities.salary_skills;
using soft_carriere_competence.Core.Interface;
using soft_carriere_competence.Infrastructure.Data;

namespace soft_carriere_competence.Application.Services.Evaluations
{
    public class UserService
    {
        private readonly IGenericRepository<User> _repository;
        private readonly ApplicationDbContext _context;


        public UserService(IGenericRepository<User> repository, ApplicationDbContext context)
        {
            _repository = repository;
            _context = context;
        }
        // Méthode pour récupérer tous les employés
        public async Task<IEnumerable<User>> GetAllEmployeesAsync()
        {
            return await _repository.GetAllAsync();
        }

        // Méthode pour récupérer tous les employés avec leur position et date d'évaluation
        public async Task<IEnumerable<object>> GetAllEmployeesWithDetailsAsync()
        {
            var employees = await _context.Users
                .Include(u => u.Poste)
                .Include(u => u.Role) // Jointure avec la table Roles pour récupérer le poste
                .Join(
                    _context.Evaluations,
                    user => user.Id,
                    eval => eval.UserId,
                    (user, eval) => new
                    {
                        user.Id,
                        user.FirstName,
                        user.LastName,
                        Role = user.Role.Title,  // Récupérer le rôle
                        Position = user.Poste.title, // Titre du poste à partir de Roles
                        EvaluationDate = eval.StartDate // Date de début d'évaluation
                    }
                )
                .ToListAsync();

            return employees;
        }
        public async Task<User?> GetEmployeeAsync(int employeeId)
        {
            Console.WriteLine("ato indray " + employeeId);

            var query = @"
                        SELECT 
                            u.UserId, 
                            u.first_name, 
                            u.last_name, 
                            u.email, 
                            u.password, 
                            u.postId, 
                            u.role_id, 
                            u.departmentid, 
                            u.creation_date, 
                            u.deletion_date, 
                            u.deleted_by, 
                            u.created_by,
                            r.title AS role_title,  -- Alias unique pour le titre du rôle
                            p.title AS post_title,  -- Alias unique pour le titre du poste
                            d.Department_name AS department_name -- Alias unique pour le nom du département
                        FROM Users u
                        LEFT JOIN Roles r ON u.role_id = r.Role_id
                        LEFT JOIN Postes p ON u.postId = p.Poste_id
                        LEFT JOIN Department d ON u.departmentid = d.Department_id
                        WHERE u.UserId = @employeeId";
            

            var user = await _context.Users
                .FromSqlRaw(query, new SqlParameter("@employeeId", employeeId))
                .FirstOrDefaultAsync();

            Console.WriteLine(" dia avy eo ato indray");

            if (user != null)
            {
                Console.WriteLine($"PostId: {user.PostId}, RoleId: {user.RoleId}, DepartmentId: {user.DepartmentId}");
            }

            return user;
        }



    }
}
