using Microsoft.EntityFrameworkCore;

namespace soft_carriere_competence.Data
{
    public class DataContext: DbContext
    {
        public DataContext(DbContextOptions<DataContext> options):base(options) { }
    }
}
