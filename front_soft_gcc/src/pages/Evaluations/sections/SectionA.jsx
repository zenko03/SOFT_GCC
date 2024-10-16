import React, { useState } from 'react';

const SectionA = () => {
  // Questions and their possible notes (replace with your data)
  const questions = [
    { id: 1, text: 'Quelle est la capitale de la France ?' },
    { id: 2, text: 'Qui a peint la Joconde ?' },
    // ... other questions
  ];

  // State to store the assigned notes for each question
  const [notes, setNotes] = useState(
    questions.reduce((acc, question) => ({ ...acc, [question.id]: null }), {})
  );

  // Function to update a question's note
  const handleNoteChange = (questionId, newNote) => {
    setNotes((prevNotes) => ({ ...prevNotes, [questionId]: newNote }));
  };

  return (
    <div>
      <h2 className="text-center">Notation de l'examen</h2>
      <form>
        {questions.map((question) => (
          <div key={question.id} className="mb-3">
            <label htmlFor={`question-${question.id}`}>{question.text}</label>
            <select
              id={`question-${question.id}`}
              className="form-select"
              aria-label="Note"
              onChange={(e) => handleNoteChange(question.id, e.target.value)}
            >
              <option value="">Sélectionnez une note</option>
              {[1, 2, 3, 4, 5].map((note) => (
                <option key={note} value={note}>
                  {note}
                </option>
              ))}
            </select>
          </div>
        ))}
      </form>
      {/* Here, you can add a button to submit the notes */}
    </div>
  );
};

export default SectionA;