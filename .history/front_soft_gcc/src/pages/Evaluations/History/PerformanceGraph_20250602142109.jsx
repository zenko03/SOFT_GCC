import { ResponsiveLine } from '@nivo/line';
import PropTypes from 'prop-types';
import '../../../assets/css/Evaluations/EvaluationHistory.css';

const PerformanceGraph = ({ performanceData }) => {
  console.log("PerformanceGraph reçoit les données:", performanceData);
  // Vérification des données
  if (!performanceData || performanceData.length === 0) {
    return (
      <div className="alert alert-info">
        <h5>Évolution des performances</h5>
        <p>Aucune donnée de performance disponible pour afficher le graphique.</p>
        <p>Assurez-vous que des évaluations ont été complétées et rechargez la page.</p>
      </div>
    );
  }

  // Traitement des données pour le graphique Nivo
  const chartData = [
    {
      id: "Performance",
      data: performanceData.map((item) => ({
        x: item.date || "N/A",
        y: item.score || 0
      }))
    }
  ];

  // Thème personnalisé avec la couleur jaune moutarde
  const theme = {
    background: 'transparent',
    textColor: '#333333',
    fontSize: 12,
    axis: {
      domain: { line: { stroke: '#777777', strokeWidth: 1 } },
      ticks: {
        line: { stroke: '#777777', strokeWidth: 1 },
        text: { fontSize: 12, fill: '#333333' }
      },
      legend: {
        text: {
          fontSize: 12,
          fill: '#333333',
          fontWeight: 'bold'
        }
      }
    },
    grid: { line: { stroke: '#dddddd', strokeWidth: 1 } }
  };

  return (
    <div className="performance-graph-container" style={{ marginBottom: '30px' }}>
      <h5 className="graph-title">Évolution des performances</h5>
      <div style={{ height: '400px', width: '100%', position: 'relative' }}>
        <ResponsiveLine
          data={chartData}
          margin={{ top: 50, right: 110, bottom: 50, left: 60 }}
          xScale={{ type: 'point' }}
          yScale={{ 
            type: 'linear', 
            min: 0, 
            max: 5,  // Supposant une note maximale de 5
            stacked: false
          }}
          curve="natural"
          axisBottom={{
            tickSize: 5,
            tickPadding: 5,
            tickRotation: -45,
            legend: 'Date d\'évaluation',
            legendOffset: 40,
            legendPosition: 'middle',
            truncateTickAt: 0
          }}
          axisLeft={{
            tickSize: 5,
            tickPadding: 5,
            tickRotation: 0,
            legend: 'Score',
            legendOffset: -40,
            legendPosition: 'middle',
            truncateTickAt: 0
          }}
          enableGridX={false}
          colors={['#D4AC0D']} // Couleur jaune moutarde
          pointSize={10}
          pointColor="#ffffff"
          pointBorderWidth={2}
          pointBorderColor="#D4AC0D"
          pointLabel="y"
          pointLabelYOffset={-12}
          enableArea={true}
          areaOpacity={0.15}
          useMesh={true}
          legends={[
            {
              anchor: 'top-right',
              direction: 'column',
              justify: false,
              translateX: 100,
              translateY: 0,
              itemsSpacing: 0,
              itemDirection: 'left-to-right',
              itemWidth: 80,
              itemHeight: 20,
              itemOpacity: 0.75,
              symbolSize: 12,
              symbolShape: 'circle',
              symbolBorderColor: 'rgba(0, 0, 0, .5)',
              itemTextColor: '#333333'
            }
          ]}
          theme={theme}
          animate={true}
        />
      </div>
    </div>
  );
};

PerformanceGraph.propTypes = {
  performanceData: PropTypes.arrayOf(
    PropTypes.shape({
      date: PropTypes.string,
      score: PropTypes.number
    })
  )
};

export default PerformanceGraph;
