// QuestionList.jsx
import React from 'react';
import './questions.css';

function QuestionList({ questions }) {
  return (
    <div className="questions-container">
      {questions.map(question => (
        <div key={question.id} className="question-item">
          <p>{question.text}</p> {/* Assurez-vous que 'text' est la bonne propriété */}
        </div>
      ))}
    </div>
  );
}

export default QuestionList;