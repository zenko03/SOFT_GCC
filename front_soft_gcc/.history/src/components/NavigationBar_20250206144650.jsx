import React, { useState, useEffect } from "react";
import { useNavigate } from 'react-router-dom';

import { jwtDecode } from 'jwt-decode';

// Affichage de la barre de navigation
function NavigationBar({ task }) {
  const navigate = useNavigate();
  const [userName, setUserName] = useState('');
  const [userEmail, setUserEmail] = useState('');

  // Déconnexion
  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  // Récupérer les infos utilisateur
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const decoded = jwtDecode(token);
        setUserEmail(decoded[ClaimTypes.Name]); // Ou decoded.name selon votre implémentation

        // Appel API pour récupérer les détails complets
        axios.get(`https://localhost:7082/api/Authentification/user?email=${decoded.email}`)
          .then(response => {
            setUserName(`${response.data.firstName} ${response.data.lastName}`);
          });
      } catch (error) {
        console.error('Erreur de décodage du token:', error);
      }
    }
  }, []);
  return (
    <nav className="navbar default-layout-navbar col-lg-12 col-12 p-0 fixed-top d-flex flex-row">
      <div className="text-center navbar-brand-wrapper d-flex align-items-center justify-content-center">
        <a className="navbar-brand brand-logo" href="index.html">
          <img src="/src/assets/images/Logo/softwellogo.png" alt="logo" />
        </a>
        <a className="navbar-brand brand-logo-mini" href="index.html">
          <img src="/src/assets/images/logo-mini.svg" alt="logo" />
        </a>
      </div>
      <div className="navbar-menu-wrapper d-flex align-items-stretch">
        <button className="navbar-toggler navbar-toggler align-self-center" type="button" data-toggle="minimize">
          <span className="mdi mdi-menu"></span>
        </button>

        <ul className="navbar-nav navbar-nav-right">


          <li className="nav-item dropdown">
            <a className="nav-link count-indicator dropdown-toggle" id="notificationDropdown" href="#" data-toggle="dropdown">
              <i className="mdi mdi-bell-outline"></i>
              <span className="count-symbol bg-danger"></span>
            </a>
            <div className="dropdown-menu dropdown-menu-right navbar-dropdown preview-list" aria-labelledby="notificationDropdown">
              <h6 className="p-3 mb-0 bg-primary text-white py-4">Notifications</h6>
              <div className="dropdown-divider"></div>
              <a className="dropdown-item preview-item">
                <div className="preview-thumbnail">
                  <div className="preview-icon bg-success">
                    <i className="mdi mdi-calendar"></i>
                  </div>
                </div>
                <div className="preview-item-content d-flex align-items-start flex-column justify-content-center">
                  <h6 className="preview-subject font-weight-normal mb-1">Event today</h6>
                  <p className="text-gray ellipsis mb-0">Just a reminder that you have an event today</p>
                </div>
              </a>
              <div className="dropdown-divider"></div>
              <a className="dropdown-item preview-item">
                <div className="preview-thumbnail">
                  <div className="preview-icon bg-warning">
                    <i className="mdi mdi-settings"></i>
                  </div>
                </div>
                <div className="preview-item-content d-flex align-items-start flex-column justify-content-center">
                  <h6 className="preview-subject font-weight-normal mb-1">Settings</h6>
                  <p className="text-gray ellipsis mb-0">Update dashboard</p>
                </div>
              </a>
              <div className="dropdown-divider"></div>
              <a className="dropdown-item preview-item">
                <div className="preview-thumbnail">
                  <div className="preview-icon bg-info">
                    <i className="mdi mdi-link-variant"></i>
                  </div>
                </div>
                <div className="preview-item-content d-flex align-items-start flex-column justify-content-center">
                  <h6 className="preview-subject font-weight-normal mb-1">Launch Admin</h6>
                  <p className="text-gray ellipsis mb-0">New admin wow!</p>
                </div>
              </a>
              <div className="dropdown-divider"></div>
              <h6 className="p-3 mb-0 text-center">See all notifications</h6>
            </div>
          </li>

          <li className="nav-item nav-profile dropdown">
            <a className="nav-link dropdown-toggle" id="profileDropdown" href="#" data-toggle="dropdown" aria-expanded="false">
              <div className="nav-profile-img">
                <img src="/src/assets/images/faces/face28.png" alt="image" />
              </div>
              <div className="nav-profile-text">
                <p className="mb-1 text-black">{userName || 'Chargement...'}</p>
              </div>
            </a>
            <div className="dropdown-menu navbar-dropdown dropdown-menu-right p-0 border-0 font-size-sm" aria-labelledby="profileDropdown" data-x-placement="bottom-end">
              <div className="p-3 text-center bg-primary">
                <img className="img-avatar img-avatar48 img-avatar-thumb" src="/src/assets/images/faces/face28.png" alt="" />
              </div>
              <div className="p-2">
                <div role="separator" className="dropdown-divider"></div>
                <h5 className="dropdown-header text-uppercase pl-2 text-dark mt-2">Actions</h5>
                <button
                  className="dropdown-item py-1 d-flex align-items-center justify-content-between"
                  onClick={handleLogout}
                >
                  <span>Se déconnecter</span>
                  <i className="mdi mdi-logout ml-1"></i>
                </button>
              </div>
            </div>
          </li>


        </ul>
        <button className="navbar-toggler navbar-toggler-right d-lg-none align-self-center" type="button" data-toggle="offcanvas">
          <span className="mdi mdi-menu"></span>
        </button>
      </div>
    </nav>
  );
}

export default NavigationBar;
