import { useState, useEffect, useCallback } from 'react';
import Template from '../../Template';
import PerformanceGraph from './PerformanceGraph';
import '../../../assets/css/Evaluations/EvaluationHistory.css';
import axios from 'axios';
import EvaluationDetailsModal from './EvaluationDetailsModal';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { FaFileExcel, FaFilePdf, FaFileCsv, FaDownload, FaCalendarAlt, FaSearch } from 'react-icons/fa';
import PropTypes from 'prop-types';
import { DateRangePicker } from 'react-date-range';
import 'react-date-range/dist/styles.css';
import 'react-date-range/dist/theme/default.css';

const API_BASE_URL = 'https://localhost:7082/api/EvaluationHistory';

const LoadingBar = () => (
  <div style={{
    width: '100%',
    height: '4px',
    backgroundColor: '#D4AC0D',
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
  const [loadingExport, setLoadingExport] = useState(false);
  const [departments, setDepartments] = useState([]);
  const [evaluationTypes, setEvaluationTypes] = useState([]);
  const [showDateRangePicker, setShowDateRangePicker] = useState(false);

  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(0);
  const [totalEvaluations, setTotalEvaluations] = useState(0);

  const [selectedEvaluation, setSelectedEvaluation] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [advancedSearch, setAdvancedSearch] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  
  const [dateRange, setDateRange] = useState({
    startDate: null,
    endDate: null,
    key: 'selection'
  });
  
  const [filters, setFilters] = useState({
    startDate: '',
    endDate: '',
    status: '',
    department: '',
    evaluationType: '',
    minScore: '',
    maxScore: '',
  });

  const [evaluations, setEvaluations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [performanceData, setPerformanceData] = useState([]);
  const [detailedStats, setDetailedStats] = useState({
    scoreDistribution: { low: 0, medium: 0, high: 0, average: 0 },
    departmentDistribution: [],
    evaluationTypeDistribution: [],
    performanceByYear: [],
    trendData: { isIncreasing: false, percentageChange: 0 }
  });
  const [loadingDetailedStats, setLoadingDetailedStats] = useState(false);

  // Récupérer les départements et les types d'évaluation
  const fetchMetadata = useCallback(async () => {
    try {
      // Récupérer les départements
      const deptResponse = await axios.get(`${API_BASE_URL}/departments`);
      setDepartments(deptResponse.data);
      
      // Récupérer les types d'évaluation
      const evalTypesResponse = await axios.get(`${API_BASE_URL}/evaluation-types`);
      if (Array.isArray(evalTypesResponse.data)) {
        setEvaluationTypes(evalTypesResponse.data);
      } else {
        // Si l'API n'est pas disponible, utiliser des valeurs par défaut
        setEvaluationTypes(['Annuelle', 'Trimestrielle', 'Probatoire', 'Promotion']);
      }
      
      // Récupérer la liste des employés pour la recherche avancée
      const employeesResponse = await axios.get(`${API_BASE_URL}/employees`);
      if (Array.isArray(employeesResponse.data)) {
        // Log pour débogage au lieu d'utiliser setEmployees
        console.log(`Employés chargés: ${employeesResponse.data.length}`);
      }
    } catch (err) {
      console.error('Erreur lors du chargement des métadonnées :', err);
    }
  }, []);

  // Récupérer les statistiques détaillées
  const fetchDetailedStatistics = useCallback(async () => {
    setLoadingDetailedStats(true);
    try {
      console.log("Récupération des statistiques détaillées avec paramètres:", {
        startDate: filters.startDate || null,
        endDate: filters.endDate || null,
        department: filters.department || '',
        evaluationType: filters.evaluationType || '',
      });
      
      const response = await axios.get(`${API_BASE_URL}/detailed-statistics`, {
        params: {
          startDate: filters.startDate || null,
          endDate: filters.endDate || null,
          department: filters.department || '',
          evaluationType: filters.evaluationType || '',
        },
      });
      
      console.log("Statistiques détaillées reçues:", response.data);
      setDetailedStats(response.data);
      
      // Préparer les données pour le graphique de performance
      if (response.data.performanceByYear && response.data.performanceByYear.length > 0) {
        const performanceHistory = response.data.performanceByYear.map(year => ({
          date: `${year.year}`,
          score: year.averageScore
        })).sort((a, b) => a.date.localeCompare(b.date));
        
        setPerformanceData(performanceHistory);
      }
    } catch (error) {
      console.error("Erreur lors de la récupération des statistiques détaillées:", error);
      setError("Erreur lors de la récupération des statistiques détaillées.");
    } finally {
      setLoadingDetailedStats(false);
    }
  }, [filters]);

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
        department: filters.department || '',
        employeeName: searchQuery || '',
        minScore: filters.minScore || '',
        maxScore: filters.maxScore || '',
        employeeId: selectedEmployee?.id || '',
      });
      
      const response = await axios.get(`${API_BASE_URL}/evaluation-history-paginated`, {
        params: {
          pageNumber: currentPage,
          pageSize: pageSize,
          startDate: filters.startDate || null,
          endDate: filters.endDate || null,
          evaluationType: filters.evaluationType || '',
          department: filters.department || '',
          employeeName: searchQuery || '',
          minScore: filters.minScore || '',
          maxScore: filters.maxScore || '',
          employeeId: selectedEmployee?.id || '',
        },
      });
      
      console.log("Données d'évaluations reçues:", response.data);
      
      setEvaluations(response.data.evaluations);
      setTotalPages(response.data.totalPages);
      setTotalEvaluations(response.data.totalItems || response.data.evaluations.length);
      
      // Préparer les données pour le graphique de performance si détaillées non disponibles
      if ((!detailedStats.performanceByYear || detailedStats.performanceByYear.length === 0) && 
          response.data.evaluations && response.data.evaluations.length > 0) {
        const performanceHistory = response.data.evaluations.map(evaluation => ({
          date: new Date(evaluation.startDate).toLocaleDateString('fr-FR', {
            year: 'numeric',
            month: 'short',
          }),
          score: evaluation.overallScore
        })).sort((a, b) => new Date(a.date) - new Date(b.date));
        
        setPerformanceData(performanceHistory);
      }
    } catch (fetchError) { 
      console.error('Erreur lors de la récupération des évaluations:', fetchError);
      setError('Erreur lors de la récupération des évaluations.');
    } finally {
      setLoading(false);
    }
  }, [searchQuery, filters, currentPage, pageSize, selectedEmployee, detailedStats.performanceByYear]);

  useEffect(() => {
    fetchMetadata();
    fetchDetailedStatistics();
    fetchEvaluations();
  }, [fetchMetadata, fetchDetailedStatistics, fetchEvaluations]);

  const handleSearchChange = (e) => {
    const query = e.target.value.trim();
    setSearchQuery(query);
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  const handleDateRangeChange = (ranges) => {
    setDateRange(ranges.selection);
    if (ranges.selection.startDate && ranges.selection.endDate) {
      setFilters(prev => ({
        ...prev,
        startDate: ranges.selection.startDate.toISOString(),
        endDate: ranges.selection.endDate.toISOString()
      }));
    }
  };

  const applyDateRange = () => {
    setShowDateRangePicker(false);
    // Les filtres ont déjà été mis à jour dans handleDateRangeChange
    fetchEvaluations();
  };

  const resetFilters = () => {
    setFilters({
      startDate: '',
      endDate: '',
      status: '',
      department: '',
      evaluationType: '',
      minScore: '',
      maxScore: '',
    });
    setSearchQuery('');
    setSelectedEmployee(null);
    setDateRange({
      startDate: null,
      endDate: null,
      key: 'selection'
    });
    setCurrentPage(1);
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

  const handleExport = async (format) => {
    setLoadingExport(true);
    try {
      // Si format est "client-side", nous utilisons les méthodes intégrées
      if (format === 'excel') {
        const worksheet = XLSX.utils.json_to_sheet(evaluations.map(emp => ({
          Nom: `${emp.firstName} ${emp.lastName}`,
          Poste: emp.position,
          "Date d'évaluation": new Date(emp.startDate).toLocaleDateString('fr-FR'),
          "Date de fin": new Date(emp.endDate).toLocaleDateString('fr-FR'),
          Statut: emp.status,
          Note: emp.overallScore,
          "Type d'évaluation": emp.evaluationType,
        })));
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Evaluations");
        XLSX.writeFile(workbook, "historique_evaluations.xlsx");
      } else if (format === 'pdf') {
        const doc = new jsPDF();
        doc.autoTable({
          head: [['Nom', 'Poste', "Date d'évaluation", 'Note', "Type d'évaluation"]],
          body: evaluations.map(emp => [
            `${emp.firstName} ${emp.lastName}`,
            emp.position,
            new Date(emp.startDate).toLocaleDateString('fr-FR'),
            emp.overallScore,
            emp.evaluationType,
          ]),
        });
        doc.save('historique_evaluations.pdf');
      } else {
        // Sinon, nous utilisons l'API backend pour des exports plus complexes
        const response = await axios.get(`${API_BASE_URL}/export`, {
          params: {
            format: format,
            startDate: filters.startDate || null,
            endDate: filters.endDate || null,
            department: filters.department || '',
            evaluationType: filters.evaluationType || '',
            employeeName: searchQuery || '',
          },
          responseType: 'blob', // Important pour les fichiers binaires
        });
        
        // Créer un URL pour télécharger le fichier
        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `evaluations.${format}`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }
    } catch (error) {
      console.error(`Erreur lors de l'export en ${format}:`, error);
      setError(`Erreur lors de l'exportation en ${format}.`);
    } finally {
      setLoadingExport(false);
    }
  };

  const getStatusClass = (status) => {
    if (!status) return "badge bg-secondary";
    const statusCode = typeof status === 'string' ? parseInt(status) : status;
    
    switch(statusCode) {
      case 10: return "badge bg-warning text-dark"; // En cours
      case 20: return "badge bg-success"; // Terminée
      case 30: return "badge bg-danger"; // Annulée
      case 40: return "badge bg-info"; // En attente
      default: return "badge bg-secondary"; // Autre
    }
  };

  const getStatusLabel = (status) => {
    if (!status) return "Inconnu";
    const statusCode = typeof status === 'string' ? parseInt(status) : status;
    
    switch(statusCode) {
      case 10: return "En cours";
      case 20: return "Terminée";
      case 30: return "Annulée";
      case 40: return "En attente";
      default: return "Inconnu";
    }
  };

  return (
    <Template>
      <div className="container-fluid mt-4">
        <header className="d-flex justify-content-between align-items-center mb-4">
          <h2>Historique des Évaluations</h2>
          <div className="export-actions">
            <div className="btn-group">
              <button className="btn btn-outline-secondary dropdown-toggle" type="button" data-bs-toggle="dropdown" aria-expanded="false">
                <FaDownload className="me-1" /> Exporter
              </button>
              <ul className="dropdown-menu">
                <li>
                  <button className="dropdown-item" onClick={() => handleExport('csv')}>
                    <FaFileCsv className="me-2" /> CSV
                  </button>
                </li>
                <li>
                  <button className="dropdown-item" onClick={() => handleExport('excel')}>
                    <FaFileExcel className="me-2" /> Excel
                  </button>
                </li>
                <li>
                  <button className="dropdown-item" onClick={() => handleExport('pdf')}>
                    <FaFilePdf className="me-2" /> PDF
                  </button>
                </li>
              </ul>
            </div>
          </div>
        </header>
        
        {error && (
          <div className="alert alert-danger mb-4">
            <strong>Erreur:</strong> {error}
          </div>
        )}

        <div className="row mb-4">
          <div className="col-lg-12">
            <div className="card shadow">
              <div className="card-header d-flex justify-content-between align-items-center">
                <h5 className="mb-0">Filtres de recherche</h5>
                <button 
                  className="btn btn-link" 
                  onClick={() => setAdvancedSearch(!advancedSearch)}
                  style={{ textDecoration: 'none' }}
                >
                  {advancedSearch ? 'Recherche simple' : 'Recherche avancée'}
                </button>
              </div>
              <div className="card-body">
                <div className="row align-items-end">
                  <div className="col-md-4 mb-3">
                    <label className="form-label">Recherche par nom</label>
                    <div className="input-group">
                      <span className="input-group-text"><FaSearch /></span>
                      <input
                        type="text"
                        className="form-control"
                        placeholder="Rechercher un employé"
                        value={searchQuery}
                        onChange={handleSearchChange}
                      />
                    </div>
                  </div>
                  <div className="col-md-4 mb-3">
                    <label className="form-label">Période</label>
                    <div className="input-group">
                      <button 
                        className="btn btn-outline-secondary" 
                        type="button"
                        onClick={() => setShowDateRangePicker(!showDateRangePicker)}
                      >
                        <FaCalendarAlt className="me-2" />
                        {filters.startDate && filters.endDate
                          ? `${new Date(filters.startDate).toLocaleDateString('fr-FR')} - ${new Date(filters.endDate).toLocaleDateString('fr-FR')}`
                          : "Sélectionner une période"}
                      </button>
                    </div>
                    {showDateRangePicker && (
                      <div className="position-absolute mt-1" style={{ zIndex: 1000, background: 'white', border: '1px solid #ddd', borderRadius: '4px', boxShadow: '0 2px 10px rgba(0,0,0,0.1)' }}>
                        <DateRangePicker
                          ranges={[dateRange]}
                          onChange={handleDateRangeChange}
                          months={2}
                          direction="horizontal"
                        />
                        <div className="p-2 d-flex justify-content-end">
                          <button 
                            className="btn btn-sm btn-secondary me-2"
                            onClick={() => setShowDateRangePicker(false)}
                          >
                            Annuler
                          </button>
                          <button 
                            className="btn btn-sm"
                            onClick={applyDateRange}
                            style={{ backgroundColor: '#D4AC0D', color: 'white' }}
                          >
                            Appliquer
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                  <div className="col-md-3 mb-3">
                    <label className="form-label">Département</label>
                    <select
                      name="department"
                      className="form-select"
                      value={filters.department}
                      onChange={handleFilterChange}
                    >
                      <option value="">Tous les départements</option>
                      {departments.map((dept) => (
                        <option key={dept.departmentId || dept.id} value={dept.name || dept.departmentName}>
                          {dept.name || dept.departmentName}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="col-md-1 mb-3 d-flex">
                    <button 
                      className="btn btn-primary ms-auto" 
                      onClick={() => {
                        setCurrentPage(1);
                        fetchEvaluations();
                      }}
                      style={{ backgroundColor: '#D4AC0D', borderColor: '#D4AC0D' }}
                    >
                      <FaSearch /> Filtrer
                    </button>
                  </div>
                </div>
                
                {advancedSearch && (
                  <div className="row mt-3">
                    <div className="col-md-3 mb-3">
                      <label className="form-label">Type d&apos;évaluation</label>
                      <select
                        name="evaluationType"
                        className="form-select"
                        value={filters.evaluationType}
                        onChange={handleFilterChange}
                      >
                        <option value="">Tous les types</option>
                        {evaluationTypes.map((type) => (
                          <option key={type} value={type}>{type}</option>
                        ))}
                      </select>
                    </div>
                    <div className="col-md-3 mb-3">
                      <label className="form-label">Statut</label>
                      <select
                        name="status"
                        className="form-select"
                        value={filters.status}
                        onChange={handleFilterChange}
                      >
                        <option value="">Tous les statuts</option>
                        <option value="10">En cours</option>
                        <option value="20">Terminée</option>
                        <option value="30">Annulée</option>
                        <option value="40">En attente</option>
                      </select>
                    </div>
                    <div className="col-md-3 mb-3">
                      <label className="form-label">Score minimum</label>
                      <input
                        type="number"
                        name="minScore"
                        className="form-control"
                        value={filters.minScore}
                        onChange={handleFilterChange}
                        min="0"
                        max="5"
                        step="0.5"
                      />
                    </div>
                    <div className="col-md-3 mb-3">
                      <label className="form-label">Score maximum</label>
                      <input
                        type="number"
                        name="maxScore"
                        className="form-control"
                        value={filters.maxScore}
                        onChange={handleFilterChange}
                        min="0"
                        max="5"
                        step="0.5"
                      />
                    </div>
                  </div>
                )}
                
                <div className="d-flex justify-content-end mt-2">
                  <button 
                    className="btn btn-outline-secondary"
                    onClick={resetFilters}
                  >
                    Réinitialiser les filtres
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="row">
          <div className="col-lg-8">
            <div className="card shadow mb-4">
              <div className="card-header d-flex justify-content-between align-items-center">
                <h5 className="mb-0">Liste des évaluations</h5>
                <span className="badge rounded-pill bg-secondary">
                  {totalEvaluations} évaluation(s)
                </span>
              </div>
              <div className="card-body">
                {loading ? (
                  <div className="text-center p-5">
                    <div className="spinner-border text-warning" role="status">
                      <span className="visually-hidden">Chargement...</span>
                    </div>
                    <p className="mt-2">Chargement des données...</p>
                  </div>
                ) : evaluations.length > 0 ? (
                  <div className="table-responsive">
                    <table className="table table-bordered table-hover">
                      <thead className="table-light">
                        <tr>
                          <th>Employé</th>
                          <th>Poste</th>
                          <th>Date</th>
                          <th>Type</th>
                          <th>Score</th>
                          <th>Statut</th>
                          <th>Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {evaluations.map((evaluation) => (
                          <tr key={evaluation.evaluationId} className="align-middle">
                            <td>{evaluation.firstName} {evaluation.lastName}</td>
                            <td>{evaluation.position || 'N/A'}</td>
                            <td>
                              {evaluation.startDate ? new Date(evaluation.startDate).toLocaleDateString('fr-FR', {
                                year: 'numeric',
                                month: 'short',
                                day: 'numeric'
                              }) : 'N/A'}
                            </td>
                            <td>{evaluation.evaluationType || 'N/A'}</td>
                            <td>
                              <div className="d-flex align-items-center">
                                <div 
                                  className="me-2"
                                  style={{
                                    width: `${evaluation.overallScore * 20}%`,
                                    height: '8px',
                                    backgroundColor: `hsl(${evaluation.overallScore * 24}, 70%, 50%)`,
                                    borderRadius: '4px'
                                  }}
                                ></div>
                                <span>{evaluation.overallScore?.toFixed(1) || 'N/A'}</span>
                              </div>
                            </td>
                            <td>
                              <span className={getStatusClass(evaluation.status)}>
                                {getStatusLabel(evaluation.status)}
                              </span>
                            </td>
                            <td>
                              <button
                                className="btn btn-sm"
                                onClick={() => handleDetailsClick(evaluation.evaluationId)}
                                style={{ backgroundColor: '#D4AC0D', color: 'white' }}
                              >
                                Détails
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="text-center p-4">
                    <div className="mb-3">
                      <svg width="64" height="64" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="text-muted">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <h6>Aucune évaluation trouvée</h6>
                    <p className="text-muted">
                      Ajustez vos critères de recherche ou essayez une autre période
                    </p>
                  </div>
                )}

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="d-flex justify-content-between align-items-center mt-4">
                    <div>
                      <select
                        className="form-select form-select-sm"
                        value={pageSize}
                        onChange={(e) => {
                          setPageSize(Number(e.target.value));
                          setCurrentPage(1);
                        }}
                        style={{ width: '80px' }}
                      >
                        <option value={5}>5</option>
                        <option value={10}>10</option>
                        <option value={25}>25</option>
                        <option value={50}>50</option>
                      </select>
                    </div>
                    <nav>
                      <ul className="pagination pagination-sm mb-0">
                        <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                          <button 
                            className="page-link" 
                            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                          >
                            Précédent
                          </button>
                        </li>
                        {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                          // Afficher au maximum 5 pages et centrer la page actuelle
                          const startPage = Math.max(1, currentPage - 2);
                          const pageNum = startPage + i;
                          if (pageNum <= totalPages) {
                            return (
                              <li 
                                key={pageNum} 
                                className={`page-item ${pageNum === currentPage ? 'active' : ''}`}
                              >
                                <button 
                                  className="page-link" 
                                  onClick={() => setCurrentPage(pageNum)}
                                >
                                  {pageNum}
                                </button>
                              </li>
                            );
                          }
                          return null;
                        })}
                        <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
                          <button 
                            className="page-link" 
                            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                          >
                            Suivant
                          </button>
                        </li>
                      </ul>
                    </nav>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="col-lg-4">
            <div className="card shadow mb-4">
              <div className="card-header">
                <h5 className="mb-0">Évolution des performances</h5>
              </div>
              <div className="card-body">
                {loadingDetailedStats ? (
                  <div className="text-center p-5">
                    <div className="spinner-border text-warning" role="status">
                      <span className="visually-hidden">Chargement...</span>
                    </div>
                    <p className="mt-2">Chargement du graphique...</p>
                  </div>
                ) : (
                  <div className="performance-graph-wrapper">
                    <PerformanceGraph performanceData={performanceData} />
                    {detailedStats && detailedStats.scoreDistribution && (
                      <div className="performance-stats mt-4">
                        <h6 className="text-center mb-3">Statistiques</h6>
                        <div className="row g-2">
                          <div className="col-6">
                            <div className="stats-card p-2 rounded bg-light">
                              <div className="small text-muted">Score moyen</div>
                              <div className="h5 mb-0">
                                {detailedStats.scoreDistribution && typeof detailedStats.scoreDistribution.average === 'number' 
                                  ? detailedStats.scoreDistribution.average.toFixed(2) 
                                  : '0.00'}
                              </div>
                            </div>
                          </div>
                          <div className="col-6">
                            <div className="stats-card p-2 rounded bg-light">
                              <div className="small text-muted">Tendance</div>
                              <div className="h5 mb-0" style={{ 
                                color: detailedStats.trendData && detailedStats.trendData.isIncreasing ? '#4caf50' : '#e74c3c' 
                              }}>
                                {detailedStats.trendData && typeof detailedStats.trendData.percentageChange === 'number' && detailedStats.trendData.percentageChange > 0 ? '+' : ''}
                                {detailedStats.trendData && typeof detailedStats.trendData.percentageChange === 'number' 
                                  ? detailedStats.trendData.percentageChange.toFixed(1) 
                                  : '0.0'}%
                              </div>
                            </div>
                          </div>
                          <div className="col-6">
                            <div className="stats-card p-2 rounded bg-light">
                              <div className="small text-muted">Score minimum</div>
                              <div className="h5 mb-0">
                                {detailedStats.scoreDistribution && typeof detailedStats.scoreDistribution.min === 'number' 
                                  ? detailedStats.scoreDistribution.min.toFixed(1) 
                                  : '0.0'}
                              </div>
                            </div>
                          </div>
                          <div className="col-6">
                            <div className="stats-card p-2 rounded bg-light">
                              <div className="small text-muted">Score maximum</div>
                              <div className="h5 mb-0">
                                {detailedStats.scoreDistribution && typeof detailedStats.scoreDistribution.max === 'number' 
                                  ? detailedStats.scoreDistribution.max.toFixed(1) 
                                  : '0.0'}
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="mt-4">
                          <h6 className="text-center mb-2">Répartition des scores</h6>
                          <div className="progress" style={{ height: "24px" }}>
                            {detailedStats.scoreDistribution && (
                              <>
                                <div 
                                  className="progress-bar bg-danger" 
                                  role="progressbar" 
                                  style={{ 
                                    width: `${detailedStats.scoreDistribution.low !== undefined && 
                                      (detailedStats.scoreDistribution.low + detailedStats.scoreDistribution.medium + detailedStats.scoreDistribution.high) > 0 
                                        ? (detailedStats.scoreDistribution.low / (detailedStats.scoreDistribution.low + detailedStats.scoreDistribution.medium + detailedStats.scoreDistribution.high) * 100) 
                                        : 0}%`,
                                    transition: 'width 0.5s ease-in-out'
                                  }}
                                  aria-valuenow={detailedStats.scoreDistribution.low || 0} 
                                  aria-valuemin="0" 
                                  aria-valuemax="100"
                                  title={`Faible: ${detailedStats.scoreDistribution.low || 0} évaluations`}
                                >
                                  {detailedStats.scoreDistribution.low > 0 && (detailedStats.scoreDistribution.low + detailedStats.scoreDistribution.medium + detailedStats.scoreDistribution.high) > 0 && (
                                    `${((detailedStats.scoreDistribution.low / (detailedStats.scoreDistribution.low + detailedStats.scoreDistribution.medium + detailedStats.scoreDistribution.high)) * 100).toFixed(0)}%`
                                  )}
                                </div>
                                <div 
                                  className="progress-bar bg-warning" 
                                  role="progressbar" 
                                  style={{ 
                                    width: `${detailedStats.scoreDistribution.medium !== undefined &&
                                      (detailedStats.scoreDistribution.low + detailedStats.scoreDistribution.medium + detailedStats.scoreDistribution.high) > 0 
                                        ? (detailedStats.scoreDistribution.medium / (detailedStats.scoreDistribution.low + detailedStats.scoreDistribution.medium + detailedStats.scoreDistribution.high) * 100) 
                                        : 0}%`,
                                    transition: 'width 0.5s ease-in-out'
                                  }}
                                  aria-valuenow={detailedStats.scoreDistribution.medium || 0} 
                                  aria-valuemin="0" 
                                  aria-valuemax="100"
                                  title={`Moyen: ${detailedStats.scoreDistribution.medium || 0} évaluations`}
                                >
                                  {detailedStats.scoreDistribution.medium > 0 && (detailedStats.scoreDistribution.low + detailedStats.scoreDistribution.medium + detailedStats.scoreDistribution.high) > 0 && (
                                    `${((detailedStats.scoreDistribution.medium / (detailedStats.scoreDistribution.low + detailedStats.scoreDistribution.medium + detailedStats.scoreDistribution.high)) * 100).toFixed(0)}%`
                                  )}
                                </div>
                                <div 
                                  className="progress-bar bg-success" 
                                  role="progressbar" 
                                  style={{ 
                                    width: `${detailedStats.scoreDistribution.high !== undefined &&
                                      (detailedStats.scoreDistribution.low + detailedStats.scoreDistribution.medium + detailedStats.scoreDistribution.high) > 0 
                                        ? (detailedStats.scoreDistribution.high / (detailedStats.scoreDistribution.low + detailedStats.scoreDistribution.medium + detailedStats.scoreDistribution.high) * 100) 
                                        : 0}%`,
                                    transition: 'width 0.5s ease-in-out'
                                  }}
                                  aria-valuenow={detailedStats.scoreDistribution.high || 0} 
                                  aria-valuemin="0" 
                                  aria-valuemax="100"
                                  title={`Élevé: ${detailedStats.scoreDistribution.high || 0} évaluations`}
                                >
                                  {detailedStats.scoreDistribution.high > 0 && (detailedStats.scoreDistribution.low + detailedStats.scoreDistribution.medium + detailedStats.scoreDistribution.high) > 0 && (
                                    `${((detailedStats.scoreDistribution.high / (detailedStats.scoreDistribution.low + detailedStats.scoreDistribution.medium + detailedStats.scoreDistribution.high)) * 100).toFixed(0)}%`
                                  )}
                                </div>
                              </>
                            )}
                          </div>
                          <div className="d-flex justify-content-between mt-1 small text-muted">
                            <span>Faible (&lt;2.5)</span>
                            <span>Moyen</span>
                            <span>Élevé (&gt;4)</span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {showModal && selectedEvaluation && (
          <EvaluationDetailsModal
            evaluation={selectedEvaluation}
            onClose={closeModal}
          />
        )}
      </div>
    </Template>
  );
};

export default EvaluationHistory;