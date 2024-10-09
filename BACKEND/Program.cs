using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using System.Text;
using soft_carriere_competence.Application.Services;
using soft_carriere_competence.Infrastructure.Data;
using soft_carriere_competence.Core.Interface;
using soft_carriere_competence.Infrastructure.Repositories;
using soft_carriere_competence.Core.Entities;
using soft_carriere_competence.Application.Services.competences_salaries;

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


builder.Services.AddControllers();
// Learn more about configuring Swagger/OpenAPI at https://aka.ms/aspnetcore/swashbuckle
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

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

app.UseHttpsRedirection();
app.UseAuthentication();

app.UseAuthorization();

app.MapControllers();

app.Run();