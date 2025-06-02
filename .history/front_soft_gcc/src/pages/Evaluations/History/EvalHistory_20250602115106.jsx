import { useState, useEffect, useCallback } from 'react';
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
import { FaFileExcel, FaFilePdf, FaFileCsv, FaChartBar, FaSync } from 'react-icons/fa';
import PropTypes from 'prop-types';

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

const KpiCard = ({ title, value, icon, color }) => (
  <div className="kpi-card">
    <h6>{title}</h6>
    <p className="kpi-value" style={{ color: color || 'inherit' }}>
      {value}
    </p>
    {icon && <div className="kpi-icon">{icon}</div>}
  </div>
);

KpiCard.propTypes = {
  title: PropTypes.string.isRequired,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  icon: PropTypes.element,
  color: PropTypes.string
};

const EvaluationHistory = () => {
  const [loadingCSV, setLoadingCSV] = useState(false);
  const [loadingExcel] = useState(false);
  const [loadingPDF] = useState(false);
  const [departments, setDepartments] = useState([]);
  const [loadingKpi, setLoadingKpi] = useState(false);

  const [kpiYear, setKpiYear] = useState(new Date().getFullYear());
  const availableYears = Array.from({ length: 10 }, (_, i) => new Date().getFullYear() - i);

  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(0);

  const [selectedEvaluation, setSelectedEvaluation] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState({
    startDate: '',
    endDate: '',
    status: '',
    position: '',
    evaluationType: '',
  });

  const [evaluations, setEvaluations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [performanceData, setPerformanceData] = useState([]);
  const [kpiData, setKpiData] = useState({
    participationRate: 0,
    approvalRate: 0,
    overallAverage: 0,
  });

  const fetchDepartments = useCallback(async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/departments`);
      setDepartments(response.data);
    } catch (err) {
      console.error('Erreur lors de la récupération des départements :', err);
    }
  }, []);

  const fetchKpis = useCallback(async () => {
    setLoadingKpi(true);
    try {
      console.log("Récupération des KPI avec paramètres:", {
        startDate: new Date(kpiYear, 0, 1).toISOString(),
        endDate: new Date(kpiYear, 11, 31).toISOString(),
        departmentName: filters.position || '',
      });
      
      const response = await axios.get(`${API_BASE_URL}/kpis`, {
        params: {
          startDate: new Date(kpiYear, 0, 1).toISOString(),
          endDate: new Date(kpiYear, 11, 31).toISOString(),
          departmentName: filters.position || '',
        },
      });
      
      console.log("Données KPI reçues:", response.data);
      setKpiData(response.data);
    } catch (err) {
      console.error('Erreur lors de la récupération des KPI :', err);
    } finally {
      setLoadingKpi(false);
    }
  }, [kpiYear, filters]);

  const fetchEvaluations = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      console.log("Récupération des évaluations avec paramètres:", {
        pageNumber: currentPage,
        pageSize: pageSize,
        startDate: filters.startDate || null,
        endDate: filters.endDate || null,
        evaluationType: filters.evaluationType || '',
        department: filters.position || '',
        employeeName: searchQuery || '',
      });
      
      const response = await axios.get(`${API_BASE_URL}/evaluation-history-paginated`, {
        params: {
          pageNumber: currentPage,
          pageSize: pageSize,
          startDate: filters.startDate || null,
          endDate: filters.endDate || null,
          evaluationType: filters.evaluationType || '',
          department: filters.position || '',
          employeeName: searchQuery || '',
        },
      });
      
      console.log("Données d'évaluations reçues:", response.data);
      
      setEvaluations(response.data.evaluations);
      setTotalPages(response.data.totalPages);
      
      // Préparer les données pour le graphique de performance
      if (response.data.evaluations && response.data.evaluations.length > 0) {
        const performanceHistory = response.data.evaluations.map(evaluation => ({
          date: new Date(evaluation.startDate).toLocaleDateString('fr-FR', {
            year: 'numeric',
            month: 'short',
          }),
          score: evaluation.overallScore
        })).sort((a, b) => new Date(a.date) - new Date(b.date));
        
        console.log("Données formatées pour le graphique de performance:", performanceHistory);
        setPerformanceData(performanceHistory);
      } else {
        console.log("Aucune donnée d'évaluation disponible pour le graphique");
        setPerformanceData([]);
      }
    } catch (fetchError) { 
      console.error('Erreur lors de la récupération des évaluations:', fetchError);
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

  const handleExportExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(evaluations.map(emp => ({
      Nom: emp.firstName,
      Poste: emp.position,
      "Date d'évaluation": emp.startDate,
      Statut: emp.status,
      Note: emp.overallScore,
      "Type d'évaluation": emp.evaluationType,
    })));
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Evaluations");
    XLSX.writeFile(workbook, "evaluations.xlsx");
  };

  const handleExportPDF = () => {
    const doc = new jsPDF();
    doc.autoTable({
      head: [['Nom', 'Poste', 'Date d\'évaluation', 'Note', 'Type d\'évaluation']],
      body: evaluations.map(emp => [
        `${emp.firstName} ${emp.lastName}`,
        emp.position,
        emp.startDate,
        emp.overallScore,
        emp.evaluationType,
      ]),
    });
    doc.save('evaluations.pdf');
  };

  return (
    <Template>
      <div className="container mt-4">
        <h2 className="mb-4">Historique des Évaluations</h2>

        <div className="card shadow mb-4">
          <div className="card-header d-flex justify-content-between align-items-center">
            <h5 className="mb-0">Indicateurs Clés de Performance (KPI)</h5>
            <div className="d-flex align-items-center">
              <div className="input-group mr-2" style={{ width: '150px' }}>
                <select
                  id="kpiYear"
                  className="form-control form-control-sm"
                  value={kpiYear}
                  onChange={(e) => setKpiYear(e.target.value)}
                  style={{ borderRadius: '4px', border: '1px solid #ced4da' }}
                >
                  {availableYears.map(year => <option key={year} value={year}>{year}</option>)}
                </select>
              </div>
              <button
                className="btn btn-outline-primary btn-sm d-flex align-items-center"
                onClick={fetchKpis}
              >
                {loadingKpi ? (
                  <span><FaSync className="fa-spin mr-2" /> Chargement...</span>
                ) : (
                  <span><FaSync className="mr-2" /> Rafraîchir</span>
                )}
              </button>
            </div>
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
                {loadingCSV ? (
                  <span><FaSync className="fa-spin mr-2" /> Export en cours...</span>
                ) : (
                  <span><FaFileCsv className="mr-2" /> Exporter en CSV</span>
                )}
              </CSVLink>
              <button
                className="btn btn-outline-primary btn-sm"
                onClick={handleExportExcel}
                disabled={loadingExcel}
              >
                {loadingExcel ? (
                  <span><FaSync className="fa-spin mr-2" /> Export en cours...</span>
                ) : (
                  <span><FaFileExcel className="mr-2" /> Exporter en Excel</span>
                )}
              </button>
              <button
                className="btn btn-outline-success btn-sm"
                onClick={handleExportPDF}
                disabled={loadingPDF}
              >
                {loadingPDF ? (
                  <span><FaSync className="fa-spin mr-2" /> Export en cours...</span>
                ) : (
                  <span><FaFilePdf className="mr-2" /> Exporter en PDF</span>
                )}
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
                      <th>Date d&apos;évaluation</th>
                      <th>Note</th>
                      <th>Type d&apos;évaluation</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {evaluations.length > 0 ? (
                      evaluations.map((emp) => (
                        <tr key={emp.evaluationId}>
                          <td>{emp.firstName} {emp.lastName}</td>
                          <td>{emp.position}</td>
                          <td>
                            {emp.startDate ? new Date(emp.startDate).toLocaleDateString('fr-FR', {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric'
                            }) : 'N/A'}
                          </td>
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
            <PerformanceGraph performanceData={performanceData} />
            <GlobalPerformanceGraph
              filters={{ startDate: filters.startDate, endDate: filters.endDate, department: filters.position, evaluationType: filters.evaluationType }}
            />
          </div>
        </div>
      </div>
    </Template>
  );
};

export default EvaluationHistory;