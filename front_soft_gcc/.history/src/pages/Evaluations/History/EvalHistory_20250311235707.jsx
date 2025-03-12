import React, { useState, useEffect, useCallback } from 'react';
import Template from '../../Template';
import PerformanceGraph from './PerformanceGraph';
import GlobalPerformanceGraph from './GlobalPerformanceGraph';
import '../../../assets/css/Evaluations/EvaluationHistory.css';
import axios from 'axios';
import EvaluationDetailsModal from './EvaluationDetailsModal';
import { CSVLink } from 'react-csv';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { FaFileExcel, FaFilePdf, FaFileCsv, FaSearch, FaFilter, FaChartBar, FaAngleLeft, FaAngleRight, FaSync } from 'react-icons/fa';

const API_BASE_URL = 'https://localhost:7082/api/EvaluationHistory';

const LoadingBar = () => (
  <div style={{
    width: '100%',
    height: '4px',
    backgroundColor: '#FFD700',
    position: 'absolute',
    bottom: 0,
    left: 0,
    zIndex: 1000,
    animation: 'loading 2s infinite',
  }}>
    <style>
      {`
        @keyframes loading {
          0% { width: 0%; }
          50% { width: 50%; }
          100% { width: 100%; }
        }
      `}
    </style>
  </div>
);

const KpiCard = ({ title, value, icon, color }) => (
  <div className="kpi-card" style={{
    borderLeft: `4px solid ${color}`,
    backgroundColor: 'white',
    padding: '15px',
    borderRadius: '4px',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    textAlign: 'center'
  }}>
    <div style={{ color, fontSize: '2rem', marginBottom: '10px' }}>
      {icon}
    </div>
    <h6 style={{ fontWeight: 'bold', marginBottom: '10px' }}>{title}</h6>
    <p style={{
      color,
      fontSize: '1.8rem',
      fontWeight: 'bold',
      margin: 0
    }}>{value}</p>
  </div>
);

