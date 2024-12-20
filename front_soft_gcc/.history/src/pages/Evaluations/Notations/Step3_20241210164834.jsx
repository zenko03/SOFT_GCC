import React, { useEffect } from 'react';

function Step3({ ratings, trainingSuggestions, saveEvaluationResult, validateEvaluation }) {
  useEffect(() => {
    // Si des suggestions de formation sont récupérées, elles seront affichées.
    console.log(trainingSuggestions);
  }, [trainingSuggestions]);

  const calculateOverallScore = () => {
    const totalRating = Object.values(ratings).reduce((acc, rating) => acc + rating, 0);
    const numberOfQuestions = Object.keys(ratings).length;
    return (totalRating / numberOfQuestions).toFixed(2);
  };

  return (
    <div className="step-content">
      <h4>Résumé de l'évaluation</h4>
      <div className="form-group">
        <label>Score global</label>
        <input
          type="text"
          value={calculateOverallScore()}
          className="form-control"
          disabled
        />
      </div>

      <div className="form-group">
        <label>Suggestions de formation</label>
        <ul>
          {trainingSuggestions.map((suggestion, index) => (
            <li key={index}>
              <p>{suggestion.description}</p>
            </li>
          ))}
        </ul>
      </div>

      <div className="form-group">
        <button className="btn btn-primary" onClick={saveEvaluationResult}>
          Sauvegarder l'évaluation
        </button>
        <button className="btn btn-success" onClick={validateEvaluation}>
          Valider l'évaluation
        </button>
      </div>
    </div>
  );
}

export default Step3;
