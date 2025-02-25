﻿using Microsoft.CodeAnalysis.Scripting;
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
        private readonly IEmailService _emailService; // Service pour l'envoi d'emails.




        public UserService(IGenericRepository<User> repository, ApplicationDbContext context, IConfiguration configuration, IEmailService emailService)
        {
            _userRepository = repository;
            _context = context;
            _configuration = configuration;
            _emailService = emailService;
        }
        // Méthode pour récupérer tous les employés
        public async Task<IEnumerable<User>> GetAllEmployeesAsync()
        {
            return await _userRepository.GetAllAsync();
        }

        // Méthode pour récupérer tous les employés avec leur position et date d'évaluation
        public async Task<IEnumerable<VEmployeeDetails>> GetAllEmployeesWithDetailsAsync()
        {
            return await _context.VEmployeeDetails.ToListAsync();
        }

        public async Task<VEmployeeDetails?> GetEmployeeAsync(int employeeId)
        {
            return await _context.VEmployeeDetails
                .FirstOrDefaultAsync(e => e.EmployeeId == employeeId);
        }


        public async Task<Poste?> GetPostByIdAsync(int postId)
        {
            return await _context.postes.FindAsync(postId);
        }

        public async Task<IEnumerable<User>> GetManagerAndDirector()
        {
            return await _context.Users.Where(u => u.RoleId == 2 || u.RoleId ==4).ToListAsync();
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
                CreationDate = DateTime.UtcNow,
                DepartmentId = dto.departementId,
                PostId = 1,
                Createdby = 1

            };

            await _userRepository.CreateAsync(user); // Ajout de l'utilisateur dans la base de données.
            return "Utilisateur enregistré avec succès.";
        }

        // Méthode pour connecter un utilisateur.
        public async Task<string> LoginAsync(LoginDto dto)
        {
            Console.WriteLine("Tafiditra ato 1");

            // Recherche de l'utilisateur par email.
            var user = await _userRepository.GetFirstOrDefaultAsync(u => u.Email == dto.Email);
            Console.WriteLine("Tafiditra ato 2");

            if (user == null || !BCrypt.Net.BCrypt.Verify(dto.Password, user.Password))
                throw new Exception("Email ou mot de passe incorrect.");

            // Génération du token JWT si la connexion est réussie.

            string mdp = "test";

            // Hachage du mot de passe
            string hashedPassword = BCrypt.Net.BCrypt.HashPassword(mdp);

            // Affichage du mot de passe haché
            Console.WriteLine("Mot de passe haché : " + hashedPassword);
            var token = GenerateJwtToken(user);
            Console.WriteLine("Token: " , token);
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
            var key = _configuration["Jwt:Key"];
            if (string.IsNullOrEmpty(key))
            {
                throw new Exception("La clé JWT est manquante ou invalide dans la configuration.");
            }

            var securityKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(key));
            var credentials = new SigningCredentials(securityKey, SecurityAlgorithms.HmacSha256);

            var claims = new List<Claim>
    {
        new Claim("userId", user.Id.ToString()), // ID de l'utilisateur
        new Claim("email", user.Email), // Email de l'utilisateur
        new Claim("firstName", user.FirstName), // Prénom
        new Claim("lastName", user.LastName), // Nom
        new Claim("roleId", user.RoleId.ToString()), // ID du rôle
        new Claim("roleTitle", user.Role?.Title ?? "Unknown"), // Titre du rôle
        new Claim("postId", user.PostId.ToString()), // ID du poste
        new Claim("departmentId", user.DepartmentId.ToString()) // ID du département
    };

            var token = new JwtSecurityToken(
                _configuration["Jwt:Issuer"],
                _configuration["Jwt:Audience"],
                claims,
                expires: DateTime.UtcNow.AddHours(1),
                signingCredentials: credentials
            );

            return new JwtSecurityTokenHandler().WriteToken(token);
        }


        public async Task<int> CountAsync(int? department = null)
        {
            var query = _context.Users.AsQueryable();

            if (department.HasValue)
                query = query.Where(u => u.DepartmentId == department.Value);

            return await query.CountAsync();
        }

        public async Task<IEnumerable<User>> GetUsersPaginatedAsync(int pageNumber, int pageSize, string includeProperties = "")
        {
            // Utilise la méthode GetPage du GenericRepository pour récupérer les utilisateurs paginés
            return _userRepository.GetPage(pageNumber, pageSize, includeProperties);
        }

        public int GetTotalPages(int pageSize)
        {
            // Utilise la méthode GetTotalPages du GenericRepository pour calculer le nombre total de pages
            return _userRepository.GetTotalPages(pageSize);
        }

        public async Task<(IEnumerable<User> Users, int TotalPages)> GetUsersWithPaginationAsync(int pageNumber, int pageSize)
        {
            var users = await GetUsersPaginatedAsync(pageNumber, pageSize);
            var totalPages = GetTotalPages(pageSize);

            return (users, totalPages);
        }

        public async Task<(IEnumerable<VEmployeeDetails> Employees, int TotalPages)> GetVEmployeeDetailsPaginatedAsync(int pageNumber, int pageSize)
        {
            var query = _context.VEmployeeDetails.AsQueryable();

            // Calculer le nombre total de pages
            var totalItems = await query.CountAsync();
            var totalPages = (int)Math.Ceiling((double)totalItems / pageSize);

            // Paginer les résultats
            var employees = await query
                .Skip((pageNumber - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync();

            return (employees, totalPages);
        }

        public async Task<User> GetUserByEmailAsync(string email)
        {
            return await _context.Users
                .Include(u => u.Department)
                .Include(u => u.Role)
                .Include(u => u.Poste)
                .FirstOrDefaultAsync(u => u.Email == email);
        }

        public async Task<User?> GetUserByIdAsync(int userId)
        {
            return await _context.Users
                .Include(u => u.Department)
                .Include(u => u.Role)
                .Include(u => u.Poste)
                .FirstOrDefaultAsync(u => u.Id == userId);
        }

    }
}
