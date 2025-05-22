import { useNavigate } from "react-router-dom";
import Template from "../../Template";
import { FaUsers, FaUsersCog, FaUserShield } from "react-icons/fa"; // Icônes pour la gestion des utilisateurs
import "../../styles/skillsStyle.css"; // Import des styles pour settings-card

function UserManagement() {
    const navigate = useNavigate();

    const handleUsersClick = () => {
        navigate("/users-list");
    };

    const handleRolesClick = () => {
        navigate("/roles-management");
    };

    const handlePermissionsClick = () => {
        navigate("/permissions-management");
    };

    // Style des cartes avec un thème jaune comme les autres pages de paramétrage
    const cardStyle = {
        backgroundColor: '#fde826', // Jaune vif comme dans settings-card
        color: '#333',
        transition: 'all 0.3s ease',
        cursor: 'pointer',
        padding: '20px',
        boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
        borderRadius: '8px',
        height: '100%',
        minHeight: '120px',
        marginBottom: '20px'
    };

    // Style pour le hover
    const hoverStyle = {
        transform: 'translateY(-5px)',
        boxShadow: '0 6px 18px rgba(0,0,0,0.15)'
    };

    return (
        <Template>
            <div className='row mb-4'>
                <div className="col-12 skill-header">
                    <i className="mdi mdi-account-key skill-icon"></i>
                    <h4 className="skill-title">GESTION DES UTILISATEURS</h4>
                </div>
            </div>

            <div className="row">
                {/* Carte Gestion des Utilisateurs */}
                <div className="col-md-4 mb-4">
                    <div
                        className="card"
                        style={cardStyle}
                        onClick={handleUsersClick}
                        onMouseOver={(e) => {
                            Object.assign(e.currentTarget.style, {...cardStyle, ...hoverStyle});
                        }}
                        onMouseOut={(e) => {
                            Object.assign(e.currentTarget.style, cardStyle);
                        }}
                    >
                        <div className="card-body text-center">
                            <FaUsers size={40} className="mb-3 text-dark" />
                            <h5 className="card-title">Gestion des Utilisateurs</h5>
                            <p className="card-text">Créer, modifier et supprimer des utilisateurs</p>
                        </div>
                    </div>
                </div>

                {/* Carte Gestion des Rôles */}
                <div className="col-md-4 mb-4">
                    <div
                        className="card"
                        style={cardStyle}
                        onClick={handleRolesClick}
                        onMouseOver={(e) => {
                            Object.assign(e.currentTarget.style, {...cardStyle, ...hoverStyle});
                        }}
                        onMouseOut={(e) => {
                            Object.assign(e.currentTarget.style, cardStyle);
                        }}
                    >
                        <div className="card-body text-center">
                            <FaUsersCog size={40} className="mb-3 text-dark" />
                            <h5 className="card-title">Gestion des Rôles</h5>
                            <p className="card-text">Définir et gérer les rôles utilisateurs</p>
                        </div>
                    </div>
                </div>

                {/* Carte Gestion des Permissions */}
                <div className="col-md-4 mb-4">
                    <div
                        className="card"
                        style={cardStyle}
                        onClick={handlePermissionsClick}
                        onMouseOver={(e) => {
                            Object.assign(e.currentTarget.style, {...cardStyle, ...hoverStyle});
                        }}
                        onMouseOut={(e) => {
                            Object.assign(e.currentTarget.style, cardStyle);
                        }}
                    >
                        <div className="card-body text-center">
                            <FaUserShield size={40} className="mb-3 text-dark" />
                            <h5 className="card-title">Gestion des Permissions</h5>
                            <p className="card-text">Configurer les permissions par rôle</p>
                        </div>
                    </div>
                </div>
            </div>
        </Template>
    );
}

export default UserManagement;