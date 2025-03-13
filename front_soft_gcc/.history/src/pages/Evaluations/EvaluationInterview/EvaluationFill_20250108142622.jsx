import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from './UserContext ';

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

        setError('');
        try {
            const response = await fetch(`https://localhost:7082/api/EvaluationInterview/complete-interview/${interview.interviewId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    ManagerApproval: true,
                    ManagerComments: evaluationData.comments,
                    DirectorApproval: false,
                    DirectorComments: '',
                    Notes:''
                }),
            });

            if (!response.ok) {
                throw new Error('Erreur lors de l\'enregistrement de l\'entretien.');
            }

            // Redirection et mise à jour du statut
            navigate('/EvaluationInterviewHome');
            alert('Statut mis à jour : En attente de validation');
        } catch (err) {
            setError('Impossible de terminer l\'entretien.');
        }
    };

    return (
        <div className="card">
            <div className="card-body">
                <h5>Remplissage de la Fiche d'Évaluation</h5>
                {extractedData && (
                    <div className="mb-3">
                        <h6>Informations de Base :</h6>
                        <p><strong>Nom :</strong> {evaluationData.employeeName}</p>
                        <p><strong>Poste :</strong> {evaluationData.position}</p>
                        <p><strong>Date d'Évaluation :</strong> {evaluationData.evaluationDate}</p>
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

export default EvaluationFill;
