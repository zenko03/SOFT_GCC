import React from 'react';
import { Link, useLocation } from 'react-router-dom';

// Gestion des menu de navigation
function MenuBar() {
  const location = useLocation();
  const currentPath = location.pathname;
  
  // Fonction pour vérifier si un lien est actif
  const isActiveLink = (path) => {
    return currentPath === path || currentPath.startsWith(path + '/');
  };

  // Fonction pour vérifier si un menu déroulant contient le lien actif
  const isActiveDropdown = (paths) => {
    return paths.some(path => currentPath.startsWith(path));
  };

  // Style pour le lien actif
  const activeLinkStyle = {
    backgroundColor: 'rgba(26, 115, 232, 0.1)',
    borderLeft: '4px solid #1a73e8',
    color: '#1a73e8'
  };

  return (
    <nav className="sidebar sidebar-offcanvas" id="sidebar">
      <ul className="nav">
        <li className={`nav-item ${isActiveLink('/softGcc/tableauBord') ? 'active' : ''}`}>
          <Link 
            className="nav-link" 
            to="/softGcc/tableauBord"
            style={isActiveLink('/softGcc/tableauBord') ? activeLinkStyle : {}}
          >
            <span className="icon-bg"><i className="mdi mdi-view-grid menu-icon"></i></span>
            <span className="menu-title">Tableau de bord</span>
          </Link>
        </li>
        <li className={`nav-item ${isActiveLink('/softGcc/competences') ? 'active' : ''}`}>
          <Link 
            className="nav-link" 
            to="/softGcc/competences"
            style={isActiveLink('/softGcc/competences') ? activeLinkStyle : {}}
          >
            <span className="icon-bg"><i className="mdi mdi-school menu-icon"></i></span>
            <span className="menu-title">Compétences</span>
          </Link>
        </li>
        <li className="nav-item">
          <a 
            className={`nav-link ${isActiveDropdown(['/carriere', '/retraite', '/softGcc/souhaitEvolution']) ? 'active' : ''}`} 
            data-toggle="collapse" 
            href="#ui-basic" 
            aria-expanded={isActiveDropdown(['/carriere', '/retraite', '/softGcc/souhaitEvolution'])} 
            aria-controls="ui-basic"
            style={isActiveDropdown(['/carriere', '/retraite', '/softGcc/souhaitEvolution']) ? activeLinkStyle : {}}
          >
            <span className="icon-bg"><i className="mdi mdi-crosshairs-gps menu-icon"></i></span>
            <span className="menu-title">Carrières</span>
            <i className="menu-arrow"></i>
          </a>
          <div className={`collapse ${isActiveDropdown(['/carriere', '/retraite', '/softGcc/souhaitEvolution']) ? 'show' : ''}`} id="ui-basic">
            <ul className="nav flex-column sub-menu">
              <li className="nav-item">
                <Link 
                  className={`nav-link ${isActiveLink('/carriere') ? 'active-submenu' : ''}`} 
                  to="/carriere"
                  style={isActiveLink('/carriere') ? {color: '#1a73e8', fontWeight: '600'} : {}}
                >
                  Plan de carrière
                </Link>
              </li>
              <li className="nav-item">
                <Link 
                  className={`nav-link ${isActiveLink('/retraite') ? 'active-submenu' : ''}`} 
                  to="/retraite"
                  style={isActiveLink('/retraite') ? {color: '#1a73e8', fontWeight: '600'} : {}}
                >
                  Depart a la retraite
                </Link>
              </li>
              <li className="nav-item">
                <Link 
                  className={`nav-link ${isActiveLink('/softGcc/souhaitEvolution/suivi') ? 'active-submenu' : ''}`} 
                  to="/softGcc/souhaitEvolution/suivi"
                  style={isActiveLink('/softGcc/souhaitEvolution/suivi') ? {color: '#1a73e8', fontWeight: '600'} : {}}
                >
                  Evolution de carrière
                </Link>
              </li>
            </ul>
          </div>
        </li>
        <li className="nav-item">
          <a 
            className={`nav-link ${isActiveDropdown(['/softGcc/attestationManagement', '/softGcc/settings/carriere', '/softGcc/settings/employeeManagement']) ? 'active' : ''}`} 
            data-toggle="collapse" 
            href="#certificate" 
            aria-expanded={isActiveDropdown(['/softGcc/attestationManagement', '/softGcc/settings/carriere', '/softGcc/settings/employeeManagement'])} 
            aria-controls="certificate"
            style={isActiveDropdown(['/softGcc/attestationManagement', '/softGcc/settings/carriere', '/softGcc/settings/employeeManagement']) ? activeLinkStyle : {}}
          >
            <span className="icon-bg"><i className="mdi mdi-certificate menu-icon"></i></span>
            <span className="menu-title">Gestion d'attestation</span>
            <i className="menu-arrow"></i>
          </a>
          <div className={`collapse ${isActiveDropdown(['/softGcc/attestationManagement', '/softGcc/settings/carriere', '/softGcc/settings/employeeManagement']) ? 'show' : ''}`} id="certificate">
            <ul className="nav flex-column sub-menu">
              <li className="nav-item"> 
                <Link 
                  className={`nav-link ${isActiveLink('/softGcc/attestationManagement/list') ? 'active-submenu' : ''}`} 
                  to="/softGcc/attestationManagement/list"
                  style={isActiveLink('/softGcc/attestationManagement/list') ? {color: '#1a73e8', fontWeight: '600'} : {}}
                >
                  Modèles d'attestations
                </Link>
              </li>
              <li className="nav-item"> 
                <Link 
                  className={`nav-link ${isActiveLink('/softGcc/settings/carriere') ? 'active-submenu' : ''}`} 
                  to="/softGcc/settings/carriere"
                  style={isActiveLink('/softGcc/settings/carriere') ? {color: '#1a73e8', fontWeight: '600'} : {}}
                > 
                  Signature électronique et sécurisation 
                </Link>
              </li>
              <li className="nav-item"> 
                <Link 
                  className={`nav-link ${isActiveLink('/softGcc/settings/employeeManagement/liste') ? 'active-submenu' : ''}`} 
                  to="/softGcc/settings/employeeManagement/liste"
                  style={isActiveLink('/softGcc/settings/employeeManagement/liste') ? {color: '#1a73e8', fontWeight: '600'} : {}}
                > 
                  Archivage et historique 
                </Link>
              </li>
            </ul>
          </div>
        </li>
        <li className="nav-item">
          <a 
            className={`nav-link ${isActiveDropdown(['/salary-list', '/planning', '/homeInterview', '/history']) ? 'active' : ''}`} 
            data-toggle="collapse" 
            href="#auth" 
            aria-expanded={isActiveDropdown(['/salary-list', '/planning', '/homeInterview', '/history'])} 
            aria-controls="auth"
            style={isActiveDropdown(['/salary-list', '/planning', '/homeInterview', '/history']) ? activeLinkStyle : {}}
          >
            <span className="icon-bg"><i className="mdi mdi-lock menu-icon"></i></span>
            <span className="menu-title">Evaluations</span>
            <i className="menu-arrow"></i>
          </a>
          <div className={`collapse ${isActiveDropdown(['/salary-list', '/planning', '/homeInterview', '/history']) ? 'show' : ''}`} id="auth">
            <ul className="nav flex-column sub-menu">
              <li className="nav-item"> 
                <Link 
                  className={`nav-link ${isActiveLink('/salary-list') ? 'active-submenu' : ''}`} 
                  to="/salary-list"
                  style={isActiveLink('/salary-list') ? {color: '#1a73e8', fontWeight: '600'} : {}}
                >
                  Notation D'evaluation
                </Link>
              </li>
              <li className="nav-item"> 
                <Link 
                  className={`nav-link ${isActiveLink('/planning') ? 'active-submenu' : ''}`} 
                  to="/planning"
                  style={isActiveLink('/planning') ? {color: '#1a73e8', fontWeight: '600'} : {}}
                > 
                  Planning d'evaluations 
                </Link>
              </li>
              <li className="nav-item"> 
                <Link 
                  className={`nav-link ${isActiveLink('/homeInterview') ? 'active-submenu' : ''}`} 
                  to="/homeInterview"
                  style={isActiveLink('/homeInterview') ? {color: '#1a73e8', fontWeight: '600'} : {}}
                > 
                  Entretien d'evaluations 
                </Link>
              </li>
              <li className="nav-item"> 
                <Link 
                  className={`nav-link ${isActiveLink('/history') ? 'active-submenu' : ''}`} 
                  to="/history"
                  style={isActiveLink('/history') ? {color: '#1a73e8', fontWeight: '600'} : {}}
                > 
                  Historique d'evaluations 
                </Link>
              </li>
            </ul>
          </div>
        </li>
        <li className={`nav-item ${isActiveLink('/softGcc/effectif') ? 'active' : ''}`}>
          <Link 
            className="nav-link" 
            to="/softGcc/effectif"
            style={isActiveLink('/softGcc/effectif') ? activeLinkStyle : {}}
          >
            <span className="icon-bg"><i className="mdi mdi-sitemap menu-icon"></i></span>
            <span className="menu-title">Organigramme et effectif</span>
          </Link>
        </li>
        <li className={`nav-item ${isActiveLink('/softGcc/activityHistory') ? 'active' : ''}`}>
          <Link 
            className="nav-link" 
            to="/softGcc/activityHistory"
            style={isActiveLink('/softGcc/activityHistory') ? activeLinkStyle : {}}
          >
            <span className="icon-bg"><i className="mdi mdi-history menu-icon"></i></span>
            <span className="menu-title">Historiques des activités</span>
          </Link>
        </li>
        <li className="nav-item">
          <a 
            className={`nav-link ${isActiveDropdown(['/softGcc/settings']) ? 'active' : ''}`} 
            data-toggle="collapse" 
            href="#settings" 
            aria-expanded={isActiveDropdown(['/softGcc/settings', '/EvaluationSettings', '/user-management'])} 
            aria-controls="settings"
            style={isActiveDropdown(['/softGcc/settings', '/EvaluationSettings', '/user-management']) ? activeLinkStyle : {}}
          >
            <span className="icon-bg"><i className="mdi mdi-settings menu-icon"></i></span>
            <span className="menu-title">Paramètres</span>
            <i className="menu-arrow"></i>
          </a>
          <div className={`collapse ${isActiveDropdown(['/softGcc/settings', '/EvaluationSettings', '/user-management']) ? 'show' : ''}`} id="settings">
            <ul className="nav flex-column sub-menu">
              <li className="nav-item"> 
                <Link 
                  className={`nav-link ${isActiveLink('/softGcc/settings/competence') ? 'active-submenu' : ''}`} 
                  to="/softGcc/settings/competence"
                  style={isActiveLink('/softGcc/settings/competence') ? {color: '#1a73e8', fontWeight: '600'} : {}}
                >
                  Gestion Compétences
                </Link>
              </li>
              <li className="nav-item"> 
                <Link 
                  className={`nav-link ${isActiveLink('/softGcc/settings/carriere') ? 'active-submenu' : ''}`} 
                  to="/softGcc/settings/carriere"
                  style={isActiveLink('/softGcc/settings/carriere') ? {color: '#1a73e8', fontWeight: '600'} : {}}
                > 
                  Gestion Carrières 
                </Link>
              </li>
              <li className="nav-item"> 
                <Link 
                  className={`nav-link ${isActiveLink('/softGcc/settings/employeeManagement/liste') ? 'active-submenu' : ''}`} 
                  to="/softGcc/settings/employeeManagement/liste"
                  style={isActiveLink('/softGcc/settings/employeeManagement/liste') ? {color: '#1a73e8', fontWeight: '600'} : {}}
                > 
                  Gestion employés 
                </Link>
              </li>
              <li className="nav-item"> 
                <Link 
                  className={`nav-link ${isActiveLink('/EvaluationSettings') ? 'active-submenu' : ''}`} 
                  to="/EvaluationSettings"
                  style={isActiveLink('/EvaluationSettings') ? {color: '#1a73e8', fontWeight: '600'} : {}}
                > 
                  Gestion des évaluations 
                </Link>
              </li>
              <li className="nav-item"> 
                <Link 
                  className={`nav-link ${isActiveLink('/user-management') ? 'active-submenu' : ''}`} 
                  to="/user-management"
                  style={isActiveLink('/user-management') ? {color: '#1a73e8', fontWeight: '600'} : {}}
                > 
                  Gestion des utilisateurs 
                </Link>
              </li>
            </ul>
          </div>
        </li>
        <li className="nav-item sidebar-user-actions">
          <div className="sidebar-user-menu">
            <a href="#" className="nav-link">
              <i className="mdi mdi-logout menu-icon"></i>
              <span className="menu-title">Se déconnecter</span>
            </a>
          </div>
        </li>
      </ul>
    </nav>
  );
}

export default MenuBar;
