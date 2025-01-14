import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import '../../../assets/css/Evaluations/EvaluationDetails.css'; // Styles spécifiques
import axios from 'axios';

const EvaluationDetails = ({interview }) => {
    const { interviewId } = useParams(); // Récupération de l'ID de l'interview à partir des paramètres de l'URL
    const [interviewDetails, setInterviewDetails] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const { userRole } = useUser(); // Récupère le rôle actuel
    console.log("userRole: ", userRole); // 'RH', 'Manager', ou 'Director'

    useEffect(() => {
        const fetchInterviewDetails = async () => {
            try {
                const response = await axios.get(`https://localhost:7082/api/EvaluationInterview/interview-details/${interview.interviewId}`);
                setInterviewDetails(response.data);
            } catch (err) {
                setError(err.response?.data || 'Erreur lors du chargement des détails');
            } finally {
                setLoading(false);
            }
        };

        fetchInterviewDetails();
    }, [interviewId]);

    if (loading) {
        return <p>Chargement des détails de l'entretien...</p>;
    }

    if (error) {
        return <p className="text-danger">Erreur : {error}</p>;
    }

    if (!interviewDetails) {
        return <p>Aucun détail disponible pour cet entretien.</p>;
    }

    const handleSave = async () => {
        if (!evaluationData.rating || evaluationData.rating < 1) {
            setError('Veuillez attribuer une note avant de soumettre.');
            return;
        }

        setError('');
        try {
            // Préparer les données à enregistrer dans le champ Notes
            const notes = JSON.stringify({
                comment: evaluationData.comments,
                rating: evaluationData.rating,
            });

            const response = await fetch(`https://localhost:7082/api/EvaluationInterview/complete-interview/${interview.interviewId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    Notes: notes, // Enregistrer les données combinées dans Notes
                }),
            });

            if (!response.ok) {
                throw new Error('Erreur lors de l\'enregistrement de l\'entretien.');
            }

            // Redirection et mise à jour du statut
            navigate('/homeInterview');
            alert('Statut mis à jour : En attente de validation');
        } catch (err) {
            setError('Impossible de terminer l\'entretien.');
            console.log("error: ",err);
        }
    };
    
    return (
        <div className="evaluation-details-container">
            <h2>Détails de l'entretien</h2>
            <div className="details-section">
                <p><strong>Date de l'entretien :</strong> {new Date(interviewDetails.interviewDate).toLocaleDateString()}</p>
                <p><strong>Statut :</strong> {interviewDetails.status}</p>
                <p><strong>Commentaires Manager :</strong> {interviewDetails.managerComments || 'Aucun'}</p>
                <p><strong>Approbation Manager :</strong> {interviewDetails.managerApproval ? 'Approuvé' : 'Non approuvé'}</p>
                <p><strong>Commentaires Directeur :</strong> {interviewDetails.directorComments || 'Aucun'}</p>
                <p><strong>Approbation Directeur :</strong> {interviewDetails.directorApproval ? 'Approuvé' : 'Non approuvé'}</p>
                <p><strong>Notes supplémentaires :</strong> {interviewDetails.notes || 'Aucune note ajoutée'}</p>
            </div>

           
        </div>
    );
};

export default EvaluationDetails;
