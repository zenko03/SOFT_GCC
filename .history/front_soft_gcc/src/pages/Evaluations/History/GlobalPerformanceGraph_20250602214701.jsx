import { useEffect, useState, useCallback } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Legend,
  LabelList
} from 'recharts';
import axios from 'axios';
import { FaChartBar, FaChartLine, FaTachometerAlt } from 'react-icons/fa';
import PropTypes from 'prop-types';
import '../../../assets/css/Evaluations/GlobalPerformance.css';

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="custom-tooltip">
        <p className="tooltip-label">{`Année: ${label}`}</p>
        <p className="tooltip-value">
          <span className="tooltip-label">Score moyen:</span>
          <span className="tooltip-score">{payload[0].value.toFixed(2)}</span>
        </p>
        {payload[0].payload.evaluationCount && (
          <p className="tooltip-count">
            <span className="tooltip-label">Nombre d&apos;évaluations:</span>
            <span>{payload[0].payload.evaluationCount}</span>
          </p>
        )}
      </div>
    );
  }
  return null;
};

CustomTooltip.propTypes = {
  active: PropTypes.bool,
  payload: PropTypes.array,
  label: PropTypes.oneOfType([PropTypes.string, PropTypes.number])
};

const GlobalPerformanceGraph = ({ filters = {} }) => {
  const [chartData, setChartData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [kpis, setKpis] = useState({
    participationRate: 0,
    approvalRate: 0,
    overallAverage: 0,
    totalEvaluations: 0
  });

  // Récupérer les KPIs avec une meilleure gestion des erreurs et du formatage des dates
  const fetchKPIs = useCallback(async () => {
    try {
      console.log("Début de la récupération des KPIs avec filtres:", filters);
      
      // Préparer les paramètres avec une conversion robuste des dates
      const params = {};
      
      // Ajouter les filtres de département et type d'évaluation s'ils existent
      if (filters.department) params.departmentName = filters.department;
      
      // Conversion robuste des dates
      if (filters.startDate) {
        try {
          const date = new Date(filters.startDate);
          if (!isNaN(date.getTime())) {
            // Format de date YYYY-MM-DD pour l'API
            params.startDate = date.toISOString().split('T')[0];
            console.log("Date de début formatée:", params.startDate);
          }
        } catch (e) {
          console.error("Format de date de début invalide:", e);
        }
      }
      
      if (filters.endDate) {
        try {
          const date = new Date(filters.endDate);
          if (!isNaN(date.getTime())) {
            // Format de date YYYY-MM-DD pour l'API
            params.endDate = date.toISOString().split('T')[0];
            console.log("Date de fin formatée:", params.endDate);
          }
        } catch (e) {
          console.error("Format de date de fin invalide:", e);
        }
      }
      
      console.log("Paramètres pour KPIs finaux:", params);
      
      const response = await axios.get('https://localhost:7082/api/EvaluationHistory/kpis', { params });
      
      console.log("Réponse brute des KPIs:", response.data);
      
      if (response.data) {
        // Convertir les valeurs en nombres et s'assurer qu'elles sont valides
        const participationRate = parseFloat(response.data.participationRate) || 0;
        const approvalRate = parseFloat(response.data.approvalRate) || 0;
        const overallAverage = parseFloat(response.data.overallAverage) || 0;
        const totalEvaluations = parseInt(response.data.totalEvaluations) || 0;
        
        console.log("KPIs traités:", {
          participationRate,
          approvalRate,
          overallAverage,
          totalEvaluations
        });
        
        setKpis({
          participationRate,
          approvalRate,
          overallAverage,
          totalEvaluations
        });
      } else {
        console.warn("Réponse KPI vide ou nulle");
        setKpis({
          participationRate: 0,
          approvalRate: 0,
          overallAverage: 0,
          totalEvaluations: 0
        });
      }
    } catch (err) {
      console.error("Erreur lors du chargement des KPIs:", err);
      setKpis({
        participationRate: 0,
        approvalRate: 0,
        overallAverage: 0,
        totalEvaluations: 0
      });
    }
  }, [filters]);

  // Récupérer les données de performance avec gestion robuste des données nulles
  const fetchGlobalPerformanceData = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      // Préparation des paramètres avec une meilleure gestion des formats
      const params = {
        department: filters.department || undefined,
        evaluationType: filters.evaluationType || undefined
      };
      
      // Ajouter les dates uniquement si elles sont valides
      if (filters.startDate) {
        try {
          params.startDate = new Date(filters.startDate).toISOString();
        } catch (e) {
          console.error("Format de date de début invalide:", e);
        }
      }
      
      if (filters.endDate) {
        try {
          params.endDate = new Date(filters.endDate).toISOString();
        } catch (e) {
          console.error("Format de date de fin invalide:", e);
        }
      }
      
      console.log("Paramètres pour GlobalPerformance:", params);

      const response = await axios.get('https://localhost:7082/api/EvaluationHistory/global-performance', { params });

      if (response.data && Array.isArray(response.data)) {
        console.log("Données de performance reçues:", response.data);
        
        // Formater les données pour le graphique à barres avec une gestion robuste des valeurs nulles
        const formattedData = response.data
          .filter(item => item !== null) // Éliminer les entrées nulles
          .map(item => {
            // S'assurer que toutes les valeurs sont valides
            const year = item.year !== null && item.year !== undefined ? 
              (typeof item.year === 'string' ? item.year : `${item.year}`) : 'N/A';
            
            // Valider et formater le score moyen
            const averageScore = item.averageScore !== null && 
                               item.averageScore !== undefined && 
                               !isNaN(item.averageScore) ? 
              Number(Number(item.averageScore).toFixed(2)) : 0;
            
            return {
              year: year,
              averageScore: averageScore,
              evaluationCount: item.evaluationCount || 0,
              departmentName: item.department || 'Tous'
            };
          })
          .filter(item => item.year !== 'N/A'); // Éliminer les entrées avec année invalide
        
        console.log("Données formatées:", formattedData);
        setChartData(formattedData);
      } else {
        console.warn("Données de performance vides ou invalides");
        setChartData([]);
      }
    } catch (err) {
      console.error("Erreur lors du chargement des données:", err);
      setError(err.message || 'Erreur lors du chargement des données');
      setChartData([]);
    } finally {
      setLoading(false);
    }
  }, [filters.startDate, filters.endDate, filters.department, filters.evaluationType]);

  // Effet pour charger les données lorsque les filtres changent
  useEffect(() => {
    fetchGlobalPerformanceData();
    fetchKPIs();
  }, [fetchGlobalPerformanceData, fetchKPIs]);

  // Calculer le score moyen global de manière sécurisée
  const calculateAverageScore = () => {
    if (!chartData.length) return 0;
    
    const totalScore = chartData.reduce((sum, item) => sum + (item.averageScore || 0), 0);
    const average = totalScore / chartData.length;
    
    return average.toFixed(2);
  };

  // Calculer le total des évaluations
  const calculateTotalEvaluations = () => {
    if (!chartData.length) return 0;
    return chartData.reduce((sum, item) => sum + (parseInt(item.evaluationCount) || 0), 0);
  };

  // Trouver la meilleure année de manière sécurisée
  const getBestYear = () => {
    if (!chartData.length) return 'N/A';
    
    return chartData.reduce((best, item) => 
      (item.averageScore || 0) > (best.averageScore || 0) ? item : best, chartData[0]).year;
  };

  // Déterminer la tendance de manière sécurisée
  const getTrend = () => {
    if (chartData.length <= 1) return { text: 'N/A', isPositive: false };
    
    const firstScore = chartData[0].averageScore || 0;
    const lastScore = chartData[chartData.length - 1].averageScore || 0;
    const isPositive = lastScore > firstScore;
    
    return {
      text: isPositive ? '↑ En hausse' : '↓ En baisse',
      isPositive
    };
  };

  return (
    <div className="global-performance-graph">
      <div className="graph-header d-flex justify-content-between align-items-center mb-4">
        <h5 className="mb-0"><FaChartBar className="me-2" /> Performance Globale</h5>
      </div>

      {/* Section KPIs */}
      <div className="kpi-section mb-4">
        <div className="kpi-header">
          <h6><FaTachometerAlt className="me-2" /> Indicateurs de performance clés</h6>
        </div>
        <div className="kpi-cards">
          <div className="row g-3">
            <div className="col-md-4">
              <div className="kpi-card participation">
                <div className="kpi-icon">
                  <FaChartBar />
                </div>
                <div className="kpi-content">
                  <h3>{kpis.participationRate.toFixed(2)}%</h3>
                  <p>Taux de Participation</p>
                </div>
              </div>
            </div>
            <div className="col-md-4">
              <div className="kpi-card approval">
                <div className="kpi-icon">
                  <FaChartLine />
                </div>
                <div className="kpi-content">
                  <h3>{kpis.approvalRate.toFixed(2)}%</h3>
                  <p>Taux d&apos;Approbation</p>
                </div>
              </div>
            </div>
            <div className="col-md-4">
              <div className="kpi-card average">
                <div className="kpi-icon">
                  <FaTachometerAlt />
                </div>
                <div className="kpi-content">
                  <h3>{kpis.overallAverage.toFixed(2)}/5</h3>
                  <p>Score Moyen Global</p>
                </div>
              </div>
            </div>
            
          </div>
        </div>
      </div>

      {/* Graphique */}
      {loading ? (
        <div className="text-center p-5">
          <div className="spinner-border text-warning" role="status">
            <span className="visually-hidden">Chargement...</span>
          </div>
          <p className="mt-2">Chargement des données...</p>
        </div>
      ) : error ? (
        <div className="alert alert-danger">
          <p className="mb-0">{error}</p>
        </div>
      ) : chartData.length === 0 ? (
        <div className="alert alert-info">
          <p className="mb-0">Aucune donnée disponible pour la période sélectionnée.</p>
        </div>
      ) : (
        <div className="chart-container">
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="year" />
              <YAxis domain={[0, 5]} tickCount={6} />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Bar dataKey="averageScore" name="Score moyen" fill="#D4AC0D">
                <LabelList dataKey="averageScore" position="top" formatter={(value) => value.toFixed(2)} />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
      
      {/* Statistiques de performance - Sous le graphique */}
      {chartData.length > 0 && (
        <div className="performance-stats mt-4">
          <div className="stats-header">
            <h6><FaChartLine className="me-2" /> Évolution des performances</h6>
          </div>
          <div className="stats-cards">
            <div className="row g-3">
              <div className="col-md-3">
                <div className="stat-card average-score">
                  <div className="stat-value">{calculateAverageScore()}<span>/5</span></div>
                  <div className="stat-label">Score Moyen</div>
                </div>
              </div>
              <div className="col-md-3">
                <div className="stat-card total-evals">
                  <div className="stat-value">{calculateTotalEvaluations()}</div>
                  <div className="stat-label">Total Évaluations</div>
                </div>
              </div>
              <div className="col-md-3">
                <div className="stat-card best-year">
                  <div className="stat-value">{getBestYear()}</div>
                  <div className="stat-label">Meilleure Année</div>
                </div>
              </div>
              <div className="col-md-3">
                <div className={`stat-card ${getTrend().isPositive ? 'trend-up' : 'trend-down'}`}>
                  <div className="stat-value">{getTrend().text}</div>
                  <div className="stat-label">Tendance</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

GlobalPerformanceGraph.propTypes = {
  filters: PropTypes.shape({
    startDate: PropTypes.string,
    endDate: PropTypes.string,
    department: PropTypes.string,
    evaluationType: PropTypes.string
  })
};

export default GlobalPerformanceGraph;