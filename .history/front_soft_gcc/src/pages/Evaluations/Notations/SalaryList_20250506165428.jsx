import { useState, useEffect } from 'react';
import Template from '../../Template';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../../../assets/css/Evaluations/notationModal.css';
import '../../../assets/css/Evaluations/Questions.css';
import '../../../assets/css/Evaluations/Steps.css';
import { FaSort, FaSortUp, FaSortDown } from 'react-icons/fa'; // Import des icônes de tri

// Styles locaux pour les fonctionnalités de tri
const styles = {
  sortable: {
    cursor: 'pointer',
    userSelect: 'none',
    position: 'relative',
    paddingRight: '20px',
    transition: 'background-color 0.2s ease',
  },
  sortableActive: {
    backgroundColor: 'rgba(63, 81, 181, 0.05)',
  },
  sortIcon: {
    position: 'absolute',
    right: '6px',
    top: '50%',
    transform: 'translateY(-50%)',
    color: '#aaa',
    fontSize: '0.8rem',
    transition: 'transform 0.2s ease, color 0.2s ease',
  },
  sortIconActive: {
    color: '#3f51b5',
    fontSize: '0.9rem',
  },
  sortIconAsc: {
    transform: 'translateY(-50%) rotate(0deg)',
  },
  sortIconDesc: {
    transform: 'translateY(-50%) rotate(0deg)',
  }
};

