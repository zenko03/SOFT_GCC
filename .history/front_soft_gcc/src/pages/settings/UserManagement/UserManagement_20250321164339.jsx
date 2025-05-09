import { useNavigate } from "react-router-dom";
import Template from "../../Template";
import { FaClipboardList, FaGraduationCap } from "react-icons/fa"; // Ajout d'icônes

function UserManagement() {
    const navigate = useNavigate();

    const handleQuestionsClick = () => {
        navigate("/EvaluationQuestionSettings");
    };

    const handleFormationClick = () => {
        navigate("/EvaluationFormationSettings");
    };

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

    // Style pour le hover
    const hoverStyle = {
        transform: 'translateY(-5px)',
        boxShadow: '0 6px 12px rgba(0,0,0,0.15)',
        backgroundColor: '#FFCC00' // Légèrement plus foncé au survol
    };

    return (
        <Template>
            <div className='row mb-4'>
                <div className="col-12">
                    <h2 className="card-title">Paramètre des Gestion des Utilisateurs</h2>
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
                                <span>Gestion des Utilisateurs</span>
                            </h5>
                        </div>
                    </div>
                </div>

                
            </div>
        </Template>
    );
}

export default UserManagement;