import React from 'react';
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js';

// Enregistrer les composants Chart.js
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

const PerformanceGraph = ({ performanceData }) => {
  // Vérification des données
  if (!performanceData || performanceData.length === 0) {
    return <p>Aucune donnée de performance disponible pour afficher le graphique.</p>;
  }

  // Traitement des données pour le graphique
  const data = {
    labels: performanceData.map((item) => item.evaluationDate), // Dates des évaluations
    datasets: [
      {
        label: 'Score Global',
        data: performanceData.map((item) => item.score), // Notes ou scores
        fill: false,
        borderColor: 'rgba(75, 192, 192, 1)', // Couleur de la ligne
        tension: 0.3, // Courbure de la ligne
        pointBackgroundColor: 'rgba(75, 192, 192, 1)', // Couleur des points
        pointBorderColor: '#fff', // Bordure des points
        pointRadius: 5, // Taille des points
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        display: true,
        position: 'top',
      },
      tooltip: {
        enabled: true,
      },
    },
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
        max: 5, // Supposant une note maximale de 5
      },
    },
  };

  return (
    <div className="graph-section">
      <h5>Graphique d'Évolution des Performances</h5>
      <Line data={data} options={options} className="performance-graph" />
    </div>
  );
};

export default PerformanceGraph;
