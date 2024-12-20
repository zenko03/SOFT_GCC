import React, { useState, useEffect, useCallback } from 'react';
import PageHeader from '../../components/PageHeader';
import Template from '../Template';
import '../../styles/skillsStyle.css';
import '../../styles/pagination.css';
import ChartLine from '../../components/ChartLine';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { urlApi } from '../../helpers/utils';
import Loader from '../../helpers/Loader';
import '../../styles/pagination.css';
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

// Fonction pour initialiser les données du graphe
function initializeGraph(setWishesEvolutionGraph) {
  setWishesEvolutionGraph([
    { month: 1, monthLetter: 'Jan', DemandRequestValue: 0 },
    { month: 2, monthLetter: 'Fév', DemandRequestValue: 0 },
    { month: 3, monthLetter: 'Mar', DemandRequestValue: 0 },
    { month: 4, monthLetter: 'Avr', DemandRequestValue: 0 },
    { month: 5, monthLetter: 'Mai', DemandRequestValue: 0 },
    { month: 6, monthLetter: 'Juin', DemandRequestValue: 0 },
    { month: 7, monthLetter: 'Juil', DemandRequestValue: 0 },
    { month: 8, monthLetter: 'Août', DemandRequestValue: 0 },
    { month: 9, monthLetter: 'Sep', DemandRequestValue: 0 },
    { month: 10, monthLetter: 'Oct', DemandRequestValue: 0 },
    { month: 11, monthLetter: 'Nov', DemandRequestValue: 0 },
    { month: 12, monthLetter: 'Déc', DemandRequestValue: 0 },
  ]);
}