function SalaryList() {
  const navigate = useNavigate();
  const [employees, setEmployees] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  
  // PAGINATION
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(0);

  // État pour le tri
  const [sortConfig, setSortConfig] = useState({
    key: null,
    direction: null
  });

  // Chargement initial des employés
  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        const response = await axios.get('https://localhost:7082/api/User/vemployee-details-paginated', {
          params: {
            pageNumber: currentPage,
            pageSize: pageSize,
          },
        });
        setEmployees(response.data.employees);
        setTotalPages(response.data.totalPages);
      } catch (error) {
        console.error('Erreur lors de la récupération des employés :', error);
      }
    };
    fetchEmployees();
  }, [currentPage, pageSize]);

  // Cette fonction redirige maintenant vers la page d'évaluation au lieu d'ouvrir un modal
  const handleOpenEvaluation = (employeeId, evaluationId) => {
    // Log pour voir les données de l'employé sélectionné
    const selectedEmployee = employees.find(emp => emp.employeeId === employeeId || emp.evaluationId === evaluationId);
    console.log('Données employé sélectionné:', selectedEmployee);
    
    // Si un evaluationId est fourni, on l'utilise, sinon on utilise l'employeeId
    const path = evaluationId 
      ? `/evaluations/notation/evaluation/${evaluationId}`
      : `/evaluations/notation/employee/${employeeId}`;
    
    navigate(path);
  };

  const handleSearch = (e) => {
    let query_text = e.target.value.toLowerCase();
    setSearchQuery(query_text.trim());
  };

  // Fonction pour gérer le tri
  const requestSort = (key) => {
    let direction = 'ascending';
    
    if (sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    } else if (sortConfig.key === key && sortConfig.direction === 'descending') {
      direction = null;
    }
    
    setSortConfig({ key, direction });
  };

  // Fonction pour obtenir l'icône de tri appropriée
  const getSortIcon = (columnName) => {
    let iconStyle = { ...styles.sortIcon };
    
    if (sortConfig.key === columnName) {
      iconStyle = { 
        ...iconStyle, 
        ...styles.sortIconActive,
        ...(sortConfig.direction === 'ascending' ? styles.sortIconAsc : styles.sortIconDesc) 
      };
    }
    
    if (sortConfig.key !== columnName) {
      return <FaSort style={iconStyle} />;
    }
    
    return sortConfig.direction === 'ascending' ? 
      <FaSortUp style={iconStyle} /> : 
      <FaSortDown style={iconStyle} />;
  };

  // Fonction pour obtenir le style d'une colonne triable
  const getSortableThStyle = (columnName) => {
    return {
      ...styles.sortable,
      ...(sortConfig.key === columnName ? styles.sortableActive : {})
    };
  };

  // Filtrer et trier les employés
  const sortedFilteredEmployees = () => {
    let filteredData = employees.filter((employee) => {
      const fullName = `${employee.firstName} ${employee.lastName}`.toLowerCase();
      return fullName.includes(searchQuery);
    });

    if (sortConfig.key && sortConfig.direction) {
      filteredData.sort((a, b) => {
        if (sortConfig.key === 'evaluationDate') {
          const dateA = a.evaluationDate ? new Date(a.evaluationDate).getTime() : 0;
          const dateB = b.evaluationDate ? new Date(b.evaluationDate).getTime() : 0;
          
          if (dateA === dateB) return 0;
          
          if (sortConfig.direction === 'ascending') {
            return dateA > dateB ? 1 : -1;
          } else {
            return dateA < dateB ? 1 : -1;
          }
        }
        
        if (sortConfig.key === 'name') {
          const nameA = `${a.firstName} ${a.lastName}`.toLowerCase();
          const nameB = `${b.firstName} ${b.lastName}`.toLowerCase();
          
          if (nameA === nameB) return 0;
          
          if (sortConfig.direction === 'ascending') {
            return nameA > nameB ? 1 : -1;
          } else {
            return nameA < nameB ? 1 : -1;
          }
        }
        
        if (sortConfig.key === 'position') {
          const posA = (a.position || '').toLowerCase();
          const posB = (b.position || '').toLowerCase();
          
          if (posA === posB) return 0;
          
          if (sortConfig.direction === 'ascending') {
            return posA > posB ? 1 : -1;
          } else {
            return posA < posB ? 1 : -1;
          }
        }
        
        return 0;
      });
    }
    
    return filteredData;
  };

  return (
    <Template>
      <div className="row">
        <div className="col-lg-12 grid-margin stretch-card">
          <div className="card">
            <div className="card-body">
              <h4 className="card-title">Notation d&apos;évaluation des employés</h4>
              {/* Barre de recherche et filtres */}
              <div className="filters card p-3 mb-4">
                <div className="d-flex align-items-center justify-content-between">
                  <input
                    type="text"
                    className="form-control w-25"
                    placeholder="Rechercher un employé..."
                    value={searchQuery}
                    onChange={handleSearch}
                  />
                </div>
              </div>
              <table className="table table-striped">
                <thead>
                  <tr>
                    <th>Employee</th>
                    <th style={getSortableThStyle('name')}>
                      Nom
                      {getSortIcon('name')}
                    </th>
                    <th style={getSortableThStyle('position')}>
                      Poste
                      {getSortIcon('position')}
                    </th>
                    <th style={getSortableThStyle('evaluationDate')}>
                      Dates d&apos;évaluation 
                      {getSortIcon('evaluationDate')}
                    </th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {sortedFilteredEmployees().map((employee, index) => (
                    <tr key={`${employee.employeeId}-${index}`}>
                      <td>
                        <img src="../../assets/images/faces-clipart/pic-1.png" alt="employee" />
                      </td>
                      <td>{employee.firstName} {employee.lastName}</td>
                      <td>{employee.position}</td>
                      <td>
                        {employee.evaluationDate
                          ? new Date(employee.evaluationDate).toLocaleDateString()
                          : 'Aucune évaluation'}
                      </td>
                      <td>
                        <button 
                          className="btn btn-primary" 
                          onClick={() => handleOpenEvaluation(employee.employeeId, employee.evaluationId)}
                        >
                          Notation
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <div className="pagination-controls">
                <button
                  onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                >
                  Précédent
                </button>
                <span>
                  Page {currentPage} sur {totalPages}
                </span>
                <button
                  onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                >
                  Suivant
                </button>
                <select
                  value={pageSize}
                  onChange={(e) => {
                    setPageSize(Number(e.target.value));
                    setCurrentPage(1); // Réinitialiser à la première page lorsque la taille de la page change
                  }}
                >
                  <option value={5}>5 par page</option>
                  <option value={10}>10 par page</option>
                  <option value={20}>20 par page</option>
                  <option value={50}>50 par page</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Template>
  );
}

export default SalaryList;
