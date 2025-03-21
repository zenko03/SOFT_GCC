import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import PageHeader from '../../../components/PageHeader';
import Template from '../../Template';
import '../../../styles/skillsStyle.css';
import Loader from '../../../helpers/Loader';
import '../../../styles/pagination.css';
import FormattedDate from '../../../helpers/FormattedDate';
import useSWR from 'swr';
import Fetcher from '../../../components/Fetcher';

// Fonction debounce pour éviter les appels excessifs
const debounce = (func, delay) => {
  let timeout;
  return (...args) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), delay);
  };
};

// Page liste des compétences
const ListCareerPage = () => {
  // URL en tête de page 
  const module = 'Plan de carrière';
  const action = 'Liste';
  const url = '/carriere';

  // Initialisation des variables d'états
  const [careers, setCareers] = useState([]);
  const [sortedCareers, setSortedCareers] = useState([]);
  const [sortDirection, setSortDirection] = useState('asc');
  const [sortColumn, setSortColumn] = useState('updatedDate');  
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(0);
  const [filters, setFilters] = useState({ keyWord: '', departmentId: '', positionId: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const { data: dataDepartment } = useSWR('/Department', Fetcher);
  const { data: dataPosition } = useSWR('/Position', Fetcher);
  const [paginationResult, setPaginationResult] = useState({
    totalRecords: 0,
    pageSize: 0,
    currentPage: 0,
    totalPages: 0
  });

  // Fetch des données filtrées
  const fetchFilteredData = useCallback(
    async (appliedFilters) => {
      setLoading(true);
      setError(null);

      try {
        const queryParams = new URLSearchParams({
          ...appliedFilters,
          page: currentPage,
          pageSize,
        }).toString();

        const response = await Fetcher(`/CareerPlan/filter?${queryParams}`);

        if (response.success) {
          setCareers(response.data);
          setTotalPages(response.totalPages || 0);
          setPaginationResult({
            totalRecords: response.totalCount,
            pageSize: response.pageSize,
            currentPage: response.currentPage,
            totalPages: response.totalPages
          });
        } else {
          setError(response.message || 'Erreur lors du chargement.');
          setCareers([]);
        }
      } catch (err) {
        setError(`Erreur inattendue : ${err.message}`);
        setCareers([]);
      } finally {
        setLoading(false);
      }
    },
    [currentPage, pageSize]
  );

  const debouncedFetchData = useCallback(debounce(fetchFilteredData, 300), [fetchFilteredData]);

  // Mise à jour des données au changement de filtres
  useEffect(() => {
    debouncedFetchData(filters);
  }, [filters, debouncedFetchData]);

  // Mise à jour des données triées
  // Appliquer le tri chaque fois que `sortDirection` ou `careers` change
    useEffect(() => {
        const sorted = [...careers].sort((a, b) => {
          const valueA = a[sortColumn];
          const valueB = b[sortColumn];
    
          if (sortColumn === 'assignmentDate') {
            const dateA = new Date(valueA);
            const dateB = new Date(valueB);
            return sortDirection === 'asc' ? dateA - dateB : dateB - dateA;
          } else {
            if (valueA < valueB) return sortDirection === 'asc' ? -1 : 1;
            if (valueA > valueB) return sortDirection === 'asc' ? 1 : -1;
            return 0;
          }
        });
        setSortedCareers(sorted);
      }, [sortDirection, careers, sortColumn]);

  // Gestion des filtres
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  // Gestion de la pagination
  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

  const handleSort = (column) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(column);
      setSortDirection('asc');
    }
  };

  const handleClick = () => navigate('/carriere/creation');

  // Navigation pour details carrieres
  const handleCareersDetails = (registrationNumber) => {
    navigate(`/carriere/fiche/${registrationNumber}`);
  };

  return (
    <Template>
      {loading && <Loader />}
      <PageHeader module={module} action={action} url={url} />
      {error && <div className="alert alert-danger">{error}</div>}

      <div className="row header-title">
        <div className="col-lg-10 skill-header">
          <i className="mdi mdi-map-marker-path skill-icon"></i>
          <h4 className="skill-title">PLAN DE CARRIÈRE</h4>
        </div>
        <div className="col-lg-2">
          <button className="btn-add btn-success btn-fw" onClick={handleClick} style={{float: 'right'}}>
            <i className="mdi mdi-plus"></i>
            Nouveau Plan
          </button>
        </div>  
      </div>
      <div className="card mb-4 search-card">
        <div className="card-header title-container">
          <h5 className="title">
            <i className="mdi mdi-filter-outline"></i> Filtres
          </h5>
        </div>
        <div className="card-body">
          <form className="filter-form">
            <div className="form-group">
              <label>Nom, prénom ou matricule</label>
              <input
                type="text"
                className="form-control"
                placeholder="Recherche..."
                name="keyWord"
                value={filters.keyWord}
                onChange={handleFilterChange}
              />
            </div>
            <div className="form-group">
              <label>Département</label>
              <select
                name="departmentId"
                className="form-control"
                value={filters.departmentId}
                onChange={handleFilterChange}
              >
                <option value="">Tous les département</option>
                {dataDepartment?.map((dept) => (
                  <option key={dept.departmentId} value={dept.departmentId}>
                    {dept.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label>Poste </label>
              <select
                name="positionId"
                className="form-control"
                value={filters.positionId}
                onChange={handleFilterChange}
              >
                <option value="">Tous les postes</option>
                {dataPosition?.map((pos) => (
                  <option key={pos.positionId} value={pos.positionId}>
                    {pos.positionName}
                  </option>
                ))}
              </select>
            </div>
          </form>
        </div>
      </div>

      <div className="card">
        <div className="card-header title-container">
          <h5 className="title">
            <i className="mdi mdi-format-list-bulleted"></i> Liste des employés ayant des plans de carrières
          </h5>
        </div>
        <div className="card-body">
          {!loading && (
            <>
              <table className="table table-competences">
                <thead>
                  <tr>
                    <th onClick={() => handleSort('registrationNumber')} className="sortable-header">
                      Matricule {sortColumn === 'registrationNumber' ? (sortDirection === 'asc' ? '▲' : '▼') : ''}
                    </th>
                    <th onClick={() => handleSort('firstName')} className="sortable-header">
                      Nom complet {sortColumn === 'firstName' ? (sortDirection === 'asc' ? '▲' : '▼') : ''}
                    </th>
                    <th onClick={() => handleSort('departmentName')} className="sortable-header">
                      Département {sortColumn === 'departmentName' ? (sortDirection === 'asc' ? '▲' : '▼') : ''}
                    </th>
                    <th onClick={() => handleSort('positionName')} className="sortable-header">
                      Poste {sortColumn === 'positionName' ? (sortDirection === 'asc' ? '▲' : '▼') : ''}
                    </th>
                    <th onClick={() => handleSort('assignmentDate')} className="sortable-header">
                      Date d'affectation {sortColumn === 'assignmentDate' ? (sortDirection === 'asc' ? '▲' : '▼') : ''}
                    </th>
                    <th onClick={() => handleSort('careerPlan')} className="sortable-header">
                      Plan de carrière {sortColumn === 'careerPlan' ? (sortDirection === 'asc' ? '▲' : '▼') : ''}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {sortedCareers.length ? (
                    sortedCareers.map((career, id) => (
                      <tr key={id} onClick={() => {handleCareersDetails(career.registrationNumber)}}>
                        <td>{career.registrationNumber}</td>
                        <td>
                          {career.firstName} {career.name}
                        </td>
                        <td>{career.departmentName}</td>
                        <td>{career.positionName}</td>
                        <td>
                          <FormattedDate date={career.assignmentDate} />
                        </td>
                        <td>{career.careerPlanNumber}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="6" className="text-center">
                        Aucun résultat trouvé.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>

              <div className="pagination">
                <h4>{paginationResult.totalRecords} resultats aux totals</h4>
                <button onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 1}>
                  Précédent
                </button>
                {Array.from({ length: totalPages }, (_, i) => (
                  <button
                    key={i + 1}
                    className={`pagination-button ${i + 1 === currentPage ? 'active' : ''}`}
                    onClick={() => handlePageChange(i + 1)}
                  >
                    {i + 1}
                  </button>
                ))}
                <button onClick={() => handlePageChange(currentPage + 1)} disabled={currentPage === totalPages}>
                  Suivant
                </button>
                <h4>Page {paginationResult.currentPage} sur {paginationResult.totalPages} pour {paginationResult.pageSize} resultats</h4>
              </div>
            </>
          )}
        </div>
      </div>
    </Template>
  );
};

export default ListCareerPage;
