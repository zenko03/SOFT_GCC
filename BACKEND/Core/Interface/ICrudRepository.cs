﻿namespace soft_carriere_competence.Core.Interface
{
	public interface ICrudRepository<T> where T : class
	{
		Task<IEnumerable<T>> GetAll();
		Task<T> GetById(int id);
		Task Add(T entity);
		Task Update(T entity);
		Task Delete(int id);
	}
}
