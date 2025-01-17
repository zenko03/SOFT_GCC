import React, { useEffect, useState } from 'react';
import { Line } from 'react-chartjs-2';
import axios from 'axios';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

const GlobalPerformanceGraph = () => {
  const [chartData, setChartData] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [department, setDepartment] = useState('');
  const [evaluationType, setEvaluationType] = useState('');

  useEffect(() => {
    const fetchGlobalPerformanceData = async () => {
      setLoading(true);
      try {
        const response = await axios.get('https://localhost:7082/api/EvaluationHistory/global-performance', {
          params: {
            startDate: startDate ? startDate.toISOString() : undefined,
            endDate: endDate ? endDate.toISOString() : undefined,
            department,
            evaluationType,
          },
        });

        const data = response.data;
        const labels = data.map(item => item.year); // Assumant que la réponse contient des années
        const scores = data.map(item => item.averageScore); // Assumant que la réponse contient un score moyen

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

    fetchGlobalPerformanceData();
  }, [startDate, endDate, department, evaluationType]);

  if (loading) {
    return <div className="text-center">Chargement du graphique...</div>;
  }

  if (error) {
    return <div className="alert alert-danger">{error}</div>;
  }

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
      <Line data={chartData} options={{ responsive: true, maintainAspectRatio: false }} />
    </div>
  );
};

export default GlobalPerformanceGraph;
