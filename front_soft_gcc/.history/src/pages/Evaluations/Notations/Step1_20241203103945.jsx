import React, { useEffect, useState } from 'react';
import axios from 'axios';
import '../../../assets/css/Evaluations/Questions.css'; // Styles spécifiques

function Step1({ evaluationTypes, onEvaluationTypeChange, selectedEvaluationType, selectedEmployee }) {
    const [questions, setQuestions] = useState([]);
    const [loading, setLoading] = useState(false);

    const handleEvaluationTypeChange = async (event) => {
        const typeId = event.target.value;
        onEvaluationTypeChange(typeId); // Appel de la fonction parent
        setLoading(true); // Afficher l'indicateur de chargement

        // Simuler un délai de chargement de 2 secondes
        setTimeout(async () => {
            try {
                const response = await axios.get(`https://localhost:7082/api/Evaluation/questions?evaluationTypeId=${typeId}&postId=${selectedEmployee.postId}`);
                setQuestions(response.data);
                console.log("Questions récupérées :", response.data); // Log des questions récupérées
            } catch (error) {
                console.error("Erreur lors de la récupération des questions :", error);
            } finally {
                setLoading(false); // Masquer l'indicateur de chargement
            }
        }, 2000);
    };

    return (
        <div className="step1-container">
            <h5>Sélectionnez le type d'évaluation :</h5>
            <select className="evaluation-select" value={selectedEvaluationType || ''} onChange={handleEvaluationTypeChange}>
                <option value="" disabled>Sélectionnez un type</option>
                {evaluationTypes.map(type => (
                    <option key={type.evaluationTypeId} value={type.evaluationTypeId}>
                        {type.designation}
                    </option>
                ))}
            </select>

            {loading && <div className="loader">Chargement des questions...</div>} {/* Indicateur de chargement */}

            <div className="questions-container">
                {questions.length > 0 && questions.map(question => (
                    <div key={question.questiondId} className="question-item">
                        <p>{question.question}</p> {/* Assurez-vous que 'text' est la bonne propriété */}
                    </div>
                ))}
            </div>
        </div>
    );
}

export default Step1;