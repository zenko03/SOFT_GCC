import React, { useEffect, useState } from 'react';
import axios from 'axios'; // Make sure to install axios for API calls

function QuestionEvaluation() {
    const [questions, setQuestions] = useState([]);
    const [currentQuestion, setCurrentQuestion] = useState(null);
    const [formData, setFormData] = useState({ question: '', evaluationTypeId: '', postId: '' });

    useEffect(() => {
        fetchQuestions();
    }, []);

    const fetchQuestions = async () => {
        try {
            const response = await axios.get('https://localhost:7082/api/Evaluation/questionsAll'); // Adjust the API endpoint as needed
            setQuestions(response.data);
        } catch (error) {
            console.error("Error fetching questions:", error);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (currentQuestion) {
                // Update existing question
                await axios.put(`https://localhost:7082/api/Evaluation/questions/${currentQuestion.questiondId}`, formData);
            } else {
                // Create new question
                await axios.post('https://localhost:7082/api/Evaluation/questions', formData);
            }
            fetchQuestions(); // Refresh the list
            setFormData({ question: '', evaluationTypeId: '', postId: '' }); // Reset form
            setCurrentQuestion(null); // Reset current question
        } catch (error) {
            console.error("Error saving question:", error);
        }
    };

    const handleEdit = (question) => {
        setCurrentQuestion(question);
        setFormData({ question: question.question, evaluationTypeId: question.evaluationTypeId, postId: question.postId });
    };

    const handleDelete = async (id) => {
        try {
            await axios.delete(`https://localhost:7082/api/Evaluation/questions/${id}`);
            fetchQuestions(); // Refresh the list
        } catch (error) {
            console.error("Error deleting question:", error);
        }
    };

    return (
        <div>
            <h2>Gestion des Questions d'Évaluation</h2>
            <form onSubmit={handleSubmit}>
                <input
                    type="text"
                    name="question"
                    value={formData.question}
                    onChange={handleInputChange}
                    placeholder="Question"
                    required
                />
                <input
                    type="number"
                    name="evaluationTypeId"
                    value={formData.evaluationTypeId}
                    onChange={handleInputChange}
                    placeholder="Evaluation Type ID"
                    required
                />
                <input
                    type="number"
                    name="postId"
                    value={formData.postId}
                    onChange={handleInputChange}
                    placeholder="Post ID"
                    required
                />
                <button type="submit">{currentQuestion ? 'Update Question' : 'Add Question'}</button>
            </form>

            <h3>Liste des Questions</h3>
            <ul>
                {questions.map((question) => (
                    <li key={question.questiondId}>
                        {question.question} 
                        <button onClick={() => handleEdit(question)}>Edit</button>
                        <button onClick={() => handleDelete(question.questiondId)}>Delete</button>
                    </li>
                ))}
            </ul>
        </div>
    );
}

export default QuestionEvaluation;