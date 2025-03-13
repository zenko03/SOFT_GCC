import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Template from '../../../Template';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSync, faChevronLeft, faChevronRight } from '@fortawesome/free-solid-svg-icons';

function QuestionEvaluation() {
    const [questions, setQuestions] = useState([]);
    const [currentQuestion, setCurrentQuestion] = useState(null);
    const [formData, setFormData] = useState({ question: '', evaluationTypeId: 0, postId: 0 });
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
            console.error("Error fetching posts:", error);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: name === "evaluationTypeId" || name === "postId" ? parseInt(value, 10) || 0 : value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            const evaluationType = evaluationTypes.find(type => type.evaluationTypeId === parseInt(formData.evaluationTypeId));
            const post = posts.find(p => p.posteId === parseInt(formData.postId));

            const requestData = {
                questiondId: currentQuestion?.questiondId || 0,
                question: formData.question,
                evaluationTypeId: parseInt(formData.evaluationTypeId),
                postId: parseInt(formData.postId),
                EvaluationType: evaluationType || { designation: '' },
                poste: post || { title: '' }
            };

            if (currentQuestion) {
                await axios.put(`https://localhost:7082/api/Evaluation/questions/${currentQuestion.questiondId}`, requestData);
            } else {
                await axios.post('https://localhost:7082/api/Evaluation/questions', requestData);
            }
            fetchQuestions();
            setFormData({ question: '', evaluationTypeId: 0, postId: 0 });
            setCurrentQuestion(null);
        } catch (error) {
            console.error("Error saving question:", error);
            if (error.response && error.response.data) { console.error("Error response data:", error.response.data);
            }
        }
    };

    const handleEdit = (question) => {
        setCurrentQuestion(question);
        setFormData({ question: question.question, evaluationTypeId: question.evaluationTypeId, postId: question.postId });
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
        setFormData({ question: '', evaluationTypeId: '', postId: '' });
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
        const matchesPost = filterPost ? question.postId === Number(filterPost) : true;
        return matchesEvaluationType && matchesPost;
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
                                    <option key={post.posteId} value={post.posteId}>
                                        {post.title}
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
                            <label htmlFor="filterPost">Filtrer par Poste</label>
                            <select
                                id="filterPost"
                                value={filterPost}
                                onChange={(e) => setFilterPost(e.target.value)}
                                className="form-control"
                            >
                                <option value="">Tous</option>
                                {posts.map(post => (
                                    <option key={post.posteId} value={post .posteId}>
                                        {post.title}
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