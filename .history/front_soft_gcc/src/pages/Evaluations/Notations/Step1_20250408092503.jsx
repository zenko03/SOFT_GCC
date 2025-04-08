import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import '../../../assets/css/Evaluations/Questions.css';
import { EvaluationService } from '../../../services/Evaluations/EvaluationService';

const Step1 = ({ evaluationId, setRatings, ratings, evaluationTypes }) => {
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentEvaluationType, setCurrentEvaluationType] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        // Récupérer les détails de l'évaluation
        const evaluation = await EvaluationService.getEvaluationById(evaluationId);
        setCurrentEvaluationType(evaluation.evaluationType);

        // Récupérer les questions sélectionnées
        const selectedQuestions = await EvaluationService.getSelectedQuestions(evaluationId);
        setQuestions(selectedQuestions);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [evaluationId]);

  const handleRatingChange = (questionId, rating) => {
    setRatings(prev => ({
      ...prev,
      [questionId]: rating
    }));
  };

  if (loading) return <div>Chargement...</div>;
  if (error) return <div>Erreur: {error}</div>;

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium">Type d&apos;évaluation</h3>
        <select
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          value={currentEvaluationType?.evaluationTypeId || ''}
          disabled
        >
          {evaluationTypes.map(type => (
            <option
              key={type.evaluationTypeId}
              value={type.evaluationTypeId}
              className={type.evaluationTypeId === currentEvaluationType?.evaluationTypeId ? 'bg-gray-100' : 'text-gray-400'}
            >
              {type.designation}
            </option>
          ))}
        </select>
      </div>

      <div>
        <h3 className="text-lg font-medium">Questions</h3>
        <div className="mt-4 space-y-4">
          {questions.map(question => (
            <div key={question.questionId} className="border rounded-lg p-4">
              <p className="font-medium">{question.questionText}</p>
              <div className="mt-2">
                <select
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  value={ratings[question.questionId] || ''}
                  onChange={(e) => handleRatingChange(question.questionId, parseInt(e.target.value))}
                >
                  <option value="">Sélectionner une note</option>
                  {[1, 2, 3, 4, 5].map(score => (
                    <option key={score} value={score}>{score}</option>
                  ))}
                </select>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

Step1.propTypes = {
  evaluationId: PropTypes.number.isRequired,
  setRatings: PropTypes.func.isRequired,
  ratings: PropTypes.object.isRequired,
  evaluationTypes: PropTypes.arrayOf(
    PropTypes.shape({
      evaluationTypeId: PropTypes.number.isRequired,
      designation: PropTypes.string.isRequired
    })
  ).isRequired
};

export default Step1;