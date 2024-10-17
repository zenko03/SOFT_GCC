namespace soft_carriere_competence.Core.Interface
{
    public interface IAuthRepository
    {
        Task<User> GetUserByEmailAsync(string email);
        Task<User> GetUserByIdAsync(int id);
        Task AddUserAsync(User user);
        Task SaveChangesAsync();
    }
}