// Page de suivi des souhaits d'évolution
function FollowedWishEvolution() {
  const module = 'Souhait évolution';
  const action = 'Suivi';
  const url = '/SouhaitEvolution/Suivi';
  const navigate = useNavigate();

  // États principaux
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [wishesEvolution, setWishesEvolution] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [wishesEvolutionGraph, setWishesEvolutionGraph] = useState([]);
  const [dataGraph, setDataGraph] = useState([]);
  const currentYear = new Date().getFullYear();

  // États pour les filtres
  const [filters, setFilters] = useState({
    keyWord: '',
    dateRequestMin: '',
    dateRequestMax: '',
    wishTypeId: '',
    positionId: '',
    priority: '',
    state: '',
    year: currentYear,
  });

  // Données pour les options de filtres
  const { data: dataWishType } = useSWR('/WishType', Fetcher);
  const { data: dataPosition } = useSWR('/Position', Fetcher);

  // Gestion des filtres
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prevFilters) => ({ ...prevFilters, [name]: value }));
  };

  // Fetch des données avec filtres
  const fetchFilteredData = useCallback(
    async (appliedFilters) => {
      setLoading(true);
      setError(null);

      try {
        const queryParams = new URLSearchParams({
          ...appliedFilters,
          page: currentPage,
        }).toString();
        const response = await Fetcher(`/WishEvolution/filter?${queryParams}`);
        console.log(response);
        if (response.success) {
          setWishesEvolution(response.data);
          setTotalPages(response.totalPages);
        } else {
          setWishesEvolution([]);
          setError(response.message);
        }
      } catch (err) {
        setWishesEvolution([]);
        setError('Erreur inattendue : ' + err.message);
      } finally {
        setLoading(false);
      }
    },
    [currentPage]
  );

  // Fetch des données pour le graphe
  const fetchFilteredGraph = useCallback(async () => {
    setLoading(true);
    try {
      const response = await Fetcher(`/WishEvolution/graphe/${filters.year}`);
      setDataGraph(response || []);

    } catch (err) {
      console.log(err.message);
      setError('Erreur inattendue : ' + err.message);
      setDataGraph([]);
    } finally {
      setLoading(false);
    }
  }, [filters.year]);

  // Débouncer les appels
  const debouncedFetchData = useCallback(debounce(fetchFilteredData, 1000), [
    fetchFilteredData,
  ]);
  const debouncedFetchGraph = useCallback(debounce(fetchFilteredGraph, 1000), [
    fetchFilteredGraph,
  ]);

  // Effet pour synchroniser les données du graphe
  useEffect(() => {
    initializeGraph(setWishesEvolutionGraph);
    if (dataGraph.length > 0) {
      const updatedGraph = wishesEvolutionGraph.map((entry) => {
        const match = dataGraph.find((data) => data.month === entry.month);
        return match
          ? { ...entry, DemandRequestValue: match.totalRequests }
          : entry;
      });
      setWishesEvolutionGraph(updatedGraph);
    }
  }, [dataGraph]);

  // Effet pour déclencher les fetch
  useEffect(() => {
    debouncedFetchData(filters);
  }, [filters, debouncedFetchData]);

  useEffect(() => {
    debouncedFetchGraph();
  }, [filters.year, debouncedFetchGraph]);

  // Navigation pour ajout
  const handleClick = () => {
    navigate('/softGcc/souhaitEvolution/ajouter');
  };

  // Pagination
  const renderPageNumbers = () => {
    const pages = [];
    for (let i = 1; i <= totalPages; i++) {
      pages.push(
        <button
          key={i}
          className={`pagination-button ${i === currentPage ? 'active' : ''}`}
          onClick={() => setCurrentPage(i)}
        >
          {i}
        </button>
      );
    }
    return pages;
  };

    return (
        <Template>
          {loading && <Loader />} {/* Affichez le loader lorsque `loading` est true */}
          
          <PageHeader module={module} action={action} url={url} />
          <div className='row'>
            <div className='col-lg-6'>
              <h4 className="card-title">DEMANDE SOUHAIT EVOLUTION</h4>
            </div>
            <div className='col-lg-6'>
              <div className="action-buttons text-right my-1">
                <button type="button" onClick={handleClick} className="btn btn-success btn-fw">Ajouter</button>
              </div>
            </div>
          </div>
          <div className="row">
            <div className="col-lg-12 grid-margin stretch-card">
              <div className="card">
                <div className="card-body">
                  <form className="form-sample">
                    <div className="form-group row">
                      <div className="col-sm-6">
                        <input
                          type="text"
                          className="form-control"
                          placeholder="Nom, prénom ou matricule"
                          name="keyWord"
                          value={filters.keyWord}
                          onChange={handleFilterChange}
                        />
                      </div>
                      <div className="col-sm-3">
                        <input
                          type="date"
                          className="form-control"
                          placeholder="Date demande min"
                          name="dateRequestMin"
                          value={filters.dateRequestMin}
                          onChange={handleFilterChange}
                        />
                      </div>
                      <div className="col-sm-3">
                        <input
                          type="date"
                          className="form-control"
                          placeholder="Date demande max"
                          name="dateRequestMax"
                          value={filters.dateRequestMax}
                          onChange={handleFilterChange}
                        />
                      </div>
                    </div>
                    <div className="form-group row">
                      <div className="col-sm-3">
                        <select
                          name="wishTypeId"
                          className="form-control"
                          value={filters.wishTypeId}
                          onChange={handleFilterChange}
                        >
                          <option value="">Filtrer par type de souhait</option>
                          {dataWishType?.map((item) => (
                            <option key={item.wishTypeId} value={item.wishTypeId}>
                              {item.designation}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div className="col-sm-3">
                        <select
                          name="positionId"
                          className="form-control"
                          value={filters.positionId}
                          onChange={handleFilterChange}
                        >
                          <option value="">Filtrer par poste souhaité</option>
                          {dataPosition?.map((item) => (
                            <option key={item.positionId} value={item.positionId}>
                              {item.positionName}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div className="col-sm-3">
                        <select
                          name="priority"
                          className="form-control"
                          value={filters.priority}
                          onChange={handleFilterChange}
                        >
                          <option value="">Filtrer par priorite</option>
                          <option value="1">Bas</option>
                          <option value="5">Moyen</option>
                          <option value="10">Elevé</option>
                        </select>
                      </div>
                      <div className="col-sm-3">
                        <select
                          name="state"
                          className="form-control"
                          value={filters.state}
                          onChange={handleFilterChange}
                        >
                          <option value="">Filtrer par status</option>
                          <option value="1">En attente</option>
                          <option value="5">En cours</option>
                          <option value="10">Validé</option>
                          <option value="0">Refusé</option>
                        </select>
                      </div>
                    </div>
                  </form>
    
                      <table className="table table-competences">
                        <thead>
                          <tr>
                            <th>Matricule</th>
                            <th>Employe</th>
                            <th>Type souhait</th>
                            <th>Poste souhaite</th>
                            <th>Priorite</th>
                            <th>Date de demande</th>
                            <th>Statut</th>
                          </tr>
                        </thead>
                        <tbody>
                          {wishesEvolution?.length > 0 ? (
                            wishesEvolution.map((item) => (
                              <tr key={item.wishEvolutionCareerId}>
                                <Link to={`/softGcc/souhaitEvolution/details/${item.wishEvolutionCareerId}`}>
                                  <td>{item.registrationNumber}</td>
                                </Link>
                                <td>{item.firstName} {item.name}</td>
                                <td>{item.wishTypeName}</td>
                                <td style={{color: '#B8860B'}}>{item.wishPositionName}</td>
                                <td>{item.priorityLetter}</td>
                                <td>{new Date(item.requestDate).toLocaleDateString()}</td>
                                {item.state === 1 ? (
                                  <td><label className="badge badge-warning">{item.stateLetter}</label ></td>
                                ) : item.state === 5 ? (
                                  <td><label className="badge badge-warning">{item.stateLetter}</label ></td>
                                ) : item.state === 10 ? (
                                  <td><label className="badge badge-success">{item.stateLetter}</label ></td>
                                ) : (
                                  <td><label className="badge badge-danger">{item.stateLetter}</label ></td>
                                )}
                              </tr>
                            ))
                          ) : (
                            <tr>
                              <td colSpan="7" className="text-center">Aucun résultat trouvé.</td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                      <div className="pagination">
                        <button onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 1}>
                          Précédent
                        </button>
                        {renderPageNumbers()}
                        <button onClick={() => handlePageChange(currentPage + 1)} disabled={currentPage === totalPages}>
                          Suivant
                        </button>
                      </div>
                </div>
              </div>
            </div>
          </div>
          
          <h4 className="card-title">GRAPHE DE DEMANDE SOUHAIT D'EVOLUTION</h4>
          <div className="row justify-content-center">
            <div className="col-lg-12 grid-margin stretch-card">
              <div className="card shadow-sm border-0">
                <div className="card-body">
                  <h4 className="card-title text-left">Analyse des demandes par mois</h4>
                  <p className="card-description text-left">Un aperçu des demandes au cours de l'année</p>
                  <div className="form-group row">
                    <div className="col-sm-3">
                      <select
                        name="year"
                        className="form-control"
                        value={filters.year}
                        onChange={handleFilterChange}
                      >
                        <option selected value="2024">2024</option>
                        <option value="2023">2023</option>
                        <option value="2022">2022</option>
                        <option value="2021">2021</option>
                        <option value="2020">2020</option>
                      </select>
                    </div>
                  </div>
                  <ChartLine data={wishesEvolutionGraph} year={filters.year}/>
                </div>
              </div>
            </div>
          </div>
        </Template>
      );
}

export default FollowedWishEvolution;