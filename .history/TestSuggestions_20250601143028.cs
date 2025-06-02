using System;
using System.Collections.Generic;
using System.Net.Http;
using System.Net.Http.Headers;
using System.Text;
using System.Text.Json;
using System.Threading.Tasks;

namespace TestSuggestions
{
    public class TrainingSuggestionsRequestDto
    {
        public Dictionary<int, int> Ratings { get; set; }
    }

    public class TrainingSuggestionResultDto
    {
        public string Question { get; set; }
        public string Training { get; set; }
        public string Details { get; set; }
    }

    class Program
    {
        static async Task Main(string[] args)
        {
            Console.WriteLine("Programme de test pour les suggestions de formation");
            
            // Créer un HttpClient avec l'acceptation des certificats auto-signés
            var handler = new HttpClientHandler
            {
                ServerCertificateCustomValidationCallback = (message, cert, chain, errors) => true
            };
            
            using (var client = new HttpClient(handler))
            {
                client.BaseAddress = new Uri("https://localhost:7082/");
                client.DefaultRequestHeaders.Accept.Clear();
                client.DefaultRequestHeaders.Accept.Add(
                    new MediaTypeWithQualityHeaderValue("application/json"));
                
                try
                {
                    // Test 1: Vérifier que les suggestions existent
                    Console.WriteLine("=== 1. Vérification des suggestions de formation existantes ===");
                    var responseSuggestions = await client.GetAsync("api/Evaluation/training-suggestions");
                    if (responseSuggestions.IsSuccessStatusCode)
                    {
                        var suggestionJson = await responseSuggestions.Content.ReadAsStringAsync();
                        Console.WriteLine($"Réponse: {suggestionJson}");
                        Console.WriteLine("Des suggestions sont disponibles.");
                    }
                    else
                    {
                        Console.WriteLine($"Erreur: {responseSuggestions.StatusCode}");
                    }
                    
                    // Test 2: Vérifier les colonnes TrainingSuggestions
                    Console.WriteLine("\n=== 2. Test de l'API suggestions ===");
                    
                    var requestData = new TrainingSuggestionsRequestDto
                    {
                        Ratings = new Dictionary<int, int>
                        {
                            { 1, 2 },
                            { 2, 2 },
                            { 3, 2 },
                            { 4, 2 },
                            { 5, 2 }
                        }
                    };
                    
                    var jsonContent = JsonSerializer.Serialize(requestData);
                    var content = new StringContent(jsonContent, Encoding.UTF8, "application/json");
                    
                    var response = await client.PostAsync("api/Evaluation/suggestions", content);
                    
                    if (response.IsSuccessStatusCode)
                    {
                        var resultJson = await response.Content.ReadAsStringAsync();
                        Console.WriteLine($"Réponse: {resultJson}");
                        
                        var results = JsonSerializer.Deserialize<List<TrainingSuggestionResultDto>>(resultJson);
                        Console.WriteLine($"Nombre de suggestions trouvées: {results?.Count ?? 0}");
                    }
                    else
                    {
                        Console.WriteLine($"Erreur: {response.StatusCode}");
                        Console.WriteLine(await response.Content.ReadAsStringAsync());
                    }
                }
                catch (Exception ex)
                {
                    Console.WriteLine($"Exception: {ex.Message}");
                    if (ex.InnerException != null)
                    {
                        Console.WriteLine($"Inner exception: {ex.InnerException.Message}");
                    }
                }
                
                Console.WriteLine("\nAppuyez sur une touche pour quitter...");
                Console.ReadKey();
            }
        }
    }
} 