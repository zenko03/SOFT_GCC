import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Template from '../../../Template';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSync, faChevronLeft, faChevronRight } from '@fortawesome/free-solid-svg-icons';

function QuestionEvaluation() {
    const [questions, setQuestions] = useState([]);
    const [currentQuestion, setCurrentQuestion] = useState(null);
    const [formData, setFormData] = useState({ question: '', evaluationTypeId: 0, positionId: 0 });
    const [evaluationTypes, setEvaluationTypes] = useState([]);
    const [posts, setPosts] = useState([]);

    // États pour les filtres
    const [filterEvaluationType, setFilterEvaluationType] = useState('');
    const [filterPost, setFilterPost] = useState('');

    // Pagination states
    const [pageNumber, setPageNumber] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    const [totalPages, setTotalPages] = useState(0);

    useEffect(() => {
        fetchQuestions();
        fetchEvaluationTypes();
        fetchPosts();
    }, [pageNumber, pageSize]);

    const fetchQuestions = async () => {
        try {
            // Nous allons supposer que vous avez ajouté cet endpoint dans votre contrôleur
            const response = await axios.get(`https://localhost:7082/api/Evaluation/questions/paginated?pageNumber=${pageNumber}&pageSize=${pageSize}`);
            setQuestions(response.data.items);
            setTotalPages(response.data.totalPages);
        } catch (error) {
            console.error("Error fetching questions:", error);
        }
    };

    const fetchEvaluationTypes = async () => {
        try {
            const response = await axios.get('https://localhost:7082/api/Evaluation/types');
            setEvaluationTypes(response.data);
        } catch (error) {
            console.error("Error fetching evaluation types:", error);
        }
    };

    const fetchPosts = async () => {
        try {
            const response = await axios.get('https://localhost:7082/api/Evaluation/postes');
            setPosts(response.data);
        } catch (error) {
            console.error("Error fetching positions:", error);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: name === "evaluationTypeId" || name === "positionId" ? parseInt(value, 10) || 0 : value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            // Make sure IDs are properly parsed
            const evaluationTypeId = parseInt(formData.evaluationTypeId);
            const postId = parseInt(formData.positionId);

            // For create (new questions), send a simpler object structure
            // For update, keep the more complex structure that's working
            const requestData = currentQuestion
                ? {
                    questiondId: currentQuestion.questiondId,
                    question: formData.question,
                    evaluationTypeId: evaluationTypeId,
                    positionId: postId,
                    // Include navigation properties that might be needed for update
                    evaluationType: {
                        evaluationTypeId: evaluationTypeId,
                        designation: evaluationTypes.find(t => t.evaluationTypeId === evaluationTypeId)?.designation || ''
                    },
                    poste: {
                        posteId: postId,
                        title: posts.find(p => p.posteId === postId)?.title || ''
                    }
                }
                : {
                    // For create, use a minimal structure
                    question: formData.question,
                    evaluationTypeId: evaluationTypeId,
                    positionId: postId
                };

            console.log('Sending data to API:', requestData);

            if (currentQuestion) {
                await axios.put(`https://localhost:7082/api/Evaluation/questions/${currentQuestion.questiondId}`, requestData);
            } else {
                await axios.post('https://localhost:7082/api/Evaluation/questions', requestData);
            }

            fetchQuestions();
            setFormData({ question: '', evaluationTypeId: 0, positionId: 0 });
            setCurrentQuestion(null);
        } catch (error) {
            console.error("Error saving question:", error);
            // Enhanced error logging
            if (error.response) {
                console.error("Status:", error.response.status);
                console.error("Error details:", error.response.data);
                alert(`Error: ${error.response.data.error || "An unknown error occurred"}`);
            }
        }
    };
    const handleEdit = (question) => {
        setCurrentQuestion(question);
        setFormData({ question: question.question, evaluationTypeId: question.evaluationTypeId, positionId: question.posteId });
    };

    const handleDelete = async (id) => {
        try {
            await axios.delete(`https://localhost:7082/api/Evaluation/questions/${id}`);
            fetchQuestions();
        } catch (error) {
            console.error("Error deleting question:", error);
        }
    };

    const handleReset = () => {
        setFormData({ question: '', evaluationTypeId: '', positionId: '' });
        setCurrentQuestion(null);
    };

    const handleNextPage = () => {
        if (pageNumber < totalPages) {
            setPageNumber(prev => prev + 1);
        }
    };

    const handlePreviousPage = () => {
        if (pageNumber > 1) {
            setPageNumber(prev => prev - 1);
        }
    };

    const filteredQuestions = questions.filter(question => {
        const matchesEvaluationType = filterEvaluationType ? question.evaluationTypeId === Number(filterEvaluationType) : true;
        const matchesPosition = filterPost ? question.posteId === Number(filterPost) : true;
        return matchesEvaluationType && matchesPosition;
    });

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
                            <label htmlFor="positionId">Position</label>
                            <select
                                name="positionId"
                                value={formData.positionId}
                                onChange={handleInputChange}
                                className="form-control"
                                required
                            >
                                <option value="">Sélectionnez une position</option>
                                {posts.map(position => (
                                    <option key={position.posteId} value={position.posteId}>
                                        {position.title}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>
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
                </form>

                <div className="mb-4">
                    <div className="form-row">
                        <div className="form-group col-md-4">
                            <label htmlFor="filterEvaluationType">Filtrer par Type d'Évaluation</label>
                            <select
                                id="filterEvaluationType"
                                value={filterEvaluationType}
                                onChange={(e) => setFilterEvaluationType(e.target.value)}
                                className="form-control"
                            >
                                <option value="">Tous</option>
                                {evaluationTypes.map(type => (
                                    <option key={type.evaluationTypeId} value={type.evaluationTypeId}>
                                        {type.designation}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div className="form-group col-md-4">
                            <label htmlFor="filterPost">Filtrer par Position</label>
                            <select
                                id="filterPost"
                                value={filterPost}
                                onChange={(e) => setFilterPost(e.target.value)}
                                className="form-control"
                            >
                                <option value="">Tous</option>
                                {posts.map(position => (
                                    <option key={position.posteId} value={position.posteId}>
                                        {position.title}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>
                </div>

                <h3>Liste des Questions</h3>
                <ul className="list-group">
                    {filteredQuestions.map((question) => (
                        <li key={question.questiondId} className="list-group-item d-flex justify-content-between align-items-center">
                            <div>
                                <strong>{question.question}</strong>
                                <div>Type d'Évaluation: {evaluationTypes.find(type => type.evaluationTypeId === question.evaluationTypeId)?.designation}</div>
                                <div>Poste: {posts.find(post => post.posteId === question.postId)?.title}</div>
                            </div>
                            <div>
                                <button className="btn btn-warning btn-sm mr-2" onClick={() => handleEdit(question)}>Modifier</button>
                                <button className="btn btn-danger btn-sm" onClick={() => handleDelete(question.questiondId)}>Supprimer</button>
                            </div>
                        </li>
                    ))}
                </ul>

                <div className="pagination mt-4">
                    <button onClick={handlePreviousPage} disabled={pageNumber === 1} className="btn btn-secondary">
                        Précédent
                    </button>
                    <span className="mx-2">Page {pageNumber} sur {totalPages}</span>
                    <button onClick={handleNextPage} disabled={pageNumber === totalPages} className="btn btn-secondary">
                        Suivant
                    </button>
                </div>
            </div>
        </Template>
    );
}

export default QuestionEvaluation;