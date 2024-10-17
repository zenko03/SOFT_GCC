using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using System.Text;
using soft_carriere_competence.Infrastructure.Data;
using soft_carriere_competence.Core.Interface;
using soft_carriere_competence.Infrastructure.Repositories;
using soft_carriere_competence.Core.Entities.salary_skills;
using soft_carriere_competence.Application.Services.salary_skills;
using Microsoft.EntityFrameworkCore;

var builder = WebApplication.CreateBuilder(args);
//Connect base SQLSERVER


#region Injection independance
builder.Services.AddScoped<EmployeeEducationService>();
builder.Services.AddScoped<ICrudRepository<EmployeeEducation>, CrudRepository<EmployeeEducation>>();

builder.Services.AddScoped<SchoolService>();
builder.Services.AddScoped<ICrudRepository<School>, CrudRepository<School>>();

builder.Services.AddScoped<DegreeService>();
builder.Services.AddScoped<ICrudRepository<Degree>, CrudRepository<Degree>>();

builder.Services.AddScoped<StudyPathService>();
builder.Services.AddScoped<ICrudRepository<StudyPath>, CrudRepository<StudyPath>>();

builder.Services.AddScoped<SkillService>();
builder.Services.AddScoped<ICrudRepository<Skill>, CrudRepository<Skill>>();

builder.Services.AddScoped<DomainSkillService>();
builder.Services.AddScoped<ICrudRepository<DomainSkill>, CrudRepository<DomainSkill>>();

builder.Services.AddScoped<EmployeeSkillService>();
builder.Services.AddScoped<ICrudRepository<EmployeeSkill>, CrudRepository<EmployeeSkill>>();

builder.Services.AddScoped<LanguageService>();
builder.Services.AddScoped<ICrudRepository<Language>, CrudRepository<Language>>();

builder.Services.AddScoped<EmployeeLanguageService>();
builder.Services.AddScoped<ICrudRepository<EmployeeLanguage>, CrudRepository<EmployeeLanguage>>();

builder.Services.AddScoped<EmployeeOtherFormationService>();
builder.Services.AddScoped<ICrudRepository<EmployeeOtherFormation>, CrudRepository<EmployeeOtherFormation>>();

builder.Services.AddScoped<EmployeeService>();
builder.Services.AddScoped<ICrudRepository<Employee>, CrudRepository<Employee>>();

builder.Services.AddScoped<DepartmentService>();
builder.Services.AddScoped<ICrudRepository<Department>, CrudRepository<Department>>();
#endregion


#region dbContext
builder.Services.AddDbContext<ApplicationDbContext>(options => options.UseSqlServer(builder.Configuration["ConnectionStrings:DefaultConnection"]), ServiceLifetime.Transient);

//builder.Services.AddDbContext<DataContext>(options =>
  //  options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection")));
#endregion

#region Authentification JWT
builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
}).AddJwtBearer(options =>
{
    options.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuer = true,
        ValidateAudience = true,
        ValidateLifetime = true,
        ValidateIssuerSigningKey = true,
        ValidIssuer = "https://localhost:7273",
        ValidAudience = "https://localhost:7273",
        IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes("super_secret_key_12345"))
    };
});

builder.Services.AddAuthorization();
#endregion

#region Cors configuration
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowReactApp",
        builder =>
        {
            builder.WithOrigins("http://localhost:3000") // Allow your React app
                   .AllowAnyHeader()
                   .AllowAnyMethod();
        });
});
#endregion

#region Swagger
builder.Services.AddControllers();
// Learn more about configuring Swagger/OpenAPI at https://aka.ms/aspnetcore/swashbuckle
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new Microsoft.OpenApi.Models.OpenApiInfo { Title = "TodoList API", Version = "v1" });

    // Ajouter la configuration pour le support de l'authentification JWT dans Swagger
    c.AddSecurityDefinition("Bearer", new Microsoft.OpenApi.Models.OpenApiSecurityScheme
    {
        In = Microsoft.OpenApi.Models.ParameterLocation.Header,
        Description = "Veuillez entrer le token JWT ici. Exemple : Bearer <token>",
        Name = "Authorization",
        Type = Microsoft.OpenApi.Models.SecuritySchemeType.ApiKey,
        Scheme = "Bearer"
    });

    c.AddSecurityRequirement(new Microsoft.OpenApi.Models.OpenApiSecurityRequirement
    {
        {
            new Microsoft.OpenApi.Models.OpenApiSecurityScheme
            {
                Reference = new Microsoft.OpenApi.Models.OpenApiReference
                {
                    Type = Microsoft.OpenApi.Models.ReferenceType.SecurityScheme,
                    Id = "Bearer"
                }
            },
            new string[] {}
        }
    });
});

var app = builder.Build();
app.UseCors("AllowReactApp");
// Activer Swagger UI
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI(c =>
    {
        c.SwaggerEndpoint("/swagger/v1/swagger.json", "SOFTCARRIERE ET COMPETENCE API v1");
    });
}
#endregion

app.UseHttpsRedirection();
app.UseAuthentication();

app.UseAuthorization();

app.MapControllers();

app.Run();