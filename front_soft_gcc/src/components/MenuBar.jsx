import React from 'react';
import { Link } from 'react-router-dom';

// Gestion des menu de navigation
function MenuBar({ task }) {
  return (
    <nav className="sidebar sidebar-offcanvas" id="sidebar">
      <ul className="nav">
        <li className="nav-item">
          <a className="nav-link" href="index.html">
            <span className="icon-bg"><i className="mdi mdi-cube menu-icon"></i></span>
            <span className="menu-title">Tableau de bord</span>
          </a>
        </li>
        <li className="nav-item">
          <Link to="/competences">
              <span className="icon-bg"><i className="mdi mdi-contacts menu-icon"></i></span>
              <span className="menu-title">Competences</span>
          </Link>
        </li>
        <li className="nav-item">
          <a className="nav-link" data-toggle="collapse" href="#ui-basic" aria-expanded="false" aria-controls="ui-basic">
            <span className="icon-bg"><i className="mdi mdi-crosshairs-gps menu-icon"></i></span>
            <span className="menu-title">Carrieres</span>
            <i className="menu-arrow"></i>
          </a>
          <div className="collapse" id="ui-basic">
            <ul className="nav flex-column sub-menu">
              <li className="nav-item"> 
                <a className="nav-link" href="pages/ui-features/buttons.html">Plan de carriere</a>
              </li>
              <li className="nav-item"> 
                <a className="nav-link" href="pages/ui-features/dropdowns.html">Suivi retraite</a>
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
              <div class="collapse" id="auth">
                <ul class="nav flex-column sub-menu">
                  <li class="nav-item"> <Link className="nav-link" to="/salary-list">Notation D'evaluation</Link></li>
                  <li class="nav-item"> <a class="nav-link" href="pages/samples/login.html"> Planning d'evaluations </a></li>
                  <li class="nav-item"> <a class="nav-link" href="pages/samples/login.html"> Historique d'evaluations </a></li>

              <div className="collapse" id="auth">
                <ul className="nav flex-column sub-menu">
                  <li className="nav-item"> <a className="nav-link" href="pages/samples/blank-page.html"> Blank Page </a></li>
                  <li className="nav-item"> <a className="nav-link" href="pages/samples/login.html"> Login </a></li>
                </ul>
              </div>
            </li>
        <li className="nav-item sidebar-user-actions">
          <div className="sidebar-user-menu">
            <a href="#" className="nav-link">
              <i className="mdi mdi-settings menu-icon"></i>
              <span className="menu-title">Parametres</span>
            </a>
          </div>
        </li>
        <li className="nav-item sidebar-user-actions">
          <div className="sidebar-user-menu">
            <a href="#" className="nav-link">
              <i className="mdi mdi-logout menu-icon"></i>
              <span className="menu-title">Se deconnecter</span>
            </a>
          </div>
        </li>
      </ul>
    </nav>
  );
}

export default MenuBar;
