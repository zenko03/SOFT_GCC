import React from 'react';
import { Link } from 'react-router-dom';

// Gestion des menu de navigation
function MenuBar({ task }) {
  return (
    <nav className="sidebar sidebar-offcanvas" id="sidebar">
      <ul className="nav">
        <li className="nav-item">
          <Link className="nav-link" to="/softGcc/tableauBord">
            <span className="icon-bg"><i className="mdi mdi-cube menu-icon"></i></span>
            <span className="menu-title">Tableau de bord</span>
          </Link>
        </li>
        <li className="nav-item">
          <Link className="nav-link" to="/competences">
            <span className="icon-bg"><i className="mdi mdi-contacts menu-icon"></i></span>
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
          <a className="nav-link" data-toggle="collapse" href="#auth" aria-expanded="false" aria-controls="auth">
            <span className="icon-bg"><i className="mdi mdi-lock menu-icon"></i></span>
            <span className="menu-title">Evaluations</span>
            <i className="menu-arrow"></i>
          </a>
          <div className="collapse" id="auth">
            <ul className="nav flex-column sub-menu">
              <li className="nav-item"> <Link className="nav-link" to="/salary-list">Notation D'evaluation</Link></li>
              <li className="nav-item"> <Link className="nav-link" to="/planning"> Planning d'evaluations </Link></li>
              <li className="nav-item"> <Link className="nav-link" to="/validation"> Entretien d'evaluations </Link></li>
              <li className="nav-item"> <Link className="nav-link" to="/history"> Historique d'evaluations </Link></li>
            </ul>
          </div>
        </li>
        <li className="nav-item">
          <a className="nav-link" href="index.html">
            <span className="icon-bg"><i className="mdi mdi-cube menu-icon"></i></span>
            <span className="menu-title">Organigramme</span>
          </a>
        </li>
        <li className="nav-item sidebar-user-actions">
          <div className="sidebar-user-menu">
            <a href="#" className="nav-link">
              <i className="mdi mdi-settings menu-icon"></i>
              <span className="menu-title">Paramètres</span>
            </a>
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
