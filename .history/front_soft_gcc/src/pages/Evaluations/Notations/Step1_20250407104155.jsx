import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import '../../../assets/css/Evaluations/Questions.css'; // Styles spécifiques

const Step1 = ({ selectedEmployee, onNext }) => {
    const [selectedQuestions, setSelectedQuestions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchSelectedQuestions = async () => {
            try {
                setLoading(true);
                const response = await axios.get(`https://localhost:7082/api/Evaluation/evaluation/${selectedEmployee.evaluationId}/selected-questions`);
                setSelectedQuestions(response.data.questions || []);
            } catch (err) {
                console.error('Erreur lors de la récupération des questions:', err);
                setError('Erreur lors de la récupération des questions');
            } finally {
                setLoading(false);
            }
        };

        if (selectedEmployee?.evaluationId) {
            fetchSelectedQuestions();
        }
    }, [selectedEmployee]);

    const QuestionResponse = ({ question }) => {
        const [showCorrectAnswer, setShowCorrectAnswer] = useState(false);

        return (
            <div className="question-response">
                <div className="question-text">{question.text}</div>
                <div className="response-section">
                    <div className="response-value">
                        Réponse : {question.response?.responseValue || 'Non répondue'}
                    </div>
                    <div className="response-status">
                        {question.response ? (
                            question.response.isCorrect ? (
                                <span className="correct">✓ Correct</span>
                            ) : (
                                <span className="incorrect">✗ Incorrect</span>
                            )
                        ) : (
                            <span className="not-answered">Non répondue</span>
                        )}
                    </div>
                    {question.correctAnswer && (
                        <div className="correct-answer-section">
                            <button 
                                className="show-correct-btn"
                                onClick={() => setShowCorrectAnswer(!showCorrectAnswer)}
                            >
                                {showCorrectAnswer ? 'Masquer la bonne réponse' : 'Voir la bonne réponse'}
                            </button>
                            {showCorrectAnswer && (
                                <div className="correct-answer">
                                    Bonne réponse : {question.correctAnswer}
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        );
    };

    if (loading) {
        return <div className="loading">Chargement des questions...</div>;
    }

    if (error) {
        return <div className="error">{error}</div>;
    }

    if (!selectedQuestions.length) {
        return (
            <div className="no-questions">
                <h2>Aucune question sélectionnée</h2>
                <p>Il n'y a pas de questions sélectionnées pour cette évaluation.</p>
            </div>
        );
    }

    return (
        <div className="step1-container">
            <h2>Questions de l'évaluation</h2>
            <div className="questions-list">
                {selectedQuestions.map((question, index) => (
                    <QuestionResponse key={index} question={question} />
                ))}
            </div>
            <div className="navigation-buttons">
                <button onClick={onNext} className="next-button">
                    Suivant
                </button>
            </div>
        </div>
    );
};

Step1.propTypes = {
  selectedEmployee: PropTypes.shape({
    evaluationId: PropTypes.number.isRequired,
  }).isRequired,
  onNext: PropTypes.func.isRequired
};

export default Step1;