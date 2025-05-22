import React from 'react';
import { Link } from 'react-router-dom';

// Gestion des menu de navigation
function MenuBar({ task }) {
  return (
    <nav className="sidebar sidebar-offcanvas" id="sidebar">
      <ul className="nav">
        <li className="nav-item">
          <Link className="nav-link" to="/softGcc/tableauBord">
            <span className="icon-bg"><i className="mdi mdi-view-grid menu-icon"></i></span>
            <span className="menu-title">Tableau de bord</span>
          </Link>
        </li>
        <li className="nav-item">
          <Link className="nav-link" to="/softGcc/competences">
            <span className="icon-bg"><i className="mdi mdi-school menu-icon"></i></span>
            <span className="menu-title">Compétences</span>
          </Link>
        </li>
        <li className="nav-item">
          <a className="nav-link" data-toggle="collapse" href="#ui-basic" aria-expanded="false" aria-controls="ui-basic">
            <span className="icon-bg"><i className="mdi mdi-crosshairs-gps menu-icon"></i></span>
            <span className="menu-title">Carrières</span>
            <i className="menu-arrow"></i>
          </a>
          <div className="collapse" id="ui-basic">
            <ul className="nav flex-column sub-menu">
              <li className="nav-item">
                <Link className="nav-link" to="/carriere">Plan de carrière</Link>
              </li>
              <li className="nav-item">
                <Link className="nav-link" to="/retraite">Depart a la retraite</Link>
              </li>
              <li className="nav-item">
                <Link className="nav-link" to="/softGcc/souhaitEvolution/suivi">Evolution de carrière</Link>
              </li>
            </ul>
          </div>
        </li>
        <li className="nav-item">
          <a className="nav-link" data-toggle="collapse" href="#certificate" aria-expanded="false" aria-controls="certificate">
            <span className="icon-bg"><i className="mdi mdi-certificate menu-icon"></i></span>
            <span className="menu-title">Gestion d'attestation</span>
            <i className="menu-arrow"></i>
          </a>
          <div className="collapse" id="certificate">
            <ul className="nav flex-column sub-menu">
              <li className="nav-item"> <Link className="nav-link" to="/softGcc/attestationManagement/list">Modèles d'attestations</Link></li>
              <li className="nav-item"> <Link className="nav-link" to="/softGcc/settings/carriere"> Signature électronique et sécurisation </Link></li>
              <li className="nav-item"> <Link className="nav-link" to="/softGcc/settings/employeeManagement/liste"> Archivage et historique </Link></li>
            </ul>
          </div>
        </li>
        <li className="nav-item">
          <a className="nav-link" data-toggle="collapse" href="#auth" aria-expanded="false" aria-controls="auth">
            <span className="icon-bg"><i className="mdi mdi-lock menu-icon"></i></span>
            <span className="menu-title">Evaluations</span>
            <i className="menu-arrow"></i>
          </a>
          <div className="collapse" id="auth">
            <ul className="nav flex-column sub-menu">
              <li className="nav-item"> <Link className="nav-link" to="/salary-list">Notation D'evaluation</Link></li>
              <li className="nav-item"> <Link className="nav-link" to="/planning"> Planning d'evaluations </Link></li>
              <li className="nav-item"> <Link className="nav-link" to="/homeInterview"> Entretien d'evaluations </Link></li>
              <li className="nav-item"> <Link className="nav-link" to="/history"> Historique d'evaluations </Link></li>
            </ul>
          </div>
        </li>
        <li className="nav-item">
          <Link className="nav-link" to="/softGcc/effectif">
            <span className="icon-bg"><i className="mdi mdi-sitemap menu-icon"></i></span>
            <span className="menu-title">Organigramme et effectif</span>
          </Link>
        </li>
        <li className="nav-item">
          <Link className="nav-link" to="/softGcc/activityHistory">
            <span className="icon-bg"><i className="mdi mdi-history menu-icon"></i></span>
            <span className="menu-title">Historiques des activités</span>
          </Link>
        </li>
        <li className="nav-item">
          <a className="nav-link" data-toggle="collapse" href="#settings" aria-expanded="false" aria-controls="settings">
            <span className="icon-bg"><i className="mdi mdi-settings menu-icon"></i></span>
            <span className="menu-title">Paramètres</span>
            <i className="menu-arrow"></i>
          </a>
          <div className="collapse" id="settings">
            <ul className="nav flex-column sub-menu">
              <li className="nav-item"> <Link className="nav-link" to="/softGcc/settings/competence">Gestion Compétences</Link></li>
              <li className="nav-item"> <Link className="nav-link" to="/softGcc/settings/carriere"> Gestion Carrières </Link></li>
              <li className="nav-item"> <Link className="nav-link" to="/softGcc/settings/employeeManagement/liste"> Gestion employés </Link></li>
              <li className="nav-item"> <Link className="nav-link" to="/EvaluationSettings"> Gestion des évaluations </Link></li>
              <li className="nav-item"> <Link className="nav-link" to="/user-management"> Gestion des utilisateurs </Link></li>


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
