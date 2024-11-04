﻿using Microsoft.EntityFrameworkCore;
using soft_carriere_competence.Core.Entities.salary_skills;
using soft_carriere_competence.Core.Interface;
using soft_carriere_competence.Infrastructure.Data;

namespace soft_carriere_competence.Application.Services.salary_skills
{
	public class EmployeeSkillService
	{
			private readonly ICrudRepository<EmployeeSkill> _repository;
			private readonly ApplicationDbContext _context;


		public EmployeeSkillService(ICrudRepository<EmployeeSkill> repository, ApplicationDbContext context)
			{
				_repository = repository;
				_context = context;
			}

			public async Task<IEnumerable<EmployeeSkill>> GetAll()
			{
				return await _repository.GetAll();
			}

			public async Task<EmployeeSkill> GetById(int id)
			{
				return await _repository.GetById(id);
			}

			public async Task Add(EmployeeSkill employeeSkill)
			{
				await _repository.Add(employeeSkill);
			}

			public async Task Update(EmployeeSkill employeeSkill)
			{
				await _repository.Update(employeeSkill);
			}

			public async Task Delete(int id)
			{
				await _repository.Delete(id);
			}

			// Recuperer les competences d'un employee
			public async Task<List<VEmployeeSkill>> GetEmployeeSkills(int idEmployee)
			{
				return await _context.VEmployeeSkill
						 .FromSqlRaw("SELECT * FROM v_employee_skill WHERE Employee_id = {0}", idEmployee)
						 .ToListAsync();
			}

		// Les competences des employes
		public async Task<object> GetAllSkills(int pageNumber = 1, int pageSize = 10)
		{
			var totalRecords = await _context.VSkills.CountAsync();

			var skills = await _context.VSkills
				.FromSqlRaw("SELECT * FROM v_skills")
				.Skip((pageNumber - 1) * pageSize)
				.Take(pageSize)
				.ToListAsync();

			var totalPages = (int)Math.Ceiling((double)totalRecords / pageSize);

			return new
			{
				Data = skills,
				TotalRecords = totalRecords,
				PageSize = pageSize,
				CurrentPage = pageNumber,
				TotalPages = totalPages
			};
		}

		public async Task<object> GetAllSkillsFilter(string keyWord, int pageNumber = 1, int pageSize = 10)
		{
			// Utilisation de la requête SQL avec des paramètres pour éviter les injections SQL
			var filteredQuery = _context.VSkills
				.FromSqlRaw("SELECT * FROM v_skills WHERE Registration_number LIKE @p0 OR name LIKE @p0 OR firstname LIKE @p0", $"%{keyWord}%");

			// Compter le nombre total de résultats correspondant au filtre
			var totalRecords = await filteredQuery.CountAsync();

			// Appliquer la pagination aux résultats filtrés
			var skills = await filteredQuery
				.Skip((pageNumber - 1) * pageSize)
				.Take(pageSize)
				.ToListAsync(); 

			// Calculer le nombre total de pages
			var totalPages = (int)Math.Ceiling((double)totalRecords / pageSize);

			return new
			{
				Data = skills,
				TotalRecords = totalRecords,
				PageSize = pageSize,
				CurrentPage = pageNumber,
				TotalPages = totalPages
			};
		}


		// Recuperer la description d'un employee
		public async Task<List<VSkills>> GetEmployeeDescription(int idEmployee)
			{
				return await _context.VSkills
						 .FromSqlRaw("SELECT * FROM v_skills WHERE Employee_id = {0}", idEmployee)
						 .ToListAsync();
			}
	}
}
