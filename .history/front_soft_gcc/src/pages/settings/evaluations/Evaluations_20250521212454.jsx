import { useNavigate } from "react-router-dom";
import Template from "../../Template";
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

    return (
        <Template>
            <div className="content-wrapper">
                <div className="row">
                    <div className="col-md-12 grid-margin">
                        <div className="d-flex justify-content-between align-items-center">
                            <h4 className="font-weight-bold mb-0">
                                <i className="mdi mdi-cog-outline menu-icon"></i> Paramètres d&apos;Évaluation
                            </h4>
                        </div>
                    </div>
                </div>

                <div className="row">
                    <div className="col-md-4 grid-margin stretch-card">
                        <div className="card card-stat bg-warning" onClick={handleQuestionsClick}>
                            <div className="card-body">
                                <div className="d-flex align-items-center justify-content-center flex-column">
                                    <i className="mdi mdi-clipboard-text-outline icon-lg text-dark mb-2"></i>
                                    <h5 className="mb-0">Questionnaires d&apos;évaluation</h5>
                                    <p className="mt-3 mb-0">Gérer les questions et types d&apos;évaluation</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="col-md-4 grid-margin stretch-card">
                        <div className="card card-stat bg-warning" onClick={handleFormationClick}>
                            <div className="card-body">
                                <div className="d-flex align-items-center justify-content-center flex-column">
                                    <i className="mdi mdi-school-outline icon-lg text-dark mb-2"></i>
                                    <h5 className="mb-0">Suggestions de Formations</h5>
                                    <p className="mt-3 mb-0">Configurer les formations recommandées</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {canAccessAdmin && (
                        <div className="col-md-4 grid-margin stretch-card">
                            <div className="card card-stat bg-warning" onClick={handleAdminClick}>
                                <div className="card-body">
                                    <div className="d-flex align-items-center justify-content-center flex-column">
                                        <i className="mdi mdi-tune icon-lg text-dark mb-2"></i>
                                        <h5 className="mb-0">Administration</h5>
                                        <p className="mt-3 mb-0">Configuration des paramètres avancés</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </Template>
    );
}

export default Evaluations;