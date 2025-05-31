using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Configuration;
using System;
using System.Data;
using System.Text.Json;

namespace soft_carriere_competence.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AIDataController : ControllerBase
    {
        private readonly DatabaseHelper _dbHelper;
        
        public AIDataController(IConfiguration configuration)
        {
            _dbHelper = new DatabaseHelper(configuration);
        }

        [HttpGet("tables")]
        public IActionResult GetAllTables()
        {
            try
            {
                string query = @"
                    SELECT TABLE_NAME 
                    FROM INFORMATION_SCHEMA.TABLES
                    WHERE TABLE_TYPE = 'BASE TABLE'";
                
                DataTable result = _dbHelper.ExecuteQuery(query);
                return Ok(ConvertDataTableToJson(result));
            }
            catch (Exception ex)
            {
                return BadRequest($"Erreur lors de la récupération des tables: {ex.Message}");
            }
        }

        [HttpGet("schema/{tableName}")]
        public IActionResult GetTableSchema(string tableName)
        {
            try
            {
                string query = $@"
                    SELECT COLUMN_NAME, DATA_TYPE, IS_NULLABLE
                    FROM INFORMATION_SCHEMA.COLUMNS
                    WHERE TABLE_NAME = '{tableName}'";
                
                DataTable result = _dbHelper.ExecuteQuery(query);
                return Ok(ConvertDataTableToJson(result));
            }
            catch (Exception ex)
            {
                return BadRequest($"Erreur lors de la récupération du schéma: {ex.Message}");
            }
        }

        [HttpGet("query")]
        public IActionResult ExecuteQuery([FromQuery] string sql)
        {
            try
            {
                if (string.IsNullOrEmpty(sql))
                {
                    return BadRequest("La requête SQL ne peut pas être vide");
                }

                // Vérification de sécurité basique - empêcher les opérations de modification
                string sqlLower = sql.ToLower();
                if (sqlLower.Contains("insert") || sqlLower.Contains("update") || 
                    sqlLower.Contains("delete") || sqlLower.Contains("drop") ||
                    sqlLower.Contains("create") || sqlLower.Contains("alter"))
                {
                    return BadRequest("Seules les requêtes SELECT sont autorisées par cette API");
                }

                DataTable result = _dbHelper.ExecuteQuery(sql);
                return Ok(ConvertDataTableToJson(result));
            }
            catch (Exception ex)
            {
                return BadRequest($"Erreur lors de l'exécution de la requête: {ex.Message}");
            }
        }

        // Méthode utilitaire pour convertir DataTable en JSON
        private string ConvertDataTableToJson(DataTable dt)
        {
            var rows = new object[dt.Rows.Count];
            for (int i = 0; i < dt.Rows.Count; i++)
            {
                var row = dt.Rows[i];
                var dict = new System.Collections.Generic.Dictionary<string, object>();
                foreach (DataColumn col in dt.Columns)
                {
                    dict[col.ColumnName] = row[col] == DBNull.Value ? null : row[col];
                }
                rows[i] = dict;
            }
            return JsonSerializer.Serialize(rows);
        }
    }
} 