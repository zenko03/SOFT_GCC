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
    backgroundColor: '#FFD700', // Jaune moutarde
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

const EvaluationHistory = () => {
  const [format, setFormat] = useState("csv"); // Format par défaut
  const [loadingCSV, setLoadingCSV] = useState(false);
  const [loadingExcel, setLoadingExcel] = useState(false);
  const [loadingPDF, setLoadingPDF] = useState(false);
  const [departments, setDepartments] = useState([]);

  // PAGINATION
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(0);

  const [selectedEvaluation, setSelectedEvaluation] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState({
    evaluationDate: '',
    status: '',
    position: '',
  });

  const [evaluations, setEvaluations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);

  const [kpiData, setKpiData] = useState({
    participationRate: 0,
    approvalRate: 0,
    overallAverage: 0,
  });

  // Fonction pour récupérer les départements
  const fetchDepartments = useCallback(async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/departments`);
      setDepartments(response.data);
    } catch (err) {
      console.error('Erreur lors de la récupération des départements :', err);
    }
  }, []);

  // Récupération des KPIs
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
      console.error('Erreur lors de la récupération des KPI :', err);
    }
  }, [filters]);

  // Récupération des évaluations
  const fetchEvaluations = use Callback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get(`${API_BASE_URL}/evaluation-history-paginated`, {
        params: {
          pageNumber: currentPage,
          pageSize: pageSize,
          startDate: filters.evaluationDate || null,
          evaluationType: '',
          department: filters.position || '',
          employeeName: searchQuery || '',
        },
      });
      setEvaluations(response.data.evaluations);
      setTotalPages(response.data.totalPages);
    } catch (err) {
      setError('Erreur lors de la récupération des évaluations.');
    } finally {
      setLoading(false);
    }
  }, [searchQuery, filters, currentPage, pageSize]);

  useEffect(() => {
    fetchDepartments();
    fetchKpis();
    fetchEvaluations();
  }, [fetchDepartments, fetchKpis, fetchEvaluations]);

  const handleSearchChange = (e) => {
    const query = e.target.value.trim();
    setSearchQuery(query);
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
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
      <div className="container mt-4">
        <h2 className="mb-4">Historique des Évaluations</h2>

        {/* Section KPI */}
        <div className="card shadow mb-4">
          <div className="card-header d-flex justify-content-between align-items-center">
            <h5 className="mb-0">Indicateurs Clés de Performance (KPI)</h5>
            <button className="btn btn-outline-primary btn-sm" onClick={fetchKpis}>
              Rafraîchir
            </button>
          </div>
          <div className="card-body">
            <div className="row text-center">
              <div className="col-md-4">
                <KpiCard title="Taux de Participation" value={`${kpiData.participationRate.toFixed(2)}%`} icon={<FaChartBar />} color="#4caf50" />
              </div>
              <div className="col-md-4">
                <KpiCard title="Taux d'Approbation" value={`${kpiData.approvalRate.toFixed(2)}%`} icon={<FaChartBar />} color="#2196f3" />
              </div>
              <div className="col-md-4">
                <KpiCard title="Moyenne Générale" value={kpiData.overallAverage.toFixed(2)} icon={<FaChartBar />} color="#ff9800" />
              </div>
            </div>
          </div>
        </div>
        {/* Fin de la section KPI */}

        {/* Section des exports */}
        <div className="card shadow mb-4">
          <div className="card-header" style={{ position: 'relative' }}>
            <div className="btn-group">
              <CSVLink
                data={evaluations.map(emp => ({
                  Nom: emp.firstName,
                  Poste: emp.position,
                  "Date d'évaluation": emp.startDate,
                  Statut: emp.status,
                  Note: emp.overallScore,
                  "Type d'évaluation": emp.evaluationType,
                }))}
                filename={"evaluations.csv"}
                className="btn btn-outline-secondary btn-sm"
                asyncOnClick={true}
                onClick={() => {
                  setLoadingCSV(true);
                  setTimeout(() => setLoadingCSV(false), 2000);
                }}
              >
                {loadingCSV ? 'Export en cours...' : 'Exporter en CSV'}
              </CSVLink>
              <button className="btn btn-outline-primary btn-sm" onClick={handleExportExcel} disabled={loadingExcel}>
                {loadingExcel ? 'Export en cours...' : 'Exporter en Excel'}
              </button>
              <button className="btn btn-outline-success btn-sm" onClick={handleExportPDF} disabled={loadingPDF}>
                {loadingPDF ? 'Export en cours...' : 'Exporter en PDF'}
              </button>
            </div>
            {(loadingCSV || loadingExcel || loadingPDF) && <LoadingBar />}
          </div>

          <div className="card-body">
            <div className="row">
              <div className="col-md-4">
                <input
                  type="text"
                  className="form-control"
                  placeholder="Rechercher un employé"
                  value={searchQuery}
                  onChange={handleSearchChange}
                />
              </div>
              <div className="col-md-8 d-flex">
                <input
                  type="date"
                  name="evaluationDate"
                  className="form-control mx-1"
                  value={filters.evaluationDate}
                  onChange={handleFilterChange}
                />
                <select
                  name="status"
                  className="form-control mx-1"
                  value={filters.status}
                  onChange={handleFilterChange}
                >
                  <option value="">Statut</option>
                  <option value="Terminé">Terminé</option>
                  <option value="En attente">En attente</option>
                </select>
                <select
                  name="position"
                  className="form-control mx-1"
                  value={filters.position}
                  onChange={handleFilterChange}
                >
                  <option value="">Tous les départements</option>
                  {departments.map((dept) => (
                    <option key={dept.id} value={dept.name}>
                      {dept.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>

        <div className="card shadow mb-4">
          <div className="card-body">
            {loading ? (
              <div className="text-center">
                <div className="spinner-border text-primary" role="status">
                  <span className="sr-only">Chargement...</span>
                </div>
              </div>
            ) : (
              <div>
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

                <div className="pagination-controls">
                  <button
                    onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                  >
                    Précédent
                  </button>
                  <span>
                    Page {currentPage} sur {totalPages}
                  </span>
                  <button
                    onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages}
                  >
                    Suivant
                  </button>
                  <select
                    value={pageSize}
                    onChange={(e) => {
                      setPageSize(Number(e.target.value));
                      setCurrentPage(1);
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
          </div>
        </div>

        <div className="card shadow mb-4">
          <div className="card-header">
            <h5 className="mb-0">Graphiques de Performance</h5>
          </div>
          <div className="card-body">
            <PerformanceGraph />
            <GlobalPerformanceGraph />
          </div>
        </div>
      </div>
    </Template>
  );
};

export default EvaluationHistory;