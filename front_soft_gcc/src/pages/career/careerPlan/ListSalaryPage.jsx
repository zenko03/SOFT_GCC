import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { urlApi } from '../../../helpers/utils';
import PageHeader from '../../../components/PageHeader';
import SearchForm from '../../../components/SearchForm';
import Template from '../../Template';
import pic1 from '/src/assets/images/faces-clipart/pic-1.png';
import '../../../styles/skillsStyle.css';
import Loader from '../../../helpers/Loader';
import '../../../styles/pagination.css';

// Page liste des competences
function ListSalaryPage() {
    // Url d'en-tete de page
    const module = "Plan de carrière";
    const action = "Employés";
    const url = "/carriere";

    // Initialisation des variables de states
    const [skills, setSkills] = useState([]);
    const [sortedSkills, setSortedSkills] = useState([]);
    const [sortDirection, setSortDirection] = useState('asc');
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize] = useState(10);
    const [totalPages, setTotalPages] = useState(0);
    const [searchTerm, setSearchTerm] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    /* useEffect(() => {
        fetchSkills();
    }, [currentPage, searchTerm]);

    // Appliquer le tri chaque fois que `sortDirection` ou `skills` change
    useEffect(() => {
        const sorted = [...skills].sort((a, b) => {
        const dateA = new Date(a.birthday);
        const dateB = new Date(b.birthday);
        return sortDirection === 'asc' ? dateA - dateB : dateB - dateA;
        });
        setSortedSkills(sorted);
    }, [sortDirection, skills]);
    */
    // Chargement des donnees de competences salaries
    const fetchSkills = async () => {
        setLoading(true);
        setError(null);

        try {
        /*const route = searchTerm ? '/EmployeeSkills/filter' : '/EmployeeSkills/list';
        const params = searchTerm
            ? { keyWord: searchTerm, pageNumber: currentPage, pageSize }
            : { pageNumber: currentPage, pageSize };

        const response = await axios.get(urlApi(route), { params });*/
        setSkills(null);
        setTotalPages(10);
        } catch (err) {
        setError("Erreur lors de la récupération des données.");
        } finally {
        setLoading(false);
        }
    };

    // Gerer les filtres par recherche
    const handleSearch = (term) => {
        setSearchTerm(term);
        setCurrentPage(1);
    };

    //Gerer le changement de page par pagination
    const handlePageChange = (newPage) => {
        if (newPage >= 1 && newPage <= totalPages) {
        setCurrentPage(newPage);
        }
    };

    // Gerer le tri par colonne
    const handleSort = () => {
        setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    };

    // Affichage des numeros de page de pagination
    const renderPageNumbers = () => {
        const pages = [];
        for (let i = 1; i <= totalPages; i++) {
        pages.push(
            <button
            key={i}
            className={`pagination-button ${i === currentPage ? 'active' : ''}`}
            onClick={() => handlePageChange(i)}
            >
            {i}
            </button>
        );
        }
        return pages;
    };


    const handleClick = () => {
        navigate('/carriere/creation'); 
    };

  return (
    <Template>
      {loading && <Loader />} {/* Affichez le loader lorsque `loading` est true */}
      
      <PageHeader module={module} action={action} url={url} />
      <div className="row">
        <div className="button-save-profil">
            <button type="button" onClick={handleClick} className="btn btn-success btn-fw">Plan de carrière</button>
        </div>
        <div className="col-lg-12 grid-margin stretch-card">
          <div className="card">
            <div className="card-body">
              <h4 className="card-title">Recherche salariés</h4>
              <SearchForm onSearch={handleSearch} />

              {error && <p className="text-danger">{error}</p>}

              {!loading && !error && (
                <>
                  <table className="table table-striped table-competences">
                    <thead>
                      <tr>
                        <th>Employé</th>
                        <th>Nom complet</th>
                        <th 
                          onClick={handleSort} 
                          style={{
                            cursor: 'pointer',
                            color: '#007bff',
                            fontWeight: 'bold',
                          }}
                          className="sortable-header"
                        >
                          Date d'affetation
                          <span style={{ marginLeft: '5px' }}>
                            {sortDirection === 'asc' ? '▲' : '▼'}
                          </span>
                        </th>
                        <th>Description</th>
                      </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td className="py-1">
                              <Link to={`/carriere/fiche`}>
                                <img src={pic1} alt="Profil" />
                              </Link>
                            </td>
                            <td>Jean rakoto</td>
                            <td>19/04/2023</td> {/* Affichez la vraie date de mise à jour */}
                            <td>Un peu de decscription a la lettre</td>
                          </tr>
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
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </Template>
  );
}

export default ListSalaryPage;
