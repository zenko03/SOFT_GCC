import React, { useState } from "react";
import { useUser } from "./UserContext";

const EvaluationWorkflow = ({ interview }) => {
  const { userRole } = useUser(); // Récupère le rôle actuel
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

      if (userRole === "Manager") {
        body = {
          managerApproval: approval,
          managerComments: comment,
        };
      } else if (userRole === "Directeur") {
        body = {
          directorApproval: approval,
          directorComments: comment,
        };
      }

      const response = await fetch(
        `https://localhost:7082/api/EvaluationInterview/complete-interview/${interview.interviewId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(body),
        }
      );

      if (!response.ok) {
        throw new Error("Erreur lors de la soumission.");
      }

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

  return (
    <div className="card">
      <div className="card-body">
        <h5>Circuit de Validation</h5>
        <p>
          <strong>Rôle actuel :</strong> {userRole === "Manager" ? "Manager" : "Directeur"}
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

export default EvaluationWorkflow;
