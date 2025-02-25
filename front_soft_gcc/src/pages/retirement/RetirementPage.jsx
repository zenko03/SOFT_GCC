import React, { useState, useEffect, useCallback } from 'react';
import PageHeader from '../../components/PageHeader';
import Template from '../Template';
import '../../styles/skillsStyle.css';
import Loader from '../../helpers/Loader';
import '../../styles/pagination.css';
import ModalParameter from '../../components/retirement/ModalParameter';
import Fetcher from '../../components/Fetcher';
import useSWR from 'swr';
import FormattedDate from '../../helpers/FormattedDate';

// Fonction debounce pour éviter les appels excessifs
function debounce(func, delay) {
  let timeout;
  return (...args) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), delay);
  };
}

function RetirementPage() {
  const module = "Retraite";
  const action = "Liste";
  const url = "/retraite";

  const [filters, setFilters] = useState({
    keyWord: '',
    civiliteId: '',
    departmentId: '',
    positionId: '',
    age: '',
    year: '',
  });

  const [dataRetirement, setDataRetirement] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showParameter, setShowParameter] = useState(false);
  const [sortedDataRetirement, setSortedDataRetirement] = useState([]);
  const [sortDirection, setSortDirection] = useState('asc');
  const [sortColumn, setSortColumn] = useState('updatedDate');

  // Récupération des options pour les filtres
  const { data: dataCivilite } = useSWR('/Civilite', Fetcher);
  const { data: dataDepartment } = useSWR('/Department', Fetcher);
  const { data: dataPosition } = useSWR('/Position', Fetcher); 
  
  const [paginationResult, setPaginationResult] = useState({
    totalRecords: 0,
    pageSize: 0,
    currentPage: 0,
    totalPages: 0
  });

  // Fonction de mise à jour des filtres
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prevFilters) => ({ ...prevFilters, [name]: value }));
  };

  // Fonction de recherche des données avec filtres
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

        const response = await Fetcher(`/Retirement/filter?${queryParams}`);

        if (response.success) {
          setDataRetirement(response.data);
          setError(null);
          setTotalPages(response.totalPages || 0);
          setPaginationResult({
            totalRecords: response.totalCount,
            pageSize: response.pageSize,
            currentPage: response.currentPage,
            totalPages: response.totalPages
          });
        } else {
          setError(response.message + " " + response.details);
          setDataRetirement(null);
        }
      } catch (err) {
        setError("Erreur inattendue lors du chargement des données : " + err.message);
        setDataRetirement(null);
      } finally {
        setLoading(false);
      }
    },
    [currentPage, pageSize]
  );

  // Mise à jour des données triées
  // Appliquer le tri chaque fois que `sortDirection` ou `careers` change
  useEffect(() => {
    const sorted = [...dataRetirement].sort((a, b) => {
    const valueA = a[sortColumn];
    const valueB = b[sortColumn];
      
    if (sortColumn === 'dateDepart') {
      const dateA = new Date(valueA);
      const dateB = new Date(valueB);
      return sortDirection === 'asc' ? dateA - dateB : dateB - dateA;
    } else {
        if (valueA < valueB) return sortDirection === 'asc' ? -1 : 1;
        if (valueA > valueB) return sortDirection === 'asc' ? 1 : -1;
          return 0;
        }
      });
        setSortedDataRetirement(sorted);
  }, [sortDirection, dataRetirement, sortColumn]);
  

  // Débouncer la recherche avec un délai de 3 secondes
  const debouncedFetchData = useCallback(debounce(fetchFilteredData, 3000), [fetchFilteredData]);

  // Déclencher la recherche à chaque modification des filtres
  useEffect(() => {
    debouncedFetchData(filters);
  }, [filters, debouncedFetchData]);

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

  return (
    <Template>
      {loading && <Loader />}
      <ModalParameter Fetcher={Fetcher} showParameter={showParameter} handleCloseParameter={() => setShowParameter(false)} fetchFilteredData={fetchFilteredData} />
      <PageHeader module={module} action={action} url={url} />
       
      <div className="row header-title">
        <div className="col-lg-10 skill-header">
          <i className="mdi mdi-calendar-check skill-icon"></i>
          <h4 className="skill-title">DÉPART À LA RETRAITE</h4>
        </div>
        <div className="col-lg-2">
          <button className="btn-add btn-success btn-fw" type="button" onClick={() => setShowParameter(true)}>
            <i className="mdi mdi-settings"></i>
              Paramètre
          </button>
        </div>  
      </div>
      <div className="row">
        <div className="col-lg-12 grid-margin stretch-card">
          <div className="card search-card">
            <div className="card-header title-container">
              <h5 className="title">
                <i className="mdi mdi-filter-outline"></i> Filtres
              </h5>
            </div>
            <div className="card-body">
              <form className="form-sample">
                <div className="form-group row">
                  <div className="col-sm-4">
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Nom, prénom ou matricule"
                      name="keyWord"
                      value={filters.keyWord}
                      onChange={handleFilterChange}
                    />
                  </div>
                  <div className="col-sm-4">
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Âge, ex: 24 ou 20-50"
                      name="age"
                      value={filters.age}
                      onChange={handleFilterChange}
                    />
                  </div>
                  <div className="col-sm-4">
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Année, ex: 2024 ou 2030-2040"
                      name="year"
                      value={filters.year}
                      onChange={handleFilterChange}
                    />
                  </div>
                </div>
                <div className="form-group row">
                  <div className="col-sm-4">
                    <select
                      name="civiliteId"
                      className="form-control"
                      value={filters.civiliteId}
                      onChange={handleFilterChange}
                    >
                      <option value="">Filtrer par civilité</option>
                      {dataCivilite?.map((item) => (
                        <option key={item.civiliteId} value={item.civiliteId}>
                          {item.civiliteName}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="col-sm-4">
                    <select
                      name="departmentId"
                      className="form-control"
                      value={filters.departmentId}
                      onChange={handleFilterChange}
                    >
                      <option value="">Filtrer par département</option>
                      {dataDepartment?.map((item) => (
                        <option key={item.departmentId} value={item.departmentId}>
                          {item.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="col-sm-4">
                    <select
                      name="positionId"
                      className="form-control"
                      value={filters.positionId}
                      onChange={handleFilterChange}
                    >
                      <option value="">Filtrer par poste</option>
                      {dataPosition?.map((item) => (
                        <option key={item.positionId} value={item.positionId}>
                          {item.positionName}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </form>
              {error && <p className="text-danger">{error}</p>}
            </div>
          </div>
        </div>
      </div>

      <div className="row">
        <div className="col-lg-12 grid-margin stretch-card">
          <div className="card">
            <div className="card-header title-container">
              <h5 className="title">
                <i className="mdi mdi-format-list-bulleted"></i> Liste
              </h5>
            </div>
            <div className="card-body">
              {dataRetirement?.length > 0 ? (
                <>
                  <table className="table table-competences">
                    <thead>
                      <tr>
                        <th onClick={() => handleSort('civiliteName')} className="sortable-header">
                          Civilité {sortColumn === 'civiliteName' ? (sortDirection === 'asc' ? '▼' : '▲') : ''}
                        </th>
                        <th onClick={() => handleSort('name')} className="sortable-header">
                          Nom complet {sortColumn === 'name' ? (sortDirection === 'asc' ? '▼' : '▲') : ''}
                        </th>
                        <th onClick={() => handleSort('registrationNumber')} className="sortable-header">
                          Matricule {sortColumn === 'registrationNumber' ? (sortDirection === 'asc' ? '▼' : '▲') : ''}
                        </th>
                        <th onClick={() => handleSort('departmentName')} className="sortable-header">
                          Département {sortColumn === 'departmentName' ? (sortDirection === 'asc' ? '▼' : '▲') : ''}
                        </th>
                        <th onClick={() => handleSort('positionName')} className="sortable-header">
                          Poste {sortColumn === 'positionName' ? (sortDirection === 'asc' ? '▼' : '▲') : ''}
                        </th>
                        <th onClick={() => handleSort('age')} className="sortable-header">
                          Âge {sortColumn === 'age' ? (sortDirection === 'asc' ? '▼' : '▲') : ''}
                        </th>
                        <th onClick={() => handleSort('dateDepart')} className="sortable-header">
                          Départ à la retraite {sortColumn === 'dateDepart' ? (sortDirection === 'asc' ? '▼' : '▲') : ''}
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                        {sortedDataRetirement.length ? (
                          sortedDataRetirement.map((item, index) => (
                            <tr key={index}>
                              <td>{item.civiliteName}</td>
                              <td style={{color: '#58d8a3'}}>{`${item.name} ${item.firstName}`}</td>
                              <td>{item.registrationNumber}</td>
                              <td>{item.departmentName}</td>
                              <td>{item.positionName}</td>
                              <td>{item.age}</td>
                              <td style={{color: '#57c7d4'}}><FormattedDate date={item.dateDepart} /></td>
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
              ) : (
                !error && <p>{error}</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </Template>
  );
}

export default RetirementPage;
