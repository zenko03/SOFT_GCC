import React, { useEffect, useState } from 'react';
import { Line } from 'react-chartjs-2';
import axios from 'axios';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

const GlobalPerformanceGraph = () => {
  const [chartData, setChartData] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [department, setDepartment] = useState('');
  const [evaluationType, setEvaluationType] = useState('');

  const fetchGlobalPerformanceData = async () => {
    setLoading(true);
    try {
      const response = await axios.get('https://localhost:7082/api/EvaluationHistory/global-performance', {
        params: {
          startDate: startDate ? startDate.toISOString() : undefined,
          endDate: endDate ? endDate.toISOString() : undefined,
          department: department || undefined,
          evaluationType: evaluationType || undefined,
        },
      });

      const data = Array.isArray(response.data) ? response.data : []; // Vérifiez si la réponse est un tableau

      const labels = data.length > 0 ? data.map(item => item.year || 'Année Inconnue') : [];
      const scores = data.length > 0 ? data.map(item => item.averageScore || 0) : [];

      setChartData({
        labels,
        datasets: [
          {
            label: 'Score Moyen Global',
            data: scores,
            backgroundColor: 'rgba(75,192,192,0.2)',
            borderColor: 'rgba(75,192,192,1)',
            borderWidth: 2,
            fill: true,
          },
        ],
      });
      setError(null);
    } catch (err) {
      setError('Erreur lors du chargement des données de performance globale.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      fetchGlobalPerformanceData();
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [startDate, endDate, department, evaluationType]);

  return (
    <div>
      <h3>Évolution des Scores Globaux</h3>
      <div className="filters">
        <div>
          <label>Début:</label>
          <DatePicker
            selected={startDate}
            onChange={date => setStartDate(date)}
            dateFormat="dd/MM/yyyy"
            placeholderText="Sélectionnez la date de début"
          />
        </div>
        <div>
          <label>Fin:</label>
          <DatePicker
            selected={endDate}
            onChange={date => setEndDate(date)}
            dateFormat="dd/MM/yyyy"
            placeholderText="Sélectionnez la date de fin"
          />
        </div>
        <div>
          <label>Département:</label>
          <input
            type="text"
            value={department}
            onChange={e => setDepartment(e.target.value)}
            placeholder="Filtrer par département"
          />
        </div>
        <div>
          <label>Type d'Évaluation:</label>
          <input
            type="text"
            value={evaluationType}
            onChange={e => setEvaluationType(e.target.value)}
            placeholder="Filtrer par type d'évaluation"
          />
        </div>
      </div>
      {loading ? (
        <div className="text-center">Chargement du graphique...</div>
      ) : error ? (
        <div className="alert alert-danger">{error}</div>
      ) : (
        <Line data={chartData} options={{ responsive: true, maintainAspectRatio: false }} />
      )}
    </div>
  );
};

export default GlobalPerformanceGraph;
