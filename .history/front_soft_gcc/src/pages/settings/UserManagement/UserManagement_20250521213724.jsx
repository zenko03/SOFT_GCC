import { useNavigate } from "react-router-dom";
import Template from "../../Template";
import "../../styles/skillsStyle.css";

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
                <div className="col-md-4 grid-margin stretch-card">
                    <div className="card settings-card" onClick={handleUsersClick}>
                        <div className="card-body">
                            <h5 className="card-text">
                                <i className="mdi mdi-account-multiple settings-icon"></i>
                                <span className='settings-title'>Gestion des Utilisateurs</span>
                            </h5>
                        </div>
                    </div>
                </div>

                {/* Carte Gestion des Rôles */}
                <div className="col-md-4 grid-margin stretch-card">
                    <div className="card settings-card" onClick={handleRolesClick}>
                        <div className="card-body">
                            <h5 className="card-text">
                                <i className="mdi mdi-account-settings settings-icon"></i>
                                <span className='settings-title'>Gestion des Rôles</span>
                            </h5>
                        </div>
                    </div>
                </div>

                {/* Carte Gestion des Permissions */}
                <div className="col-md-4 grid-margin stretch-card">
                    <div className="card settings-card" onClick={handlePermissionsClick}>
                        <div className="card-body">
                            <h5 className="card-text">
                                <i className="mdi mdi-shield-account settings-icon"></i>
                                <span className='settings-title'>Gestion des Permissions</span>
                            </h5>
                        </div>
                    </div>
                </div>
            </div>
        </Template>
    );
}

export default UserManagement;