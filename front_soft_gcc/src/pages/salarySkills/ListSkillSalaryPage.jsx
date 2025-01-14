import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { urlApi } from '../../helpers/utils';
import PageHeader from '../../components/PageHeader';
import SearchForm from '../../components/SearchForm';
import Template from '../Template';
import pic1 from '/src/assets/images/faces-clipart/pic-1.png';
import '../../styles/skillsStyle.css';
import Loader from '../../helpers/Loader';
import '../../styles/pagination.css';

// Page liste des competences
function ListSkillSalaryPage() {
  // Url d'en-tete de page
  const module = "Compétences";
  const action = "Liste";
  const url = "/competences";

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

  useEffect(() => {
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

  // Chargement des donnees de competences salaries
  const fetchSkills = async () => {
    setLoading(true);
    setError(null);

    try {
      const route = searchTerm ? '/EmployeeSkills/filter' : '/EmployeeSkills/list';
      const params = searchTerm
        ? { keyWord: searchTerm, pageNumber: currentPage, pageSize }
        : { pageNumber: currentPage, pageSize };

      const response = await axios.get(urlApi(route), { params });
      setSkills(response.data.data);
      setTotalPages(response.data.totalPages);
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

  return (
    <Template>
      {loading && <Loader />} {/* Affichez le loader lorsque `loading` est true */}
      
      <PageHeader module={module} action={action} url={url} />
      <div className="row">
        <div className="col-lg-12 grid-margin stretch-card">
          <div className="card">
            <div className="card-body">
              <h4 className="card-title">NOMBRE DES COMPETENCES SALARIES</h4>
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
                          Dernière mise à jour
                          <span style={{ marginLeft: '5px' }}>
                            {sortDirection === 'asc' ? '▲' : '▼'}
                          </span>
                        </th>
                        <th>Diplômes & formations</th>
                        <th>Compétences</th>
                        <th>Langues</th>
                        <th>Autres</th>
                      </tr>
                    </thead>
                    <tbody>
                      {sortedSkills.length > 0 ? (
                        sortedSkills.map((item, id) => (
                          <tr key={id}>
                            <td className="py-1">
                              <Link to={`/competences/profil/${item.employeeId}`}>
                                <img src={pic1} alt="Profil" />
                              </Link>
                            </td>
                            <td>{item.firstName} {item.name}</td>
                            <td>{new Date(item.birthday).toLocaleDateString()}</td> {/* Affichez la vraie date de mise à jour */}
                            <td>{item.educationNumber}</td>
                            <td>{item.skillNumber}</td>
                            <td>{item.languageNumber}</td>
                            <td>{item.otherFormationNumber}</td>
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
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </Template>
  );
}

export default ListSkillSalaryPage;
