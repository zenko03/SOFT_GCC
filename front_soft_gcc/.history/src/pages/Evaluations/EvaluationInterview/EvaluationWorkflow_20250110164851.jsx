import React, { useState } from "react";
import { useUser } from "./UserContext";

const EvaluationWorkflow = ({ interviewId }) => {
  const { userRole } = useUser(); // Récupère le rôle actuel
  const [comment, setComment] = useState("");
  const [status, setStatus] = useState("manager"); // Peut être mis à jour dynamiquement
  const [error, setError] = useState("");

  const handleValidation = async () => {
    try {
      let body = {};
      if (userRole === "Manager") {
        body = {
          managerApproval: true,
          managerComments: comment,
        };
      } else if (userRole === "Directeur") {
        body = {
          directorApproval: true,
          directorComments: comment,
        };
      }

      const response = await fetch(
        `https://localhost:7082/api/EvaluationInterview/complete-interview/${interviewId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(body),
        }
      );

      if (!response.ok) {
        throw new Error("Erreur lors de la validation.");
      }

      // Mise à jour du statut
      const nextStatus = userRole === "Manager" ? "director" : "completed";
      setStatus(nextStatus);

      alert(
        nextStatus === "completed"
          ? "Validation par le Directeur terminée. Évaluation validée."
          : "Validation par le Manager terminée. En attente de validation du Directeur."
      );
    } catch (err) {
      setError("Impossible de valider l'entretien.");
      console.error(err);
    }
  };

  return (
    <div className="card">
      <div className="card-body">
        <h5>Circuit de Validation</h5>
        <p>
          <strong>Statut actuel :</strong>{" "}
          {status === "manager" && "En attente de validation par le Manager."}
          {status === "director" && "En attente de validation par le Directeur."}
          {status === "completed" && "Validation terminée."}
        </p>
        {status !== "completed" && (
          <div>
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
            <button className="btn btn-primary mt-3" onClick={handleValidation}>
              Valider
            </button>
          </div>
        )}
        {error && <div className="text-danger mt-2">{error}</div>}
      </div>
    </div>
  );
};

export default EvaluationWorkflow;
