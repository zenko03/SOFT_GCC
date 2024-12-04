import React, { useState, useEffect } from 'react';
//import { Line } from 'react-chartjs-2';
//import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js';

// Enregistrement des composants nécessaires pour Chart.js
//ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

const GlobalPerformanceGraph = ({ data }) => {
  /*const [filters, setFilters] = useState({
    year: new Date().getFullYear(), // Filtrer par année
    position: '', // Filtrer par poste
  });

  const [filteredData, setFilteredData] = useState([]);

  useEffect(() => {
    // Appliquer les filtres sur les données
    const filterData = () => {
      return data
        .filter((item) => !filters.year || new Date(item.evaluationDate).getFullYear() === parseInt(filters.year))
        .filter((item) => !filters.position || item.position.toLowerCase().includes(filters.position.toLowerCase()));
    };
    setFilteredData(filterData());
  }, [filters, data]);

  // Calculer les moyennes pour chaque période
  const calculateAverages = () => {
    const averages = {};
    filteredData.forEach((item) => {
      const month = new Date(item.evaluationDate).toLocaleString('default', { month: 'short' });
      if (!averages[month]) {
        averages[month] = { total: 0, count: 0 };
      }
      averages[month].total += item.score;
      averages[month].count += 1;
    });

    return Object.keys(averages).map((month) => ({
      month,
      average: averages[month].total / averages[month].count,
    }));
  };

  const averages = calculateAverages();

  // Préparer les données pour le graphique
  const chartData = {
    labels: averages.map((item) => item.month),
    datasets: [
      {
        label: 'Score Global Moyen',
        data: averages.map((item) => item.average),
        borderColor: 'rgba(75, 192, 192, 1)',
        backgroundColor: 'rgba(75, 192, 192, 0.2)',
        tension: 0.1,
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      tooltip: {
        callbacks: {
          label: (context) => `Score moyen : ${context.raw.toFixed(2)}`,
        },
      },
    },
    scales: {
      x: {
        title: { display: true, text: 'Mois' },
      },
      y: {
        title: { display: true, text: 'Score Moyen' },
        min: 0,
        max: 5,
      },
    },
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters({ ...filters, [name]: value });
  };
*/
  return (
    <div>

      {/* Filtres */}
      {/*<div className="filters">
        <select name="year" value={filters.year} onChange={handleFilterChange}>
          <option value="">Toutes les années</option>
          {Array.from(new Set(data.map((item) => new Date(item.evaluationDate).getFullYear()))).map((year) => (
            <option key={year} value={year}>
              {year}
            </option>
          ))}
        </select>

        <input
          type="text"
          name="position"
          placeholder="Filtrer par poste"
          value={filters.position}
          onChange={handleFilterChange}
        />
      </div>

      {/* Graphique */}
      {/*<div className="graph-container">
        <Line data={chartData} options={options} />
      </div>

      {/* Tendances */}
      {/*<div className="trend">
        {averages.length > 1 ? (
          averages[averages.length - 1].average > averages[averages.length - 2].average ? (
            <span className="positive-trend">↑ Tendances positives</span>
          ) : (
            <span className="negative-trend">↓ Tendances négatives</span>
          )
        ) : (
          <span>Aucune tendance disponible</span>
        )}
      </div>*/}
    </div>
  );
};

export default GlobalPerformanceGraph;
