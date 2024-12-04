import React, { useEffect, useState } from 'react';
import axios from 'axios';
import '../../../assets/css/Evaluations/Questions.css'; // Styles spécifiques

function Step1({ evaluationTypes, onEvaluationTypeChange, selectedEvaluationType, selectedEmployee, ratings, setRatings }) {
    const [questions, setQuestions] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        // Charger les questions si le type d'évaluation est déjà sélectionné
        if (selectedEvaluationType) {
            const fetchQuestions = async () => {
                setLoading(true);
                try {
                    const response = await axios.get(`https://localhost:7082/api/Evaluation/questions?evaluationTypeId=${selectedEvaluationType}&postId=${selectedEmployee.postId}`);
                    setQuestions(response.data);
                } catch (error) {
                    console.error("Erreur lors de la récupération des questions :", error);
                } finally {
                    setLoading(false);
                }
            };
            fetchQuestions();
        }
    }, [selectedEvaluationType, selectedEmployee.postId]);

    const handleRatingChange = (questionId, rating) => {
        setRatings(prevRatings => ({
            ...prevRatings,
            [questionId]: rating
        }));
    };

    return (
        <div className="step1-container">
            <h5>Sélectionnez le type d'évaluation :</h5>
            <select className="evaluation-select" value={selectedEvaluationType || ''} onChange={onEvaluationTypeChange}>
                <option value="" disabled>Sélectionnez un type</option>
                {evaluationTypes.map(type => (
                    <option key={type.evaluationTypeId} value={type.evaluationTypeId}>
                        {type.designation}
                    </option>
                ))}
            </select>

            {loading && <div className="loader"></div>} {/* Indicateur de chargement */}

            <div className="questions-container">
                {questions.length > 0 && questions.map(question => (
                    <div key={question.questionId} className="question-item">
                        <p>{question.question}</p> {/* Assurez-vous que 'question' est la bonne propriété */}
                        <div className="rating-container">
                            {[1, 2, 3, 4, 5].map(rating => (
                                <label key={rating} className="rating-label">
                                    <input
                                        type="radio"
                                        name={`rating-${question.questionId}`}
                                        value={rating}
                                        checked={ratings[question.questionId] === rating}
                                        onChange={() => handleRatingChange(question.questionId, rating)}
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