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
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { FaChartBar, FaFilter, FaSync, FaUndo } from 'react-icons/fa';
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
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [department, setDepartment] = useState('');
  const [departments, setDepartments] = useState([]);
  const [evaluationType, setEvaluationType] = useState('');
  const [evaluationTypes, setEvaluationTypes] = useState(['Annuelle', 'Trimestrielle', 'Probatoire', 'Promotion']);
  const [showFilters, setShowFilters] = useState(false);

  // Récupérer la liste des départements
  const fetchDepartments = useCallback(async () => {
    try {
      const response = await axios.get('https://localhost:7082/api/EvaluationHistory/departments');
      if (response.data && Array.isArray(response.data)) {
        setDepartments(response.data);
      } else {
        console.warn("Format de données de départements invalide");
      }
    } catch (err) {
      console.error("Erreur lors du chargement des départements:", err);
    }
  }, []);

  // Récupérer les types d'évaluation
  const fetchEvaluationTypes = useCallback(async () => {
    try {
      const response = await axios.get('https://localhost:7082/api/EvaluationHistory/evaluation-types');
      if (Array.isArray(response.data) && response.data.length > 0) {
        setEvaluationTypes(response.data);
      }
    } catch (err) {
      console.error("Erreur lors du chargement des types d'évaluation:", err);
      // Conserver les valeurs par défaut en cas d'erreur
    }
  }, []);

  // Récupérer les données de performance avec gestion robuste des données nulles
  const fetchGlobalPerformanceData = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await axios.get('https://localhost:7082/api/EvaluationHistory/global-performance', {
        params: {
          startDate: startDate?.toISOString(),
          endDate: endDate?.toISOString(),
          department: department || undefined,
          evaluationType: evaluationType || undefined,
        },
      });

      if (response.data && Array.isArray(response.data)) {
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
        
        setChartData(formattedData);
      } else {
        setChartData([]);
      }
    } catch (err) {
      console.error("Erreur lors du chargement des données:", err);
      setError(err.message || 'Erreur lors du chargement des données');
      setChartData([]);
    } finally {
      setLoading(false);
    }
  }, [startDate, endDate, department, evaluationType]);

  // Effet pour initialiser les données
  useEffect(() => {
    fetchDepartments();
    fetchEvaluationTypes();
    fetchGlobalPerformanceData();
  }, [fetchDepartments, fetchEvaluationTypes, fetchGlobalPerformanceData]);

  // Effet pour mettre à jour les données quand les props changent
  useEffect(() => {
    if (filters.startDate !== undefined) setStartDate(filters.startDate ? new Date(filters.startDate) : null);
    if (filters.endDate !== undefined) setEndDate(filters.endDate ? new Date(filters.endDate) : null);
    if (filters.department !== undefined) setDepartment(filters.department || '');
    if (filters.evaluationType !== undefined) setEvaluationType(filters.evaluationType || '');
  }, [filters]);

  // Réinitialiser les filtres
  const resetFilters = () => {
    setStartDate(null);
    setEndDate(null);
    setDepartment('');
    setEvaluationType('');
    setTimeout(() => fetchGlobalPerformanceData(), 100);
  };

  // Calculer le score moyen global de manière sécurisée
  const calculateAverageScore = () => {
    if (!chartData.length) return 0;
    
    const totalScore = chartData.reduce((sum, item) => sum + (item.averageScore || 0), 0);
    const average = totalScore / chartData.length;
    
    return average.toFixed(2);
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
    <div className="global-performance-graph" style={{ backgroundColor: '#fff', padding: '20px', borderRadius: '8px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', marginBottom: '20px' }}>
      <div className="graph-header d-flex justify-content-between align-items-center mb-4">
        <h5 className="mb-0"><FaChartBar className="me-2" /> Performance Globale</h5>
        <button 
          className="btn btn-sm" 
          onClick={() => setShowFilters(!showFilters)}
          style={{ backgroundColor: showFilters ? '#D4AC0D' : '#f8f9fc', color: showFilters ? 'white' : '#333' }}
        >
          <FaFilter className="me-1" /> {showFilters ? 'Masquer filtres' : 'Filtres'}
        </button>
      </div>

      {showFilters && (
        <div className="filters-panel mb-4 p-3 border rounded">
          <div className="row g-3 align-items-end">
            <div className="col-md-3">
              <label htmlFor="startDate">Date de début</label>
              <DatePicker
                id="startDate"
                selected={startDate}
                onChange={date => setStartDate(date)}
                selectsStart
                startDate={startDate}
                endDate={endDate}
                dateFormat="dd/MM/yyyy"
                placeholderText="Date de début"
                className="form-control"
              />
            </div>
            <div className="col-md-3">
              <label htmlFor="endDate">Date de fin</label>
              <DatePicker
                id="endDate"
                selected={endDate}
                onChange={date => setEndDate(date)}
                selectsEnd
                startDate={startDate}
                endDate={endDate}
                dateFormat="dd/MM/yyyy"
                placeholderText="Date de fin"
                className="form-control"
              />
            </div>
            <div className="col-md-2">
              <label htmlFor="departmentSelect">Département</label>
              <select 
                id="departmentSelect"
                className="form-select"
                value={department} 
                onChange={e => setDepartment(e.target.value)}
              >
                <option value="">Tous les départements</option>
                {departments.map(dep => (
                  <option key={dep.departmentId || dep.id || Math.random()} value={dep.name || dep.departmentName}>
                    {dep.name || dep.departmentName}
                  </option>
                ))}
              </select>
            </div>
            <div className="col-md-2">
              <label htmlFor="evaluationTypeSelect">Type d&apos;évaluation</label>
              <select 
                id="evaluationTypeSelect"
                className="form-select"
                value={evaluationType} 
                onChange={e => setEvaluationType(e.target.value)}
              >
                <option value="">Tous les types</option>
                {evaluationTypes.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>
            <div className="col-md-2 d-flex gap-2">
              <button 
                className="btn btn-primary w-50" 
                onClick={fetchGlobalPerformanceData}
                disabled={loading}
                style={{ backgroundColor: '#D4AC0D', borderColor: '#D4AC0D' }}
              >
                <FaSync className={loading ? 'fa-spin me-1' : 'me-1'} /> Actualiser
              </button>
              <button 
                className="btn btn-outline-secondary w-50" 
                onClick={resetFilters}
              >
                <FaUndo className="me-1" /> Réinitialiser
              </button>
            </div>
          </div>
        </div>
      )}

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
      )}
      
      {chartData.length > 0 && (
        <div className="graph-summary mt-4">
          <div className="row g-3">
            <div className="col-md-3">
              <div className="card border-0 bg-light">
                <div className="card-body">
                  <h6 className="card-subtitle mb-2 text-muted">Score moyen global</h6>
                  <h5 className="card-title">
                    {calculateAverageScore()}
                    /5
                  </h5>
                </div>
              </div>
            </div>
            <div className="col-md-3">
              <div className="card border-0 bg-light">
                <div className="card-body">
                  <h6 className="card-subtitle mb-2 text-muted">Total évaluations</h6>
                  <h5 className="card-title">
                    {chartData.reduce((sum, item) => sum + (item.evaluationCount || 0), 0)}
                  </h5>
                </div>
              </div>
            </div>
            <div className="col-md-3">
              <div className="card border-0 bg-light">
                <div className="card-body">
                  <h6 className="card-subtitle mb-2 text-muted">Meilleure année</h6>
                  <h5 className="card-title">
                    {getBestYear()}
                  </h5>
                </div>
              </div>
            </div>
            <div className="col-md-3">
              <div className="card border-0 bg-light">
                <div className="card-body">
                  <h6 className="card-subtitle mb-2 text-muted">Tendance</h6>
                  <h5 className="card-title" style={{ 
                    color: getTrend().isPositive ? '#4caf50' : '#e74c3c'
                  }}>
                    {getTrend().text}
                  </h5>
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