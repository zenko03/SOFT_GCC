import React from 'react';
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js';

// Enregistrer les composants Chart.js
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

const PerformanceGraph = ({ performanceData }) => {
  // Traitement des données pour le graphique
  const data = {
    labels: performanceData.map((item) => item.evaluationDate), // Dates des évaluations
    datasets: [
      {
        label: 'Score Global',
        data: performanceData.map((item) => item.score), // Notes ou scores
        fill: false,
        borderColor: 'rgba(75, 192, 192, 1)', // Couleur de la ligne
        tension: 0.1,
      },
    ],
  };

  const options = {
    responsive: true,
    scales: {
      x: {
        title: {
          display: true,
          text: 'Date d\'Évaluation',
        },
      },
      y: {
        title: {
          display: true,
          text: 'Score',
        },
        min: 0,
        max: 5, // Assumer que la note maximale est 5
      },
    },
  };

  return (
    <div>
      <h5>Graphique d'Évolution des Performances</h5>
      <Line data={data} options={options} />
    </div>
  );
};

export default PerformanceGraph;
