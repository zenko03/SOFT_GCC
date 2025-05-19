import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from './UserContext';
import PropTypes from 'prop-types';

const EvaluationFill = ({ extractedData, interview }) => {
    const navigate = useNavigate();
    const [evaluationData, setEvaluationData] = useState({
        comments: '',
        rating: 0,
    });
    const [error, setError] = useState('');

    const { userRole } = useUser(); // Récupère le rôle actuel
    console.log("userRole: ", userRole); // 'RH', 'Manager', ou 'Director'

    console.log("interview", interview.interviewId);

    // Mettre à jour les données du formulaire avec les données extraites
    useEffect(() => {
        if (extractedData) {
            setEvaluationData((prev) => ({
                ...prev,
                employeeName: extractedData.employeeName || 'Non défini',
                position: extractedData.position || 'Non défini',
                evaluationDate: extractedData.evaluationDate || 'Non définie',
            }));
        }
    }, [extractedData]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setEvaluationData({ ...evaluationData, [name]: value });
    };

    const handleRatingChange = (rating) => {
        setEvaluationData((prev) => ({ ...prev, rating }));
    };

    const handleSave = async () => {
        if (!evaluationData.rating || evaluationData.rating < 1) {
            setError('Veuillez attribuer une note avant de soumettre.');
            return;
        }

        if (!interview || !interview.interviewId) {
            setError("Données d&apos;interview manquantes ou invalides.");
            console.error("Interview invalide:", interview);
            return;
        }

        setError('');
        try {
            // Préparer les données à enregistrer dans le champ Notes
            const formattedNotes = JSON.stringify({
                comment: evaluationData.comments,
                rating: evaluationData.rating,
            });

            // Récupérer l'ID d'évaluation depuis l'interview
            const evaluationId = interview.evaluationId || null;
            console.log("ID d&apos;interview:", interview.interviewId);
            console.log("ID d&apos;évaluation:", evaluationId);

            // Créer un objet complet avec toutes les propriétés du DTO
            const completeDTO = {
                managerApproval: null,
                managerComments: "",
                directorApproval: null,
                directorComments: "",
                notes: formattedNotes
                // Le statut sera déterminé par le backend selon la logique métier
            };

            console.log("Données envoyées au backend:", completeDTO);
            console.log("URL de l&apos;API:", `https://localhost:7082/api/EvaluationInterview/complete-interview/${interview.interviewId}`);

            const response = await fetch(`https://localhost:7082/api/EvaluationInterview/complete-interview/${interview.interviewId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(completeDTO),
            });

            console.log("Statut de la réponse:", response.status);
            
            if (!response.ok) {
                const errorData = await response.text();
                console.error("Erreur détaillée:", errorData);
                throw new Error(`Erreur lors de l&apos;enregistrement de l&apos;entretien: ${errorData}`);
            }

            // Force le rafraîchissement des données
            localStorage.setItem('interviewStatusUpdated', 'true');
            
            // Redirection et mise à jour du statut
            navigate('/homeInterview', { state: { refreshData: true } });
            alert('Statut mis à jour : En attente de validation');
        } catch (err) {
            console.error("Erreur complète:", err);
            setError(`Impossible de terminer l&apos;entretien: ${err.message}`);
        }
    };

    return (
        <div className="card">
            <div className="card-body">
                <h5>Remplissage de la Fiche d&apos;Évaluation</h5>
                {extractedData && (
                    <div className="mb-3">
                        <h6>Informations de Base :</h6>
                        <p><strong>Nom :</strong> {evaluationData.employeeName}</p>
                        <p><strong>Poste :</strong> {evaluationData.position}</p>
                        <p><strong>Date d&apos;Évaluation :</strong> {evaluationData.evaluationDate}</p>
                    </div>
                )}

                <textarea
                    name="comments"
                    placeholder="Ajouter des commentaires"
                    className="form-control my-3"
                    value={evaluationData.comments}
                    onChange={handleChange}
                ></textarea>

                <div className="my-3">
                    <label>Note :</label>
                    <div className="rating">
                        {[1, 2, 3, 4, 5].map((star) => (
                            <span
                                key={star}
                                className={`star ${evaluationData.rating >= star ? 'selected' : ''}`}
                                onClick={() => handleRatingChange(star)}
                                style={{ cursor: 'pointer', fontSize: '1.5rem', color: evaluationData.rating >= star ? 'gold' : 'gray' }}
                            >
                                ★
                            </span>
                        ))}
                    </div>
                </div>

                {error && <div className="alert alert-danger">{error}</div>}

                <button className="btn btn-primary" onClick={handleSave}>Enregistrer</button>
            </div>
        </div>
    );
};

// Ajout de la validation des props
EvaluationFill.propTypes = {
  interview: PropTypes.shape({
    interviewId: PropTypes.number.isRequired,
    evaluationId: PropTypes.number
  }).isRequired,
  extractedData: PropTypes.shape({
    employeeName: PropTypes.string,
    position: PropTypes.string,
    evaluationDate: PropTypes.string
  })
};

export default EvaluationFill;
