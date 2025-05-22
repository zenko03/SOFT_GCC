namespace soft_carriere_competence.Application.Dtos.LoginDto
{
    public class LoginDto
    {
        /// <summary>
        /// Peut contenir soit un nom d'utilisateur soit un email
        /// </summary>
        public string UsernameOrEmail { get; set; }
        public string Password { get; set; }
    }
}
