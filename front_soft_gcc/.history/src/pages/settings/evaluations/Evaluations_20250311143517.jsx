import { useNavigate } from "react-router-dom"; // Import useNavigate for navigation
import Template from "../../Template";

function Evaluations() {
    const navigate = useNavigate(); // Initialize useNavigate

    const handleQuestionsClick = () => {
        navigate("/EvaluationQuestionSettings"); // Navigate to the CRUD page
    };

    return (
        <Template>
            <div className='row'>
                <h2 className="card-title">Paramètre des Evaluations</h2>
            </div>

            <div className="row">
                <div className="col-lg-3 grid-margin stretch-card">
                    <div className="card" style={{ backgroundColor: '#0062ff' }} onClick={handleQuestionsClick}>
                        <div className="card-body">
                            <h5 className="card-title">
                                <span>Questionnaires d'évaluation</span>
                            </h5>
                        </div>
                    </div>
                </div>
            </div>
            <div className="row">
                <div className="col-lg-3 grid-margin stretch-card">
                    <div className="card" style={{ backgroundColor: '#0062ff' }} onClick={handleQuestionsClick}>
                        <div className="card-body">
                            <h5 className="card-title">
                                <span>Suggestions de Formations</span>
                            </h5>
                        </div>
                    </div>
                </div>
            </div>
        </Template>
    );
}

export default Evaluations;