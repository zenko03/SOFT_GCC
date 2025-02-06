import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import PageHeader from '../../../components/PageHeader';
import SearchForm from '../../../components/SearchForm';
import Template from '../../Template';
import pic1 from '/src/assets/images/faces-clipart/pic-1.png';
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
  const module = 'Plan de carrière';
  const action = 'Liste';
  const url = '/carriere';

  const [careers, setCareers] = useState([]);
  const [sortedCareers, setSortedCareers] = useState([]);
  const [sortDirection, setSortDirection] = useState('asc');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(0);
  const [filters, setFilters] = useState({ keyWord: '', departmentId: '', positionId: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const navigate = useNavigate();
  const { data: dataDepartment } = useSWR('/Department', Fetcher);
  const { data: dataPosition } = useSWR('/Position', Fetcher);

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
  useEffect(() => {
    const sorted = [...careers].sort((a, b) => {
      const dateA = new Date(a.assignmentDate);
      const dateB = new Date(b.assignmentDate);
      return sortDirection === 'asc' ? dateA - dateB : dateB - dateA;
    });
    setSortedCareers(sorted);
  }, [careers, sortDirection]);

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

  const handleSort = () => setSortDirection((prev) => (prev === 'asc' ? 'desc' : 'asc'));

  const handleClick = () => navigate('/carriere/creation');

  // Navigation pour details carrieres
  const handleCareersDetails = (registrationNumber) => {
    navigate(`/carriere/fiche/${registrationNumber}`);
  };

  return (
    <Template>
      {loading && <Loader />}
      <PageHeader module={module} action={action} url={url} />

      <div className="row my-3">
        <div className="col-lg-10">
          <h4 className="card-title">PLAN DE CARRIÈRE</h4>
        </div>
        <div className="col-lg-2 text-end">
          <button className="btn btn-success btn-fw" onClick={handleClick}>
            Nouveau Plan
          </button>
        </div>
      </div>

      <div className="card mb-4">
        <div className="card-body">
          <h5 className="card-title">Filtres</h5>
          <form>
            <div className="row">
              <div className="col-md-4 mb-3">
                <input
                  type="text"
                  className="form-control"
                  placeholder="Nom, prénom ou matricule"
                  name="keyWord"
                  value={filters.keyWord}
                  onChange={handleFilterChange}
                />
              </div>
              <div className="col-md-4 mb-3">
                <select
                  name="departmentId"
                  className="form-control"
                  value={filters.departmentId}
                  onChange={handleFilterChange}
                >
                  <option value="">Filtrer par département</option>
                  {dataDepartment?.map((dept) => (
                    <option key={dept.departmentId} value={dept.departmentId}>
                      {dept.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="col-md-4">
                <select
                  name="positionId"
                  className="form-control"
                  value={filters.positionId}
                  onChange={handleFilterChange}
                >
                  <option value="">Filtrer par poste</option>
                  {dataPosition?.map((pos) => (
                    <option key={pos.positionId} value={pos.positionId}>
                      {pos.positionName}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </form>
        </div>
      </div>

      <div className="card">
        <div className="card-body">
          <h5 className="card-title">Carrières</h5>
          {error && <p className="text-danger">{error}</p>}
          {!loading && (
            <>
              <table className="table table-competences">
                <thead>
                  <tr>
                    <th>Employé</th>
                    <th>Nom complet</th>
                    <th>Département</th>
                    <th>Poste</th>
                    <th onClick={handleSort} style={{ cursor: 'pointer' }}>
                      Date d'affectation {sortDirection === 'asc' ? '▲' : '▼'}
                    </th>
                    <th>Plan de carrière</th>
                  </tr>
                </thead>
                <tbody>
                  {sortedCareers.length ? (
                    sortedCareers.map((career, id) => (
                      <tr key={id} onClick={() => {handleCareersDetails(career.registrationNumber)}}>
                        <td>
                            <img src={pic1} alt="Profil" />
                        </td>
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
              </div>
            </>
          )}
        </div>
      </div>
    </Template>
  );
};

export default ListCareerPage;
