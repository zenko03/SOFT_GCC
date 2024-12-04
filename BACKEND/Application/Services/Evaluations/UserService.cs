using Microsoft.Data.SqlClient;
using Microsoft.EntityFrameworkCore;
using soft_carriere_competence.Core.Entities.Evaluations;
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
            Console.WriteLine("Avant la requete query ");

            var user = await _context.Users
        .Include(u=> u.Poste)
        .Include(u=> u.Department)
        .Include(u=> u.Role)
        .FirstOrDefaultAsync(u => u.Id == employeeId);

            Console.WriteLine(" Apres la requete ");

            if (user != null)
            {
                Console.WriteLine($"PostId: {user.PostId}, RoleId: {user.RoleId}, DepartmentId: {user.DepartmentId}");
            }

            return user;
        }

        public async Task<Poste?> GetPostByIdAsync(int postId)
        {
            return await _context.postes.FindAsync(postId);
        }



    }
}
