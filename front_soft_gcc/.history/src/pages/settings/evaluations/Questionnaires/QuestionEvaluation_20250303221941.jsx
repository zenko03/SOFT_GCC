import React, { useEffect, useState } from 'react';
import axios from 'axios'; // Make sure to install axios for API calls
import Template from '../../Template'; // Import your Template component

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
        <Template>
            <div className="container mt-4">
                <h2 className="text-center mb-4">Gestion des Questions d'Évaluation</h2>
                <form onSubmit={handleSubmit} className="mb-4">
                    <div className="form-row">
                        <div className="form-group col-md-6">
                            <label htmlFor="question">Question</label>
                            <input
                                type="text"
                                name="question"
                                value={formData.question}
                                onChange={handleInputChange}
                                className="form-control"
                                placeholder="Entrez la question"
                                required
                            />
                        </div>
                        <div className="form-group col-md-3">
                            <label htmlFor="evaluationTypeId">ID Type d'Évaluation</label>
                            <input
                                type="number"
                                name="evaluationTypeId"
                                value={formData.evaluationTypeId}
                                onChange={handleInputChange}
                                className="form-control"
                                placeholder="ID Type"
                                required
                            />
                        </div>
                        <div className="form-group col-md-3">
                            <label htmlFor="postId">ID Poste</label>
                            <input
                                type="number"
                                name="postId"
                                value={formData.postId}
                                onChange={handleInputChange}
                                className="form-control"
                                placeholder="ID Poste"
                                required
                            />
                        </div>
                    </div>
                    <button type="submit" className="btn btn-primary">
                        {currentQuestion ? 'Mettre à jour la question' : 'Ajouter une question'}
                    </button>
                </form>

                <h3>Liste des Questions</h3>
                <ul className="list-group">
                    {questions.map((question) => (
                        <li key={question.questiondId} className="list-group-item d-flex justify-content-between align-items-center">
                            {question.question}
                            <div>
                                <button className="btn btn-warning btn-sm mr-2" onClick={() => handleEdit(question)}>Modifier</button>
                                <button className="btn btn-danger btn-sm" onClick ={() => handleDelete(question.questiondId)}>Supprimer</button>
                            </div>
                        </li>
                    ))}
                </ul>
            </div>
        </Template>
    );
}

export default QuestionEvaluation;