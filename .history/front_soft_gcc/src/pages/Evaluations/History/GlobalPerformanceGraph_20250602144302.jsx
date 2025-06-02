import { useEffect, useState, useCallback } from 'react';
import { ResponsiveBar } from '@nivo/bar';
import { ResponsiveLine } from '@nivo/line';
import { ResponsivePie } from '@nivo/pie';
import { FaChartBar, FaFilter, FaSync, FaChartLine, FaChartPie, FaTimes } from 'react-icons/fa';
import axios from 'axios';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import PropTypes from 'prop-types';
import '../../../assets/css/Evaluations/GlobalPerformance.css';

const GlobalPerformanceGraph = ({ filters = {} }) => {
  const [chartData, setChartData] = useState([]);
  const [lineChartData, setLineChartData] = useState([]);
  const [pieChartData, setPieChartData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [startDate, setStartDate] = useState(filters.startDate ? new Date(filters.startDate) : null);
  const [endDate, setEndDate] = useState(filters.endDate ? new Date(filters.endDate) : null);
  const [department, setDepartment] = useState(filters.department || '');
  const [departments, setDepartments] = useState([]);
  const [evaluationType, setEvaluationType] = useState(filters.evaluationType || '');
  const [evaluationTypes] = useState(['Annuelle', 'Trimestrielle', 'Probatoire', 'Promotion']);
  const [showFilters, setShowFilters] = useState(false);
  const [chartType, setChartType] = useState('bar'); // bar, line, pie
  const [showLegend, setShowLegend] = useState(true);

  // Palettes de couleurs professionnelles
  const colorSchemes = {
    bar: ['#D4AC0D', '#F39C12', '#F1C40F', '#FFC300', '#FFD700'],
    line: ['#D4AC0D', '#F39C12', '#F1C40F', '#FFC300', '#FFD700'],
    pie: ['#D4AC0D', '#F39C12', '#F1C40F', '#FFC300', '#FFD700']
  };

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
      console.log('Tentative de récupération des données de performance globale...');
      console.log('Paramètres:', {
        startDate: startDate?.toISOString(),
        endDate: endDate?.toISOString(),
        department: department || undefined,
        evaluationType: evaluationType || undefined,
      });
      
      const response = await axios.get('https://localhost:7082/api/EvaluationHistory/global-performance', {
        params: {
          startDate: startDate?.toISOString(),
          endDate: endDate?.toISOString(),
          department: department || undefined,
          evaluationType: evaluationType || undefined,
        },
      });

      console.log('Données reçues:', response.data);

      if (response.data && Array.isArray(response.data)) {
        // Formater les données pour le graphique en barres
        const formattedData = response.data.map(item => ({
          year: typeof item.year === 'string' ? item.year : `${item.year}`,
          averageScore: Number(item.averageScore.toFixed(2)),
          evaluationCount: item.evaluationCount || 0,
          departmentName: item.department || 'Tous'
        }));
        console.log('Données formatées pour les barres:', formattedData);
        setChartData(formattedData);

        // Formater les données pour le graphique en ligne
        const lineData = [
          {
            id: "Score moyen",
            data: response.data.map(item => ({
              x: typeof item.year === 'string' ? item.year : `${item.year}`,
              y: Number(item.averageScore.toFixed(2))
            }))
          }
        ];
        console.log('Données formatées pour les lignes:', lineData);
        setLineChartData(lineData);

        // Formater les données pour le graphique en camembert
        if (formattedData.length) {
          const pieData = formattedData.map(item => ({
            id: item.year,
            label: item.year,
            value: item.evaluationCount
          }));
          console.log('Données formatées pour le camembert:', pieData);
          setPieChartData(pieData);
        } else {
          console.log('Pas de données pour le camembert, utilisation de données par défaut');
          setPieChartData([{ id: "Aucune donnée", label: "Aucune donnée", value: 1 }]);
        }
      } else {
        throw new Error('Format de données invalide');
      }
    } catch (err) {
      console.error("Erreur lors du chargement des données:", err);
      setError(err.message || 'Erreur lors du chargement des données');
      
      // Initialiser avec des données vides mais valides pour éviter des erreurs d'affichage
      setChartData([]);
      setLineChartData([{ id: "Score moyen", data: [] }]);
      setPieChartData([{ id: "Aucune donnée", label: "Aucune donnée", value: 1 }]);
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
    // setYearFilter(new Date().getFullYear()); // yearFilter n'est plus utilisé
    // Rafraîchir les données après réinitialisation
    setTimeout(() => fetchGlobalPerformanceData(), 100);
  };

  // Thème personnalisé pour Nivo
  const nivoTheme = {
    background: 'transparent',
    textColor: '#333333',
    fontSize: 12,
    axis: {
      domain: {
        line: {
          stroke: '#777777',
          strokeWidth: 1
        }
      },
      ticks: {
        line: {
          stroke: '#777777',
          strokeWidth: 1
        },
        text: {
          fill: '#333333',
          fontSize: 12
        }
      },
      legend: {
        text: {
          fill: '#333333',
          fontSize: 14,
          fontWeight: 600
        }
      }
    },
    grid: {
      line: {
        stroke: '#dddddd',
        strokeWidth: 1
      }
    },
    legends: {
      text: {
        fill: '#333333',
        fontSize: 12
      }
    },
    tooltip: {
      container: {
        background: 'white',
        color: '#333',
        fontSize: 12,
        borderRadius: 3,
        boxShadow: '0 3px 9px rgba(0, 0, 0, 0.15)'
      }
    }
  };

  // Légende dynamique
  const getChartLegend = () => {
    switch(chartType) {
      case 'bar':
        return { translateX: 120, translateY: 0, itemWidth: 100, itemHeight: 20, symbolSize: 12 };
      case 'line':
        return { translateX: 130, translateY: 0, itemsSpacing: 5, itemDirection: 'left-to-right' };
      case 'pie':
        return { translateX: 0, translateY: 56, itemWidth: 100, itemHeight: 18, symbolSize: 12 };
      default:
        return {};
    }
  };

  // Rendu conditionnel du graphique selon le type sélectionné
  const renderChart = () => {
    if (loading) {
      return <div className="chart-loading">Chargement des données...</div>;
    }
    
    if (error) {
      return <div className="chart-error">{error}</div>;
    }

    if (!chartData.length) {
      return <div className="no-data">Aucune donnée disponible pour la période sélectionnée</div>;
    }

    switch(chartType) {
      case 'bar':
        return (
          <div className="chart-container" style={{ height: '400px', width: '100%' }}>
            <ResponsiveBar
              data={chartData}
              keys={['averageScore']}
              indexBy="year"
              margin={{ top: 50, right: 130, bottom: 70, left: 60 }}
              padding={0.3}
              colors={colorSchemes.bar}
              theme={nivoTheme}
              valueScale={{ type: 'linear' }}
              indexScale={{ type: 'band', round: true }}
              borderRadius={4}
              borderWidth={1}
              borderColor={{
                from: 'color',
                modifiers: [['darker', 1.6]]
              }}
              axisBottom={{
                tickSize: 5,
                tickPadding: 5,
                tickRotation: 0,
                legend: 'Année',
                legendPosition: 'middle',
                legendOffset: 45,
              }}
              axisLeft={{
                tickSize: 5,
                tickPadding: 5,
                tickRotation: 0,
                legend: 'Score Moyen',
                legendPosition: 'middle',
                legendOffset: -50,
              }}
              labelSkipWidth={12}
              labelSkipHeight={12}
              enableLabel={true}
              labelTextColor={{
                from: 'color',
                modifiers: [['darker', 2]]
              }}
              legends={showLegend ? [
                {
                  dataFrom: 'keys',
                  anchor: 'bottom-right',
                  direction: 'column',
                  ...getChartLegend()
                }
              ] : []}
              animate={true}
              motionStiffness={90}
              motionDamping={15}
              tooltip={({ value, color, indexValue }) => (
                <div style={{
                  background: 'white',
                  padding: '10px',
                  border: '1px solid #ccc',
                  borderRadius: '4px',
                  boxShadow: '0 2px 6px rgba(0,0,0,0.15)'
                }}>
                  <strong>Année: {indexValue}</strong>
                  <div>
                    <span style={{ display: 'inline-block', width: '12px', height: '12px', backgroundColor: color, marginRight: '5px' }}></span>
                    Score moyen: <strong>{value}</strong>
                  </div>
                  <div>
                    Nombre d&apos;évaluations: <strong>{chartData.find(d => d.year === indexValue)?.evaluationCount || 'N/A'}</strong>
                  </div>
                </div>
              )}
            />
          </div>
        );
      
      case 'line':
        return (
          <div className="chart-container" style={{ height: '400px', width: '100%' }}>
            <ResponsiveLine
              data={lineChartData}
              margin={{ top: 50, right: 110, bottom: 70, left: 60 }}
              xScale={{ type: 'point' }}
              yScale={{ 
                type: 'linear', 
                min: 'auto', 
                max: 'auto', 
                stacked: false, 
                reverse: false 
              }}
              colors={colorSchemes.line}
              theme={nivoTheme}
              axisBottom={{
                tickSize: 5,
                tickPadding: 5,
                tickRotation: 0,
                legend: 'Année',
                legendOffset: 45,
                legendPosition: 'middle'
              }}
              axisLeft={{
                tickSize: 5,
                tickPadding: 5,
                tickRotation: 0,
                legend: 'Score Moyen',
                legendOffset: -50,
                legendPosition: 'middle'
              }}
              pointSize={10}
              pointColor={{ theme: 'background' }}
              pointBorderWidth={2}
              pointBorderColor={{ from: 'serieColor' }}
              pointLabel="y"
              pointLabelYOffset={-12}
              useMesh={true}
              enableSlices="x"
              legends={showLegend ? [
                {
                  anchor: 'bottom-right',
                  direction: 'column',
                  justify: false,
                  translateX: 100,
                  translateY: 0,
                  itemsSpacing: 0,
                  itemDirection: 'left-to-right',
                  itemWidth: 80,
                  itemHeight: 20,
                  symbolSize: 12,
                  symbolShape: 'circle',
                  symbolBorderColor: 'rgba(0, 0, 0, .5)',
                }
              ] : []}
              lineWidth={3}
              enableArea={true}
              areaOpacity={0.1}
            />
          </div>
        );
      
      case 'pie':
        return (
          <div className="chart-container" style={{ height: '400px', width: '100%' }}>
            <ResponsivePie
              data={pieChartData}
              margin={{ top: 40, right: 80, bottom: 80, left: 80 }}
              innerRadius={0.5}
              padAngle={0.6}
              cornerRadius={2}
              activeOuterRadiusOffset={8}
              colors={colorSchemes.pie}
              theme={nivoTheme}
              borderWidth={1}
              borderColor={{ from: 'color', modifiers: [['darker', 0.2]] }}
              arcLinkLabelsSkipAngle={10}
              arcLinkLabelsTextColor="#333333"
              arcLinkLabelsThickness={2}
              arcLinkLabelsColor={{ from: 'color' }}
              arcLabelsSkipAngle={10}
              arcLabelsTextColor={{ from: 'color', modifiers: [['darker', 2]] }}
              legends={showLegend ? [
                {
                  anchor: 'bottom',
                  direction: 'row',
                  translateY: 56,
                  itemWidth: 100,
                  itemHeight: 18,
                  symbolShape: 'circle'
                }
              ] : []}
            />
          </div>
        );
      
      default:
        return <div>Sélectionnez un type de graphique</div>;
    }
  };

  return (
    <div className="global-performance-graph-container" style={{ backgroundColor: '#ffffff', padding: '20px', borderRadius: '8px', boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)', marginBottom: '30px' }}>
      <div className="graph-header">
        <h3><FaChartBar /> Performance Globale</h3>
        <div className="chart-controls">
          <div className="chart-type-selector">
            <button
              className={chartType === 'bar' ? 'active' : ''}
              onClick={() => setChartType('bar')}
              title="Graphique en barres"
              style={{
                backgroundColor: chartType === 'bar' ? '#D4AC0D' : '#f8f9fc',
                color: chartType === 'bar' ? '#fff' : '#333',
                border: 'none',
                padding: '6px 10px',
                borderRadius: '4px',
                margin: '0 2px',
                cursor: 'pointer'
              }}
            >
              <FaChartBar />
            </button>
            <button
              className={chartType === 'line' ? 'active' : ''}
              onClick={() => setChartType('line')}
              title="Graphique en ligne"
              style={{
                backgroundColor: chartType === 'line' ? '#D4AC0D' : '#f8f9fc',
                color: chartType === 'line' ? '#fff' : '#333',
                border: 'none',
                padding: '6px 10px',
                borderRadius: '4px',
                margin: '0 2px',
                cursor: 'pointer'
              }}
            >
              <FaChartLine />
            </button>
            <button
              className={chartType === 'pie' ? 'active' : ''}
              onClick={() => setChartType('pie')}
              title="Graphique en camembert"
              style={{
                backgroundColor: chartType === 'pie' ? '#D4AC0D' : '#f8f9fc',
                color: chartType === 'pie' ? '#fff' : '#333',
                border: 'none',
                padding: '6px 10px',
                borderRadius: '4px',
                margin: '0 2px',
                cursor: 'pointer'
              }}
            >
              <FaChartPie />
            </button>
          </div>
          <button
            onClick={() => setShowLegend(!showLegend)}
            className={`legend-toggle ${showLegend ? 'active' : ''}`}
            title={showLegend ? 'Masquer la légende' : 'Afficher la légende'}
            style={{
              backgroundColor: showLegend ? '#D4AC0D' : '#f8f9fc',
              color: showLegend ? '#fff' : '#333',
              border: 'none',
              padding: '6px 10px',
              borderRadius: '4px',
              margin: '0 5px',
              cursor: 'pointer'
            }}
          >
            Légende
          </button>
          <button 
            onClick={() => setShowFilters(!showFilters)}
            className={`filter-toggle ${showFilters ? 'active' : ''}`}
            title={showFilters ? 'Masquer les filtres' : 'Afficher les filtres'}
            style={{
              backgroundColor: showFilters ? '#D4AC0D' : '#f8f9fc',
              color: showFilters ? '#fff' : '#333',
              border: 'none',
              padding: '6px 10px',
              borderRadius: '4px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '4px'
            }}
          >
            <FaFilter /> {showFilters ? 'Masquer filtres' : 'Filtres'}
          </button>
        </div>
      </div>

      {showFilters && (
        <div className="filters-panel">
          <div className="filters-form">
            <div className="filter-group">
              <label htmlFor="startDate">Du</label>
              <DatePicker
                id="startDate"
                selected={startDate}
                onChange={date => setStartDate(date)}
                selectsStart
                startDate={startDate}
                endDate={endDate}
                dateFormat="dd/MM/yyyy"
                placeholderText="Date de début"
                className="date-picker"
              />
            </div>
            <div className="filter-group">
              <label htmlFor="endDate">Au</label>
              <DatePicker
                id="endDate"
                selected={endDate}
                onChange={date => setEndDate(date)}
                selectsEnd
                startDate={startDate}
                endDate={endDate}
                dateFormat="dd/MM/yyyy"
                placeholderText="Date de fin"
                className="date-picker"
              />
            </div>
            <div className="filter-group">
              <label htmlFor="departmentSelect">Département</label>
              <select 
                id="departmentSelect"
                value={department} 
                onChange={e => setDepartment(e.target.value)}
                className="select-input"
              >
                <option value="">Tous les départements</option>
                {departments.map(dep => (
                  <option key={dep.departmentId || dep.id} value={dep.name || dep.departmentName}>
                    {dep.name || dep.departmentName}
                  </option>
                ))}
              </select>
            </div>
            <div className="filter-group">
              <label htmlFor="evaluationTypeSelect">Type d&apos;évaluation</label>
              <select 
                id="evaluationTypeSelect"
                value={evaluationType} 
                onChange={e => setEvaluationType(e.target.value)}
                className="select-input"
              >
                <option value="">Tous les types</option>
                {evaluationTypes.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>
            <div className="filter-actions">
              <button 
                onClick={fetchGlobalPerformanceData}
                className="btn-refresh"
                title="Actualiser les données"
              >
                <FaSync className={loading ? 'fa-spin' : ''} /> Actualiser
              </button>
              <button 
                onClick={resetFilters}
                className="btn-reset"
                title="Réinitialiser les filtres"
              >
                <FaTimes /> Réinitialiser
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="chart-wrapper" style={{ marginTop: '20px', marginBottom: '20px' }}>
        {renderChart()}
      </div>
      
      {chartType === 'bar' && chartData.length > 0 && (
        <div className="chart-summary">
          <div className="summary-card">
            <h4>Moyenne globale</h4>
            <p className="summary-value">
              {(chartData.reduce((sum, item) => sum + item.averageScore, 0) / chartData.length).toFixed(2)}
            </p>
          </div>
          <div className="summary-card">
            <h4>Total des évaluations</h4>
            <p className="summary-value">
              {chartData.reduce((sum, item) => sum + item.evaluationCount, 0)}
            </p>
          </div>
          <div className="summary-card">
            <h4>Meilleure année</h4>
            <p className="summary-value">
              {chartData.reduce((best, item) => item.averageScore > best.averageScore ? item : best, { year: 'N/A', averageScore: 0 }).year}
            </p>
          </div>
          <div className="summary-card">
            <h4>Progression sur {chartData.length > 1 ? chartData.length - 1 : 0} ans</h4>
            <p className="summary-value" style={{ 
              color: chartData.length > 1 ? 
                (chartData[chartData.length - 1].averageScore > chartData[0].averageScore ? '#4caf50' : '#e74c3c') : '#D4AC0D' 
            }}>
              {chartData.length > 1 ? 
                `${((chartData[chartData.length - 1].averageScore - chartData[0].averageScore) / chartData[0].averageScore * 100).toFixed(2)}%` :
                'N/A'}
            </p>
          </div>
        </div>
      )}

      {chartType === 'pie' && pieChartData.length > 0 && (
        <div className="chart-summary">
          <div className="summary-card">
            <h4>Période la plus active</h4>
            <p className="summary-value">
              {pieChartData.reduce((max, item) => item.value > max.value ? item : max, { id: 'N/A', value: 0 }).id}
            </p>
          </div>
          <div className="summary-card">
            <h4>Distribution des évaluations</h4>
            <p className="summary-value">
              {pieChartData.length} périodes
            </p>
          </div>
          <div className="summary-card">
            <h4>Total des évaluations</h4>
            <p className="summary-value">
              {pieChartData.reduce((sum, item) => sum + item.value, 0)}
            </p>
          </div>
          <div className="summary-card">
            <h4>Répartition</h4>
            <p className="summary-value">
              {(pieChartData.reduce((sum, item) => sum + Math.pow(item.value / pieChartData.reduce((s, i) => s + i.value, 0), 2), 0) * 100).toFixed(2)}% d'équilibre
            </p>
          </div>
        </div>
      )}

      {chartType === 'line' && lineChartData[0]?.data.length > 0 && (
        <div className="chart-summary">
          <div className="summary-card">
            <h4>Tendance</h4>
            <p className="summary-value" style={{ 
              color: lineChartData[0].data.length > 1 ? 
                (lineChartData[0].data[lineChartData[0].data.length - 1].y > lineChartData[0].data[0].y ? '#4caf50' : '#e74c3c') : '#D4AC0D' 
            }}>
              {lineChartData[0].data.length > 1 ? 
                (lineChartData[0].data[lineChartData[0].data.length - 1].y > lineChartData[0].data[0].y ? 'En hausse' : 'En baisse') : 
                'Stable'}
            </p>
          </div>
          <div className="summary-card">
            <h4>Score maximal</h4>
            <p className="summary-value">
              {lineChartData[0].data.reduce((max, point) => point.y > max ? point.y : max, 0).toFixed(2)}
            </p>
          </div>
          <div className="summary-card">
            <h4>Score minimal</h4>
            <p className="summary-value">
              {lineChartData[0].data.reduce((min, point) => point.y < min ? point.y : min, 5).toFixed(2)}
            </p>
          </div>
          <div className="summary-card">
            <h4>Écart-type</h4>
            <p className="summary-value">
              {(() => {
                const values = lineChartData[0].data.map(point => point.y);
                const avg = values.reduce((sum, val) => sum + val, 0) / values.length;
                const squareDiffs = values.map(value => Math.pow(value - avg, 2));
                const variance = squareDiffs.reduce((sum, val) => sum + val, 0) / values.length;
                return Math.sqrt(variance).toFixed(2);
              })()}
            </p>
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