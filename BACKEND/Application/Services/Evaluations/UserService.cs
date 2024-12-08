using Microsoft.CodeAnalysis.Scripting;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using soft_carriere_competence.Application.Dtos.LoginDto;
using soft_carriere_competence.Core.Entities.Evaluations;
using soft_carriere_competence.Core.Interface;
using soft_carriere_competence.Core.Interface.AuthInterface;
using soft_carriere_competence.Infrastructure.Data;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;

namespace soft_carriere_competence.Application.Services.Evaluations
{
    public class UserService : IUserService
    {
        private readonly IGenericRepository<User> _userRepository;
        private readonly ApplicationDbContext _context;
        private readonly IConfiguration _configuration;



        public UserService(IGenericRepository<User> repository, ApplicationDbContext context, IConfiguration configuration)
        {
            _userRepository = repository;
            _context = context;
            _configuration = configuration;
        }
        // Méthode pour récupérer tous les employés
        public async Task<IEnumerable<User>> GetAllEmployeesAsync()
        {
            return await _userRepository.GetAllAsync();
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


        // --------------------------------------AUTHENTIFICATION--------------------------------------- //


        // Méthode pour inscrire un nouvel utilisateur.
        public async Task<string> RegisterAsync(RegisterDto dto)
        {
            // Vérifie si l'email existe déjà dans la base de données.
            var userExists = await _userRepository.GetFirstOrDefaultAsync(u => u.Email == dto.Email);
            if (userExists != null)
                throw new Exception("Email déjà utilisé.");

            // Hashage sécurisé du mot de passe.
            var hashedPassword = BCrypt.Net.BCrypt.HashPassword(dto.Password);

            // Création d'un nouvel utilisateur.
            var user = new User
            {
                LastName = dto.LastName,
                FirstName = dto.FirstName,
                Email = dto.Email,
                Password = hashedPassword,
                RoleId = dto.RoleId,
                CreationDate = DateTime.UtcNow
            };

            await _userRepository.CreateAsync(user); // Ajout de l'utilisateur dans la base de données.
            return "Utilisateur enregistré avec succès.";
        }

        // Méthode pour connecter un utilisateur.
        public async Task<string> LoginAsync(LoginDto dto)
        {
            // Recherche de l'utilisateur par email.
            var user = await _userRepository.GetFirstOrDefaultAsync(u => u.Email == dto.Email);
            if (user == null || !BCrypt.Net.BCrypt.Verify(dto.Password, user.Password))
                throw new Exception("Email ou mot de passe incorrect.");

            // Génération du token JWT si la connexion est réussie.
            var token = GenerateJwtToken(user);
            return token;
        }

        public async Task<string> ForgotPasswordAsync(string email)
        {
            // Recherche de l'utilisateur par email.
            var user = await _userRepository.GetFirstOrDefaultAsync(u => u.Email == email);
            if (user == null)
                throw new Exception("Utilisateur non trouvé.");

            // Génération d'un token de réinitialisation unique.
            var resetToken = Guid.NewGuid().ToString();
            // Ce token peut être sauvegardé en base de données pour validation ultérieure.

            // Envoi de l'email contenant le token de réinitialisation.
            await _emailService.SendEmailAsync(user.Email, "Réinitialisation du mot de passe",
                $"Votre token de réinitialisation est : {resetToken}");

            return "Email de réinitialisation envoyé.";
        }

        // Méthode pour réinitialiser un mot de passe.
        public async Task<string> ResetPasswordAsync(ResetPasswordDto dto)
        {
            // Vérification du token ici (si nécessaire, selon la logique de stockage).

            var user = await _userRepository.GetFirstOrDefaultAsync(u => u.Email == dto.Email);
            if (user == null)
                throw new Exception("Utilisateur non trouvé.");

            // Hashage du nouveau mot de passe et mise à jour.
            user.Password = BCrypt.Net.BCrypt.HashPassword(dto.NewPassword);
            await _userRepository.UpdateAsync(user);

            return "Mot de passe réinitialisé avec succès.";
        }

        // Méthode pour générer un token JWT pour un utilisateur.
        private string GenerateJwtToken(User user)
        {
            // Clé de sécurité utilisée pour signer le token.
            var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_configuration["Jwt:Key"]));
            var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

            // Création des claims pour le token (informations utilisateur).
            var claims = new List<Claim>
            {
                new Claim(ClaimTypes.Name, user.Email), // Email de l'utilisateur.
                new Claim(ClaimTypes.Role, user.RoleId.ToString()) // Rôle de l'utilisateur.
            };

            // Construction du token avec les claims et les paramètres.
            var token = new JwtSecurityToken(
                _configuration["Jwt:Issuer"],
                _configuration["Jwt:Issuer"],
                claims,
                expires: DateTime.Now.AddHours(1), // Expiration dans une heure.
                signingCredentials: creds
            );

            // Retourne le token sous forme de chaîne.
            return new JwtSecurityTokenHandler().WriteToken(token);
        }

    }
}
