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
import { FaFileExcel, FaFilePdf, FaFileCsv, FaSearch, FaFilter, FaChartBar } from 'react-icons/fa';

const API_BASE_URL = 'https://localhost:7082/api/EvaluationHistory';

const LoadingBar = () => (
  <div className="loading-bar-container">
    <div className="loading-bar"></div>
  </div>
);

const KpiCard = ({ title, value, icon, color }) => (
  <div className="kpi-card" style={{ borderLeft: `4px solid ${color}` }}>
    <div className="kpi-icon" style={{ color }}>
      {icon}
    </div>
    <div className="kpi-content">
      <h6>{title}</h6>
      <p className="kpi-value" style={{ color }}>{value}</p>
    </div>
  </div>
);

const EvaluationHistory = () => {
  // États pour les fonctionnalités d'export
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

  // Récupération des départements
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
      console.error('Erreur lors de la récupération des KPI  :', err);
    }
  }, [filters]);

  // Récupération des évaluations
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
            <PerformanceGraph evaluations={evaluations} />
            {/* Modal pour les détails d'évaluation */}
            {showModal && (
              <EvaluationDetailsModal
                evaluation={selectedEvaluation}
                onClose={() => setShowModal(false)}
              />
            )}
          </div>
        )}
      </div>
    </Template>
  );
};

export default EvaluationHistory;