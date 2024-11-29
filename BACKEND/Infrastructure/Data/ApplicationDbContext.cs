using Microsoft.EntityFrameworkCore;
using soft_carriere_competence.Core.Entities.Evaluations;
using soft_carriere_competence.Core.Entities.salary_skills;
using static System.Runtime.InteropServices.JavaScript.JSType;

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
		public DbSet<Skill> Skill { get; set; }
		public DbSet<DomainSkill> DomainSkill { get; set; }
		public DbSet<EmployeeSkill> EmployeeSkill { get; set; }
		public DbSet<EmployeeLanguage> EmployeeLanguage { get; set; }
		public DbSet<Language> Language { get; set; }
		public DbSet<EmployeeOtherFormation> EmployeeOtherFormation { get; set; }
		public DbSet<Employee> Employee { get; set; }
		public DbSet<Department> Department { get; set; }
		public DbSet<VEmployee> VEmployee { get; set; }
		public DbSet<VEmployeeSkill> VEmployeeSkill { get; set; }
		public DbSet<VEmployeeEducation> VEmployeeEducation { get; set; }
		public DbSet<VEmployeeLanguage> VEmployeeLanguage { get; set; }
		public DbSet<VEmployeeOtherSkill> VEmployeeOtherSkill { get; set; }
		public DbSet<VSkills> VSkills { get; set; }

        //EVALUATIONS
        public DbSet<Role> Roles { get; set; }
        public DbSet<User> Users { get; set; }
        public DbSet<EvaluationType> EvaluationTypes { get; set; }
        public DbSet<Evaluation> Evaluations { get; set; }
        public DbSet<EvaluationQuestionnaire> EvaluationQuestionnaires { get; set; }
        public DbSet<EvaluationSchedule> EvaluationSchedules { get; set; }
        public DbSet<TrainingSuggestion> TrainingSuggestions { get; set; }
        public DbSet<EvaluationHistory> EvaluationHistories { get; set; }
        public DbSet<PerformanceEvolution> PerformanceEvolutions { get; set; }
		public DbSet<Poste> postes { get; set; }
		public DbSet<EvaluationQuestion> evaluationQuestions {  get; set; }  

        protected override void OnModelCreating(ModelBuilder modelBuilder)
		{
			base.OnModelCreating(modelBuilder);

			// Configurer la vue comme une entité en lecture seule
			modelBuilder.Entity<VEmployee>().ToView("v_employee");
			modelBuilder.Entity<VEmployee>().HasNoKey();
			modelBuilder.Entity<VEmployeeSkill>().ToView("v_employee_skill"); 
			modelBuilder.Entity<VEmployeeSkill>().HasNoKey();
			modelBuilder.Entity<VEmployeeEducation>().ToView("v_employee_education");
			modelBuilder.Entity<VEmployeeEducation>().HasNoKey();
			modelBuilder.Entity<VEmployeeLanguage>().ToView("v_employee_language");
			modelBuilder.Entity<VEmployeeLanguage>().HasNoKey();
			modelBuilder.Entity<VEmployeeOtherSkill>().ToView("v_employee_other_formation");
			modelBuilder.Entity<VEmployeeOtherSkill>().HasNoKey();
			modelBuilder.Entity<VSkills>().ToView("v_skills");
			modelBuilder.Entity<VSkills>().HasNoKey();
		}
	}
}
