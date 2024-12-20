import React, { useEffect, useState } from 'react';
import axios from 'axios';
import '../../../assets/css/Evaluations/Questions.css'; // Styles spécifiques

function Step1({ evaluationTypes, onEvaluationTypeChange, selectedEvaluationType, selectedEmployee }) {
    const [questions, setQuestions] = useState([]);
    const [loading, setLoading] = useState(false);
    const [ratings, setRatings] = useState({}); // Pour stocker les notes des questions

    const handleEvaluationTypeChange = async (event) => {
        const typeId = event.target.value;
        onEvaluationTypeChange(typeId); // Appel de la fonction parent
        setLoading(true); // Afficher l'indicateur de chargement

        try {
            const response = await axios.get(`https://localhost:7082/api/Evaluation/questions?evaluationTypeId=${typeId}&postId=${selectedEmployee.postId}`);
            setQuestions(response.data);
            console.log("Questions récupérées :", response.data); // Log des questions récupérées
        } catch (error) {
            console.error("Erreur lors de la récupération des questions :", error);
        } finally {
            setLoading(false); // Masquer l'indicateur de chargement
        }
    };

    const handleRatingChange = (questionId, rating) => {
        setRatings(prevRatings => ({
            ...prevRatings,
            [questionId]: rating
        }));
    };

    return (
        <div>
            <h5>Sélectionnez le type d'évaluation :</h5>
            <select value={selectedEvaluationType || ''} onChange={handleEvaluationTypeChange}>
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
                    <div key={question.id} className="question-item">
                        <p>{question.text}</p> {/* Assurez-vous que 'text' est la bonne propriété */}
                        <div className="rating-container">
                            {[1, 2, 3, 4, 5].map(rating => (
                                <label key={rating}>
                                    <input 
                                        type="radio" 
                                        name={`rating-${question.id}`} 
                                        value={rating} 
                                        checked={ratings[question.id] === rating} 
                                        onChange={() => handleRatingChange(question.id, rating)} 
                                    />
                                    {rating}
                                </label>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default Step1;