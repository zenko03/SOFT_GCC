import { useState } from "react";
import { useUser } from './UserContext';
import axios from 'axios';
import PropTypes from 'prop-types';
import { checkFunctionalPermission } from '../../../services/PermissionService';

const EvaluationWorkflow = ({ interview }) => {
  const { hasPermission } = useUser();
  const [comment, setComment] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleSubmit = async (approval) => {
    try {
      if (!comment.trim()) {
        setError("Le commentaire est obligatoire.");
        return;
      }
  
      setError("");
      let body = {};
  
      if (checkFunctionalPermission(hasPermission, 'VALIDATE_AS_MANAGER')) {
        body = {
          managerApproval: approval,
          managerComments: comment,
        };
      } else if (checkFunctionalPermission(hasPermission, 'VALIDATE_AS_DIRECTOR')) {
        body = {
          directorApproval: approval,
          directorComments: comment,
        };
      }
      console.log("Données envoyées au backend :", body);

      // Requête PUT avec Axios
      const response = await axios.put(
        `https://localhost:7082/api/EvaluationInterview/complete-interview/${interview.interviewId}`,
        body,
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      console.log("Réponse du backend :", response.data);

      const message = approval
        ? "Validation réussie."
        : "Refus enregistré avec succès.";
      setSuccess(message);
      alert(message);
    } catch (err) {
      setError("Impossible de soumettre l'évaluation.");
      console.error(err);
    }
  };

  // Détermine le rôle à afficher en fonction des permissions
  const getRoleDisplay = () => {
    if (checkFunctionalPermission(hasPermission, 'VALIDATE_AS_MANAGER')) {
      return "Manager";
    } else if (checkFunctionalPermission(hasPermission, 'VALIDATE_AS_DIRECTOR')) {
      return "Director";
    }
    return "Non défini";
  };

  return (
    <div className="card">
      <div className="card-body">
        <h5>Circuit de Validation</h5>
        <p>
          <strong>Rôle actuel :</strong> {getRoleDisplay()}
        </p>
        <div className="form-group">
          <label htmlFor="comment">Commentaire :</label>
          <textarea
            id="comment"
            className="form-control"
            rows="3"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
          />
        </div>
        <div className="mt-3">
          <button
            className="btn btn-success me-2"
            onClick={() => handleSubmit(true)}
          >
            Valider
          </button>
          <button
            className="btn btn-danger"
            onClick={() => handleSubmit(false)}
          >
            Refuser
          </button>
        </div>
        {error && <div className="text-danger mt-3">{error}</div>}
        {success && <div className="text-success mt-3">{success}</div>}
      </div>
    </div>
  );
};

EvaluationWorkflow.propTypes = {
  interview: PropTypes.shape({
    interviewId: PropTypes.number.isRequired
  }).isRequired
};

export default EvaluationWorkflow;
