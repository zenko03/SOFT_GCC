import { useNavigate } from "react-router-dom";
import Template from "../../Template";
import { FaClipboardList, FaGraduationCap, FaCog } from "react-icons/fa"; // Ajout de l'icône FaCog
import { useUser } from "../../../pages/Evaluations/EvaluationInterview/UserContext";
import PermissionService from "../../../services/PermissionService";

function Evaluations() {
    const navigate = useNavigate();
    const { hasPermission } = useUser();

    const handleQuestionsClick = () => {
        navigate("/EvaluationQuestionSettings");
    };

    const handleFormationClick = () => {
        navigate("/EvaluationFormationSettings");
    };

    const handleAdminClick = () => {
        navigate("/EvaluationAdminSettings");
    };

    // Vérifier si l'utilisateur a les permissions pour accéder à l'interface d'administration
    const canAccessAdmin = PermissionService.hasFunctionalPermission(hasPermission, 'EVAL_SETTINGS');

    // Style des cartes avec jaune moutarde
    const cardStyle = {
        backgroundColor: '#FFD700', // Jaune moutarde
        color: '#333',
        transition: 'all 0.3s ease',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px',
        boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
        borderRadius: '8px',
        height: '100%',
        minHeight: '120px',
        marginBottom: '20px'
    };

    // Style pour la carte d'administration (couleur différente)
    const adminCardStyle = {
        ...cardStyle,
        backgroundColor: '#4CAF50', // Vert pour l'admin
        color: '#FFF'
    };

    // Style pour le hover
    const hoverStyle = {
        transform: 'translateY(-5px)',
        boxShadow: '0 6px 12px rgba(0,0,0,0.15)',
        backgroundColor: '#FFCC00' // Légèrement plus foncé au survol
    };

    // Style pour le hover de la carte d'administration
    const adminHoverStyle = {
        transform: 'translateY(-5px)',
        boxShadow: '0 6px 12px rgba(0,0,0,0.15)',
        backgroundColor: '#45a049' // Vert plus foncé au survol
    };

    return (
        <Template>
            <div className='row mb-4'>
                <div className="col-12">
                    <h2 className="card-title">Paramètre des Evaluations</h2>
                </div>
            </div>

            <div className="row">
                <div className="col-md-6 mb-4">
                    <div
                        className="card"
                        style={cardStyle}
                        onClick={handleQuestionsClick}
                        onMouseOver={(e) => {
                            Object.assign(e.currentTarget.style, hoverStyle);
                        }}
                        onMouseOut={(e) => {
                            e.currentTarget.style.transform = 'translateY(0)';
                            e.currentTarget.style.boxShadow = '0 4px 8px rgba(0,0,0,0.1)';
                            e.currentTarget.style.backgroundColor = '#FFD700';
                        }}
                    >
                        <div className="card-body text-center">
                            <FaClipboardList size={40} className="mb-3" />
                            <h5 className="card-title">
                                <span>Questionnaires d&apos;évaluation</span>
                            </h5>
                        </div>
                    </div>
                </div>

                <div className="col-md-6 mb-4">
                    <div
                        className="card"
                        style={cardStyle}
                        onClick={handleFormationClick}
                        onMouseOver={(e) => {
                            Object.assign(e.currentTarget.style, hoverStyle);
                        }}
                        onMouseOut={(e) => {
                            e.currentTarget.style.transform = 'translateY(0)';
                            e.currentTarget.style.boxShadow = '0 4px 8px rgba(0,0,0,0.1)';
                            e.currentTarget.style.backgroundColor = '#FFD700';
                        }}
                    >
                        <div className="card-body text-center">
                            <FaGraduationCap size={40} className="mb-3" />
                            <h5 className="card-title">
                                <span>Suggestions de Formations</span>
                            </h5>
                        </div>
                    </div>
                </div>

                {/* Carte d'accès à l'administration - visible uniquement si l'utilisateur a les permissions */}
                {canAccessAdmin && (
                    <div className="col-md-12 mb-4">
                        <div
                            className="card"
                            style={adminCardStyle}
                            onClick={handleAdminClick}
                            onMouseOver={(e) => {
                                Object.assign(e.currentTarget.style, adminHoverStyle);
                            }}
                            onMouseOut={(e) => {
                                e.currentTarget.style.transform = 'translateY(0)';
                                e.currentTarget.style.boxShadow = '0 4px 8px rgba(0,0,0,0.1)';
                                e.currentTarget.style.backgroundColor = '#4CAF50';
                            }}
                        >
                            <div className="card-body text-center">
                                <FaCog size={40} className="mb-3" />
                                <h5 className="card-title">
                                    <span>Administration des Évaluations</span>
                                </h5>
                                <p>Configuration des paramètres avancés et du temps</p>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </Template>
    );
}

export default Evaluations;