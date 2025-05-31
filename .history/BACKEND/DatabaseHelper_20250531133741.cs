using System;
using System.Collections.Generic;
using System.Data;
using Microsoft.Data.SqlClient;
using Microsoft.Extensions.Configuration;

namespace soft_carriere_competence
{
    public class DatabaseHelper
    {
        private readonly string _connectionString;

        public DatabaseHelper(IConfiguration configuration)
        {
            _connectionString = configuration.GetConnectionString("DefaultConnection");
        }

        // Constructeur pour utilisation directe avec chaîne de connexion
        public DatabaseHelper(string connectionString)
        {
            _connectionString = connectionString;
        }

        // Exécute une requête SQL et retourne un DataTable
        public DataTable ExecuteQuery(string query)
        {
            DataTable dataTable = new DataTable();

            using (SqlConnection connection = new SqlConnection(_connectionString))
            {
                try
                {
                    connection.Open();
                    SqlCommand command = new SqlCommand(query, connection);
                    SqlDataAdapter adapter = new SqlDataAdapter(command);
                    adapter.Fill(dataTable);
                    return dataTable;
                }
                catch (Exception ex)
                {
                    Console.WriteLine($"Erreur lors de l'exécution de la requête: {ex.Message}");
                    throw;
                }
            }
        }

        // Exécute une commande SQL (INSERT, UPDATE, DELETE) et retourne le nombre de lignes affectées
        public int ExecuteNonQuery(string commandText)
        {
            using (SqlConnection connection = new SqlConnection(_connectionString))
            {
                try
                {
                    connection.Open();
                    SqlCommand command = new SqlCommand(commandText, connection);
                    return command.ExecuteNonQuery();
                }
                catch (Exception ex)
                {
                    Console.WriteLine($"Erreur lors de l'exécution de la commande: {ex.Message}");
                    throw;
                }
            }
        }

        // Exécute une requête et retourne une valeur unique
        public object ExecuteScalar(string query)
        {
            using (SqlConnection connection = new SqlConnection(_connectionString))
            {
                try
                {
                    connection.Open();
                    SqlCommand command = new SqlCommand(query, connection);
                    return command.ExecuteScalar();
                }
                catch (Exception ex)
                {
                    Console.WriteLine($"Erreur lors de l'exécution de la requête: {ex.Message}");
                    throw;
                }
            }
        }
    }
} 