const EvaluationHistory = () => {
  // États pour les fonctionnalités d'export
  const [format, setFormat] = useState("csv");
  const [loadingCSV, setLoadingCSV] = useState(false);
  const [loadingExcel, setLoadingExcel] = useState(false);
  const [loadingPDF, setLoadingPDF] = useState(false);

  // États pour les filtres et recherches
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState({
    evaluationDate: '',
    status: '',
    position: '',
  });

  // États pour la pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(0);

  // États pour les données
  const [departments, setDepartments] = useState([]);
  const [evaluations, setEvaluations] = useState([]);
  const [kpiData, setKpiData] = useState({
    participationRate: 0,
    approvalRate: 0,
    overallAverage: 0,
  });

  // États pour l'UI
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [selectedEvaluation, setSelectedEvaluation] = useState(null);

  const fetchDepartments = useCallback(async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/departments`);
      setDepartments(response.data);
    } catch (err) {
      console.error('Erreur lors de la récupération des départements :', err);
    }
  }, []);

  const fetchKpis = useCallback(async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/kpis`, {
        params: {
          startDate: filters.evaluationDate || null,
          department: filters.position || '',
        },
      });
      setKpiData(response.data);
    } catch (err) {
      console.error('Erreur lors de la récupération des KPI  :', err);
    }
  }, [filters]);

  const fetchEvaluations = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get(`${API_BASE_URL}/evaluation-history-paginated`, {
        params: {
          startDate,
          endDate,
          evaluationType: filters.evaluationDate,
          department: filters.position,
          employeeName: searchQuery,
          pageNumber: currentPage,
          pageSize,
        },
      });
      setEvaluations(response.data.evaluations);
      setTotalPages(response.data.totalPages);
    } catch (err) {
      setError('Erreur lors de la récupération des évaluations.');
    } finally {
      setLoading(false);
    }
  }, [startDate, endDate, searchQuery, currentPage, pageSize, filters]);

  useEffect(() => {
    fetchDepartments();
    fetchKpis();
    fetchEvaluations();
  }, [fetchDepartments, fetchKpis, fetchEvaluations]);

  const handleExportCSV = async () => {
    setLoadingCSV(true);
    // Logique d'exportation CSV
    setLoadingCSV(false);
  };

  const handleExportExcel = async () => {
    setLoadingExcel(true);
    // Logique d'exportation Excel
    setLoadingExcel(false);
  };

  const handleExportPDF = async () => {
    setLoadingPDF(true);
    // Logique d'exportation PDF
    setLoadingPDF(false);
  };

  const handleDetailsClick = async (evaluationId) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/detail/${evaluationId}`);
      setSelectedEvaluation(response.data);
      setShowModal(true);
    } catch (error) {
      console.error("Erreur lors du chargement des détails :", error);
    }
  };

  const closeModal = () => {
    setSelectedEvaluation(null);
    setShowModal(false);
  };

  return (
    <Template>
      <div className="evaluation-history">
        <h2>Historique des Évaluations</h2>
        <div className="filters">
          <input
            type="text"
            placeholder="Recherche..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <button onClick={fetchEvaluations}><FaSearch /> Rechercher</button>
          <button onClick={handleExportCSV} disabled={loadingCSV}><FaFileCsv /> Exporter CSV</button>
          <button onClick={handleExportExcel} disabled={loadingExcel}><FaFileExcel /> Exporter Excel</button>
          <button onClick={handleExportPDF} disabled={loadingPDF}><FaFilePdf /> Exporter PDF</button>
        </div>
        {loading ? (
          <LoadingBar />
        ) : error ? (
          <div className="alert alert-danger">{error}</div>
        ) : (
          <div>
            <div className="kpi-cards">
              <KpiCard title="Taux de Participation" value={`${kpiData.participationRate}%`} icon={<FaChartBar />} color="#4caf50" />
              <KpiCard title="Taux d'Approbation" value={`${kpiData.approvalRate}%`} icon={<FaChartBar />} color="#2196f3" />
              <KpiCard title="Moyenne Globale" value={kpiData.overallAverage} icon={<FaChartBar />} color="#ff9800" />
            </div>
            <div className="table-responsive">
              <table className="table table-bordered">
                <thead>
                  <tr>
                    <th>Nom</th>
                    <th>Poste</th>
                    <th>Date d'évaluation</th>
                    <th>Note</th>
                    <th>Type d'évaluation</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {evaluations.length > 0 ? (
                    evaluations.map((emp) => (
                      <tr key={emp.evaluationId}>
                        <td>{emp.firstName} {emp.lastName}</td>
                        <td>{emp.position}</td>
                        <td>{emp.startDate}</td>
                        <td>{emp.overallScore}</td>
                        <td>{emp.evaluationType}</td>
                        <td>
                          <button
                            className="btn btn-info btn-sm"
                            onClick={() => handleDetailsClick(emp.evaluationId)}
                          >
                            Détails
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="6" className="text-center">
                        Aucun employé trouvé
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            <div className="pagination-controls">
              <button
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
              >
                <FaAngleLeft /> Précédent
              </button>
              <span>
                Page {currentPage} sur {totalPages}
              </span>
              <button
                onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
              >
                Suivant <FaAngleRight />
              </button>
              <select
                value={pageSize}
                onChange={(e) => {
                  setPageSize(Number(e.target.value));
                  setCurrentPage(1); // Réinitialiser à la première page
                }}
              >
                <option value={5}>5 par page</option>
                <option value={10}>10 par page</option>
                <option value={20}>20 par page</option>
                <option value={50}>50 par page</option>
              </select>
            </div>
            {showModal && selectedEvaluation && (
              <EvaluationDetailsModal
                evaluation={selectedEvaluation}
                onClose={closeModal}
              />
            )}
          </div>
        )}
        <div className="card shadow mb-4">
          <div className="card-header">
            <h5 className="mb-0">Graphiques de Performance</h5>
          </div>
          <div className="card-body">
            <PerformanceGraph evaluations={evaluations} />
            <GlobalPerformanceGraph />
          </div>
        </div>
      </div>
    </Template>
  );
};

export default EvaluationHistory;