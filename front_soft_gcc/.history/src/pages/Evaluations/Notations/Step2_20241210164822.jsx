import React from 'react';

function Step2({ ratings, setRatings, remarks, setRemarks }) {
  const handleRatingChange = (questionId, value) => {
    setRatings(prevRatings => ({
      ...prevRatings,
      [questionId]: value
    }));
  };

  const handleRemarksChange = (e) => {
    const { name, value } = e.target;
    setRemarks(prevRemarks => ({
      ...prevRemarks,
      [name]: value
    }));
  };

  return (
    <div className="step-content">
      <h4>Évaluation par Questions</h4>
      <div className="form-group">
        {/* Afficher les questions dynamiquement ici */}
        {/* Exemple statique de questions pour l'illustration */}
        <div className="question">
          <label>Question 1: Compétence X</label>
          <div>
            {[1, 2, 3, 4, 5].map(value => (
              <label key={value}>
                <input
                  type="radio"
                  name="rating-1"
                  value={value}
                  checked={ratings[1] === value}
                  onChange={() => handleRatingChange(1, value)}
                />
                {value}
              </label>
            ))}
          </div>
        </div>

        <div className="question">
          <label>Question 2: Compétence Y</label>
          <div>
            {[1, 2, 3, 4, 5].map(value => (
              <label key={value}>
                <input
                  type="radio"
                  name="rating-2"
                  value={value}
                  checked={ratings[2] === value}
                  onChange={() => handleRatingChange(2, value)}
                />
                {value}
              </label>
            ))}
          </div>
        </div>

        {/* Zone pour les remarques générales */}
        <div className="form-group">
          <label>Points forts</label>
          <textarea
            name="strengths"
            value={remarks.strengths}
            onChange={handleRemarksChange}
            className="form-control"
          ></textarea>
        </div>
        <div className="form-group">
          <label>Points faibles</label>
          <textarea
            name="weaknesses"
            value={remarks.weaknesses}
            onChange={handleRemarksChange}
            className="form-control"
          ></textarea>
        </div>
        <div className="form-group">
          <label>Évaluation générale</label>
          <textarea
            name="generalEvaluation"
            value={remarks.generalEvaluation}
            onChange={handleRemarksChange}
            className="form-control"
          ></textarea>
        </div>
      </div>
    </div>
  );
}

export default Step2;
