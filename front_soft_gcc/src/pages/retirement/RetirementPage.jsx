import React, { useState, useEffect, useCallback } from 'react';
import PageHeader from '../../components/PageHeader';
import Template from '../Template';
import '../../styles/skillsStyle.css';
import Loader from '../../helpers/Loader';
import '../../styles/pagination.css';
import ModalParameter from '../../components/retirement/ModalParameter';
import Fetcher from '../../components/Fetcher';
import useSWR from 'swr';

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

  const [dataRetirement, setDataRetirement] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(10);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showParameter, setShowParameter] = useState(false);

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
        console.log(`https://localhost:7082/api/Retirement/filter?${queryParams}`);

        if (response.success) {
          setDataRetirement(response.data);
          setError(null);
        } else {
          setError(response.message);
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

  // Débouncer la recherche avec un délai de 3 secondes
  const debouncedFetchData = useCallback(debounce(fetchFilteredData, 3000), [fetchFilteredData]);

  // Déclencher la recherche à chaque modification des filtres
  useEffect(() => {
    debouncedFetchData(filters);
  }, [filters, debouncedFetchData]);

  // Récupération des options pour les filtres
  const { data: dataCivilite } = useSWR('/Civilite', Fetcher);
  const { data: dataDepartment } = useSWR('/Department', Fetcher);
  const { data: dataPosition } = useSWR('/Position', Fetcher);

  const totalPages = dataRetirement?.totalCount
    ? Math.ceil(dataRetirement.totalCount / pageSize)
    : 0;

  return (
    <Template>
      {loading && <Loader />}
      <ModalParameter showParameter={showParameter} handleCloseParameter={() => setShowParameter(false)} fetchFilteredData={fetchFilteredData} />
      <PageHeader module={module} action={action} url={url} />
      <div className="row">
        <div className='col-lg-10' style={{marginTop: '20px'}}>
          <h4 className="card-title">DÉPART À LA RETRAITE</h4>
        </div>
        <div className='col-lg-2'>
          <div className="button-save-profil">
            <button onClick={() => setShowParameter(true)} type="button" className="btn btn-success btn-fw">
              Paramètre
            </button>
          </div>
        </div>
        <div className="col-lg-12 grid-margin stretch-card">
          <div className="card">
            <div className="card-body">
              <form className="form-sample">
                <h6 className="card-title subtitle">Filtre</h6>
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
            <div className="card-body">
              <h6 className="card-title subtitle">Liste</h6>
                {dataRetirement?.length > 0 ? (
                  <>
                    <table className="table table-competences">
                      <thead>
                        <tr>
                          <th>Civilité</th>
                          <th>Nom complet</th>
                          <th>Matricule</th>
                          <th>Département</th>
                          <th>Poste</th>
                          <th>Âge</th>
                          <th>Départ à la retraite</th>
                        </tr>
                      </thead>
                      <tbody>
                        {dataRetirement.map((item, index) => (
                          <tr key={index}>
                            <td>{item.civiliteName}</td>
                            <td>{`${item.name} ${item.firstName}`}</td>
                            <td>{item.registrationNumber}</td>
                            <td>{item.departmentName}</td>
                            <td>{item.positionName}</td>
                            <td>{item.age}</td>
                            <td style={{color: '#B8860B'}}>{new Date(item.dateDepart).toLocaleDateString()}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    <div className="pagination">
                      {[...Array(totalPages)].map((_, index) => (
                        <button
                          key={index}
                          className={`page-button ${index + 1 === currentPage ? 'active' : ''}`}
                          onClick={() => setCurrentPage(index + 1)}
                        >
                          {index + 1}
                        </button>
                      ))}
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
