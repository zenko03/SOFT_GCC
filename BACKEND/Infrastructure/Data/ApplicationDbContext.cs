using Microsoft.EntityFrameworkCore;
using soft_carriere_competence.Core.Entities;

namespace soft_carriere_competence.Infrastructure.Data
{
	public class ApplicationDbContext : DbContext
	{
		public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options) : base(options)
		{
		}

		public DbSet<StudyPath> StudyPaths { get; set; }
		public DbSet<School> Schools { get; set; }
		public DbSet<Degree> Degrees { get; set; }
		public DbSet<EmployeeEducation> EmployeeEducations { get; set; }

		protected override void OnModelCreating(ModelBuilder modelBuilder)
		{
			base.OnModelCreating(modelBuilder);
		}
	}
}
