import React, { useEffect, useState, useCallback } from 'react';
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
import { FaChartBar, FaFilter, FaSync } from 'react-icons/fa';
import '../../../assets/css/Evaluations/GlobalPerformance.css'; // Vous devrez créer ce fichier CSS

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
            <span className="tooltip-label">Nombre d'évaluations:</span>
            <span>{payload[0].payload.evaluationCount}</span>
          </p>
        )}
      </div>
    );
  }
  return null;
};

const GlobalPerformanceGraph = () => {
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
      setDepartments(response.data);
    } catch (err) {
      console.error("Erreur lors du chargement des départements:", err);
    }
  }, []);

  // Récupérer les données de performance
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
        // Transformer les données pour un meilleur affichage
        const formattedData = response.data.map(item => ({
          ...item,
          year: typeof item.year === 'string' ? item.year : `${item.year}`,
          averageScore: Number(item.averageScore.toFixed(2))
        }));
        setChartData(formattedData);
      } else {
        throw new Error('Format de données invalide');
      }
    } catch (err) {
      setError(err.message || 'Erreur lors du chargement des données');
    } finally {
      setLoading(false);
    }
  }, [startDate, endDate, department, evaluationType]);

  useEffect(() => {
    fetchDepartments();
  }, [fetchDepartments]);

  useEffect(() => {
    fetchGlobalPerformanceData();
  }, [fetchGlobalPerformanceData]);

  return (
    <div className="global-performance-graph">
      <h2><FaChartBar /> Performance Globale</h2>
      <div className="filters">
        <button onClick={() => setShowFilters(!showFilters)}>
          <FaFilter /> {showFilters ? 'Masquer les filtres' : 'Afficher les filtres'}
        </button>
        {showFilters && (
          <div className="filter-options">
            <DatePicker
              selected={startDate}
              onChange={date => setStartDate(date)}
              selectsStart
              startDate={startDate}
              endDate={endDate}
              placeholderText="Date de début"
            />
            <DatePicker
              selected={endDate}
              onChange={date => setEndDate(date)}
              selectsEnd
              startDate={startDate}
              endDate={endDate}
              placeholderText="Date de fin"
            />
            <select value={department} onChange={e => setDepartment(e.target.value)}>
              <option value="">Tous les départements</option>
              {departments.map(dep => (
                <option key={dep.id} value={dep.name}>{dep.name}</option>
              ))}
            </select>
            <select value={evaluationType} onChange={e => setEvaluationType(e.target.value)}>
              <option value="">Tous les types d'évaluation</option>
              {evaluationTypes.map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
            <button onClick={fetchGlobalPerformanceData}><FaSync /> Actualiser</button>
          </div>
        )}
      </div>
      {loading ? (
        <p>Chargement des données...</p>
      ) : error ? (
        <p className="error-message">{error}</p>
      ) : (
        <ResponsiveContainer width="100%" height={400}>
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="year" />
            <YAxis />
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            <Bar dataKey="averageScore" fill="#4caf50">
              <LabelList dataKey="averageScore" position="top" />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      )}
    </div>
  );
};

export default GlobalPerformanceGraph;