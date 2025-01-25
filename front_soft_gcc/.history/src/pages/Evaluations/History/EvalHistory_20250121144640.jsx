import React, { useState, useEffect } from 'react';
import Template from '../../Template';
import PerformanceGraph from './PerformanceGraph';
import GlobalPerformanceGraph from './GlobalPerformanceGraph';
import '../../../assets/css/Evaluations/EvaluationHistory.css';
import axios from 'axios';
import EvaluationDetailsModal from './EvaluationDetailsModal';


const EvaluationHistory = () => {
  const [format, setFormat] = useState("csv"); // Format par défaut
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [loadingExport, setLoadingExport] = useState(false);


  const [selectedEvaluation, setSelectedEvaluation] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState({
    evaluationDate: '',
    status: '',
    position: '',
  });
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const [evaluations, setEvaluations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [showModal, setShowModal] = useState(false);

  const [kpiData, setKpiData] = useState({
    participationRate: 0,
    approvalRate: 0,
    overallAverage: 0,
  });

  const fetchKpis = async () => {
    try {
      const response = await axios.get(
        'https://localhost:7082/api/EvaluationHistory/kpis',
        {
          params: {
            startDate: filters.evaluationDate || null,
            department: filters.position || '',
          },
        }
      );
      setKpiData(response.data);
    } catch (err) {
      console.error('Erreur lors de la récupération des KPI :', err);
    }
  };

  // Appeler les KPI au chargement initial
  useEffect(() => {
    fetchKpis();
  }, [filters]);


  useEffect(() => {
    const fetchEvaluations = async () => {
      setLoading(true);
      try {
        const response = await axios.get(
          'https://localhost:7082/api/EvaluationHistory/history',
          {
            params: {
              startDate: filters.evaluationDate || null,
              evaluationType: '',
              department: filters.position || '',
              employeeName: searchQuery || '',
            },
          }
        );
        setEvaluations(response.data);
        setError(null);
      } catch (err) {
        setError('Erreur lors du chargement des évaluations');
      } finally {
        setLoading(false);
      }
    };

    fetchEvaluations();
  }, [searchQuery, filters]);

  const handleSearchChange = (e) => setSearchQuery(e.target.value);
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  const filteredEvaluations = evaluations
    .filter((emp) =>
      emp.firstName.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .filter((emp) =>
      filters.evaluationDate ? emp.startDate === filters.evaluationDate : true
    )
    .filter((emp) =>
      filters.status
        ? emp.status.toLowerCase() === filters.status.toLowerCase()
        : true
    )
    .filter((emp) =>
      filters.position
        ? emp.position.toLowerCase().includes(filters.position.toLowerCase())
        : true
    );

  const totalPages = Math.ceil(filteredEvaluations.length / itemsPerPage);
  const paginatedEvaluations = filteredEvaluations.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleDetailsClick = async (evaluationId) => {
    try {
      // Remplacez par l'URL correcte de votre API
      const response = await axios.get(`https://localhost:7082/api/EvaluationHistory/detail/${evaluationId}`);

      console.log("Données récupérées :", response.data);

      // Mettez à jour l'état avec les détails de l'évaluation
      setSelectedEvaluation(response.data);

      // Affichez la modal
      setShowModal(true);
    } catch (error) {
      console.error("Erreur lors du chargement des détails :", error);
    }
  };

  const handleExport = async (exportFormat) => {
    try {
      setLoadingExport(true); // Activer le chargement
      const response = await axios.get("https://localhost:7082/api/EvaluationHistory/export", {
        params: {
          format: exportFormat,
          startDate: startDate || undefined,
          endDate: endDate || undefined,
        },
        responseType: "blob", // Requis pour le téléchargement de fichiers
      });

      // Extraire le nom du fichier
      const fileName =
        response.headers["content-disposition"]
          ?.split("filename=")[1]
          ?.replace(/"/g, "") || `export.${exportFormat}`;

      // Sauvegarder le fichier téléchargé
      FileSaver.saveAs(response.data, fileName);
    } catch (error) {
      console.error("Erreur lors de l'exportation :", error);
    } finally {
      setLoadingExport(false); // Désactiver le chargement
    }
  };



  if (error) {
    return (
      <Template>
        <div className="alert alert-danger">{error}</div>
      </Template>
    );
  }

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
            <button
              className="btn btn-outline-primary btn-sm"
              onClick={() => fetchKpis()}
            >
              Rafraîchir
            </button>
          </div>
          <div className="card-body">
            <div className="row text-center">
              <div className="col-md-4">
                <div className="kpi-card">
                  <h6>Taux de Participation</h6>
                  <p className="kpi-value">
                    {kpiData.participationRate.toFixed(2)}%
                  </p>
                </div>
              </div>
              <div className="col-md-4">
                <div className="kpi-card">
                  <h6>Taux d'Approbation</h6>
                  <p className="kpi-value">{kpiData.approvalRate.toFixed(2)}%</p>
                </div>
              </div>
              <div className="col-md-4">
                <div className="kpi-card">
                  <h6>Moyenne Générale</h6>
                  <p className="kpi-value">{kpiData.overallAverage.toFixed(2)}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="card shadow mb-4">
          <div className="card-header">
            <h5 className="mb-0">Filtres</h5>

            <div className="btn-group">
              <button
                className="btn btn-outline-success btn-sm"
                onClick={() => handleExport("pdf")}
              >
                Exporter en PDF
              </button>
              <button
                className="btn btn-outline-primary btn-sm"
                onClick={() => handleExport("excel")}
              >
                Exporter en Excel
              </button>
            </div>
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
                <input
                  type="text"
                  name="position"
                  className="form-control mx-1"
                  placeholder="Poste"
                  value={filters.position}
                  onChange={handleFilterChange}
                />
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
                      <th>Statut</th>
                      <th>Note</th>
                      <th>Type d'evaluation</th>

                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedEvaluations.map((emp) => (
                      <tr key={emp.evaluationId}>
                        <td>{emp.firstName}</td>
                        <td>{emp.position}</td>
                        <td>{emp.startDate}</td>
                        <td>{emp.status}</td>
                        <td>{emp.overallScore}</td>
                        <td>{emp.evaluationType}</td>

                        <td>
                          <button
                            className="btn btn-info btn-sm"
                            onClick={() => handleDetailsClick(emp.evaluationId)}
                          >
                            Détails
                          </button>                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {/* Details de l'evaluation */}
                {showModal && selectedEvaluation && (
                  <EvaluationDetailsModal
                    evaluation={selectedEvaluation}
                    onClose={closeModal}
                  />
                )}

                <div className="d-flex justify-content-between mt-3">
                  <button
                    className="btn btn-secondary"
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage((prev) => prev - 1)}
                  >
                    Précédent
                  </button>
                  <span>
                    Page {currentPage} sur {totalPages || 1}
                  </span>
                  <button
                    className="btn btn-secondary"
                    disabled={currentPage === totalPages}
                    onClick={() => setCurrentPage((prev) => prev + 1)}
                  >
                    Suivant
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Placeholder for Future Graphs */}
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
