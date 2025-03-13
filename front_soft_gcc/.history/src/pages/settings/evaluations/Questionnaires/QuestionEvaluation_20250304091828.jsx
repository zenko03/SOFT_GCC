import React, { useEffect, useState } from 'react';
import axios from 'axios'; // Make sure to install axios for API calls
import Template from '../../../Template'; // Import your Template component
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSync } from '@fortawesome/free-solid-svg-icons';

function QuestionEvaluation() {
    const [questions, setQuestions] = useState([]);
    const [currentQuestion, setCurrentQuestion] = useState(null);
    const [formData, setFormData] = useState({ question: '', evaluationTypeId: '', postId: '' });
    const [evaluationTypes, setEvaluationTypes] = useState([]);
    const [posts, setPosts] = useState([]);

    useEffect(() => {
        fetchQuestions();
        fetchEvaluationTypes();
        fetchPosts();
    }, []);

    const fetchQuestions = async () => {
        try {
            const response = await axios.get('https://localhost:7082/api/Evaluation/questionsAll'); // Adjust the API endpoint as needed
            setQuestions(response.data);
        } catch (error) {
            console.error("Error fetching questions:", error);
        }
    };

    const fetchEvaluationTypes = async () => {
        try {
            const response = await axios.get('https://localhost:7082/api/Evaluation/types'); // Adjust the API endpoint as needed
            setEvaluationTypes(response.data);
        } catch (error) {
            console.error("Error fetching evaluation types:", error);
        }
    };

    const fetchPosts = async () => {
        try {
            const response = await axios.get('https://localhost:7082/api/Evaluation/postes'); // Adjust the API endpoint as needed
            setPosts(response.data);
        } catch (error) {
            console.error("Error fetching posts:", error);
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

    const handleReset = () => {
        setFormData({ question: '', evaluationTypeId: '', postId: '' });
        setCurrentQuestion(null);
    };

    const [sortField, setSortField] = useState('');
    const [sortOrder, setSortOrder] = useState('asc');

    // Fonction de tri
    const sortedQuestions = [...questions].sort((a, b) => {
        if (!sortField) return 0;

        let valueA, valueB;

        if (sortField === 'postId') {
            const postA = posts.find(post => post.postId === a.postId);
            const postB = posts.find(post => post.postId === b.postId);
            valueA = postA?.title || '';
            valueB = postB?.title || '';
        } else if (sortField === 'evaluationTypeId') {
            const typeA = evaluationTypes.find(type => type.evaluationTypeId === a.evaluationTypeId);
            const typeB = evaluationTypes.find(type => type.evaluationTypeId === b.evaluationTypeId);
            valueA = typeA?.designation || '';
            valueB = typeB?.designation || '';
        } else {
            valueA = a[sortField];
            valueB = b[sortField];
        }

        if (valueA < valueB) return sortOrder === 'asc' ? -1 : 1;
        if (valueA > valueB) return sortOrder === 'asc' ? 1 : -1;
        return 0;
    });

    return (
        <Template>
            <div className="container mt-4">
                <h2 className="text-center mb-4">Gestion des Questions d'Évaluation</h2>

                {/* Formulaire de création/édition */}
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
                            <label htmlFor="evaluationTypeId">Type d'Évaluation</label>
                            <select
                                name="evaluationTypeId"
                                value={formData.evaluationTypeId}
                                onChange={handleInputChange}
                                className="form-control"
                                required
                            >
                                <option value="">Sélectionnez un type</option>
                                {evaluationTypes.map(type => (
                                    <option key={type.evaluationTypeId} value={type.evaluationTypeId}>
                                        {type.designation}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div className="form-group col-md-3">
                            <label htmlFor="postId">Poste</label>
                            <select
                                name="postId"
                                value={formData.postId}
                                onChange={handleInputChange}
                                className="form-control"
                                required
                            >
                                <option value="">Sélectionnez un poste</option>
                                {posts.map(post => (
                                    <option key={post.postId} value={post.postId}>
                                        {post.title}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {/* Boutons de soumission et réinitialisation */}
                    <div className="d-flex align-items-center gap-2">
                        <button type="submit" className="btn btn-primary">
                            {currentQuestion ? 'Mettre à jour la question' : 'Ajouter une question'}
                        </button>
                        <button
                            type="button"
                            onClick={handleReset}
                            className="btn btn-secondary"
                            title="Réinitialiser le formulaire"
                        >
                            <FontAwesomeIcon icon={faSync} />
                        </button>
                    </div>
                </form>

                {/* Section de liste avec contrôles de tri */}
                <div className="d-flex justify-content-between align-items-center mb-3">
                    <h3>Liste des Questions</h3>
                    <div className="d-flex align-items-center gap-2">
                        <label>Trier par :</label>
                        <select
                            value={sortField}
                            onChange={(e) => setSortField(e.target.value)}
                            className="form-select"
                            style={{ width: '200px' }}
                        >
                            <option value="">Aucun tri</option>
                            <option value="question">Question</option>
                            <option value="evaluationTypeId">Type d'Évaluation</option>
                            <option value="postId">Poste</option>
                        </select>
                        <button
                            onClick={() => setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc')}
                            className="btn btn-sm btn-outline-secondary"
                        >
                            {sortOrder === 'asc' ? '↑ Ascendant' : '↓ Descendant'}
                        </button>
                    </div>
                </div>

                {/* Liste des questions triées */}
                <ul className="list-group">
                    {sortedQuestions.map((question) => (
                        <li key={question.questiondId} className="list-group-item d-flex justify-content-between align-items-center">
                            <div className="w-75">
                                <strong>{question.question}</strong>
                                <div className="text-muted mt-1">
                                    Type: {evaluationTypes.find(type => type.evaluationTypeId === question.evaluationTypeId)?.designation}
                                </div>
                                <div className="text-muted">
                                    Poste: {posts.find(post => post.postId === question.postId)?.title}
                                </div>
                            </div>
                            <div className="d-flex gap-2">
                                <button
                                    className="btn btn-warning btn-sm"
                                    onClick={() => handleEdit(question)}
                                >
                                    Modifier
                                </button>
                                <button
                                    className="btn btn-danger btn-sm"
                                    onClick={() => handleDelete(question.questiondId)}
                                >
                                    Supprimer
                                </button>
                            </div>
                        </li>
                    ))}
                </ul>
            </div>
        </Template>
    );
}

export default QuestionEvaluation;