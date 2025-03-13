import React, { useEffect, useState, useCallback } from 'react';
import { LineChart, Line, CartesianGrid, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import axios from 'axios';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

const GlobalPerformanceGraph = () => {
  const [chartData, setChartData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [department, setDepartment] = useState('');
  const [evaluationType, setEvaluationType] = useState('');

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
        setChartData(response.data);
      } else {
        throw new Error('Données reçues non valides.');
      }
    } catch (err) {
      setError(err.message || 'Erreur lors du chargement des données.');
    } finally {
      setLoading(false);
    }
  }, [startDate, endDate, department, evaluationType]);

  useEffect(() => {
    fetchGlobalPerformanceData();
  }, [fetchGlobalPerformanceData]);

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
        <ResponsiveContainer width="100%" height={400}>
          <LineChart data={chartData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
            <Line type="monotone" dataKey="averageScore" stroke="#8884d8" />
            <CartesianGrid stroke="#ccc" />
            <XAxis dataKey="year" />
            <YAxis />
            <Tooltip />
          </LineChart>
        </ResponsiveContainer>
      )}
    </div>
  );
};

export default GlobalPerformanceGraph;
