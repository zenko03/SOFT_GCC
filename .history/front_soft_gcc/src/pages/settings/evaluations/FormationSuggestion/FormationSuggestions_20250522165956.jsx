import { useEffect, useState } from 'react';
import axios from 'axios';
import Template from '../../../Template';
import Papa from 'papaparse'; // Bibliothèque pour parser CSV


function FormationSuggestions() {

    const [suggestions, setSuggestions] = useState([]);
    const [currentSuggestion, setCurrentSuggestion] = useState(null);

    const [importPreview, setImportPreview] = useState([]);
    const [isImporting, setIsImporting] = useState(false);

    const [formData, setFormData] = useState({
        training: '',
        details: '',
        evaluationTypeId: 0,
        questionId: 0,
        scoreThreshold: 0,
        state: 1
    });
    // État séparé pour le formulaire d'édition dans la modal
    const [editFormData, setEditFormData] = useState({
        training: '',
        details: '',
        evaluationTypeId: 0,
        questionId: 0,
        scoreThreshold: 0,
        state: 1
    });
    const [evaluationTypes, setEvaluationTypes] = useState([]);
    const [questions, setQuestions] = useState([]);
    const [showEditModal, setShowEditModal] = useState(false);
    const [showAddModal, setShowAddModal] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // États pour les filtres
    const [filterEvaluationType, setFilterEvaluationType] = useState('');
    const [filterScoreThreshold, setFilterScoreThreshold] = useState('');

    // Pagination states
    const [pageNumber, setPageNumber] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    const [totalPages, setTotalPages] = useState(0);

    // État pour stocker toutes les suggestions
    const [allSuggestions, setAllSuggestions] = useState([]);

    useEffect(() => {
        setLoading(true);
        Promise.all([
            fetchAllInitialData()
        ])
            .finally(() => setLoading(false));
    }, []);

    // Effet pour paginer localement
    useEffect(() => {
        if (allSuggestions.length > 0) {
            paginateLocally();
        }
    }, [pageNumber, pageSize, allSuggestions, filterEvaluationType, filterScoreThreshold]);

    // Fonction pour charger toutes les données initiales
    const fetchAllInitialData = async () => {
        setLoading(true);
        try {
            await Promise.all([
                fetchAllSuggestions(),
                fetchEvaluationTypes(),
                fetchQuestions()
            ]);
        } finally {
            setLoading(false);
        }
    };

    // Fonction pour rafraîchir toutes les données
    const fetchAllData = () => {
        fetchAllInitialData();
    };

    // Fonction pour récupérer toutes les suggestions
    const fetchAllSuggestions = async () => {
        try {
            setError(null);
            // Récupérer toutes les suggestions sans pagination
            const response = await axios.get('https://localhost:7082/api/Evaluation/training-suggestions');
            console.log("Toutes les suggestions reçues:", response.data);
            setAllSuggestions(response.data);
            return response;
        } catch (error) {
            console.error("Error fetching all training suggestions:", error);
            setError("Erreur lors du chargement des suggestions de formation: " + (error.response?.data?.error || error.message));
            setAllSuggestions([]);
            return null;
        } finally {
            paginateLocally();
        }
    };

    // Fonction pour paginer les suggestions localement
    const paginateLocally = () => {
        // Filtrer d'abord les suggestions selon les critères
        const filtered = allSuggestions.filter(suggestion => {
            if (!suggestion) return false;

            const matchesEvaluationType = !filterEvaluationType ||
                parseInt(suggestion.evaluationTypeId, 10) === parseInt(filterEvaluationType, 10);

            const matchesScoreThreshold = !filterScoreThreshold ||
                parseInt(suggestion.scoreThreshold, 10) === parseInt(filterScoreThreshold, 10);

            return matchesEvaluationType && matchesScoreThreshold;
        });

        // Calculer le total des pages
        const total = Math.ceil(filtered.length / pageSize);
        setTotalPages(total > 0 ? total : 1);

        // Paginer les données filtrées
        const start = (pageNumber - 1) * pageSize;
        const end = start + pageSize;
        const paginatedData = filtered.slice(start, end);

        setSuggestions(paginatedData);
    };

    const fetchEvaluationTypes = async () => {
        try {
            const response = await axios.get('https://localhost:7082/api/Evaluation/types');
            setEvaluationTypes(response.data);
            return response;
        } catch (error) {
            console.error("Error fetching evaluation types:", error);
            setEvaluationTypes([]);
            return null;
        }
    };

    const fetchQuestions = async () => {
        try {
            const response = await axios.get('https://localhost:7082/api/Evaluation/questionsAll');
            console.log("Structure des questions:", response.data && response.data.length > 0 ? response.data[0] : "Aucune question disponible");
            setQuestions(response.data);
            return response;
        } catch (error) {
            console.error("Error fetching questions:", error);
            setQuestions([]);
            return null;
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: ['evaluationTypeId', 'questionId', 'scoreThreshold', 'state'].includes(name)
                ? parseInt(value, 10) || 0
                : value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            const evaluationType = evaluationTypes.find(type => type.evaluationTypeId === parseInt(formData.evaluationTypeId));

            // Recherche de la question correspondante avec la même logique que dans le dropdown
            const question = questions.find(q => {
                const qId = parseInt(q.questionId || q.QuestionId || q.questiondId || q.QuestiondId || q.id || 0, 10);
                return qId === parseInt(formData.questionId, 10);
            });

            console.log("Question trouvée pour l'envoi:", question);

            const requestData = {
                TrainingSuggestionId: 0, // Nouvelle suggestion
                Training: formData.training,
                Details: formData.details,
                EvaluationTypeId: parseInt(formData.evaluationTypeId),
                QuestionId: parseInt(formData.questionId),
                ScoreThreshold: parseInt(formData.scoreThreshold),
                State: 1, // Toujours défini à 1
                evaluationType: evaluationType || {},
                evaluationQuestion: question || {}
            };

            console.log("Données envoyées pour création:", requestData);

            // Create
            await axios.post('https://localhost:7082/api/Evaluation/create-training-suggestion', requestData);

            fetchAllData();
            resetForm();
            alert('Suggestion de formation ajoutée avec succès');

        } catch (error) {
            console.error("Error saving training suggestion:", error);
            if (error.response) {
                console.error("Error response data:", error.response.data);
            }
            setError("Erreur lors de l'enregistrement: " + (error.response?.data?.error || error.message));
        }
    };

    // Fonction séparée pour gérer la mise à jour depuis la modal
    const handleEditSubmit = async (e) => {
        if (e) e.preventDefault();

        try {
            const evaluationType = evaluationTypes.find(type => type.evaluationTypeId === parseInt(editFormData.evaluationTypeId));

            // Recherche de la question correspondante pour le formulaire d'édition
            const question = questions.find(q => {
                const qId = parseInt(q.questionId || q.QuestionId || q.questiondId || q.QuestiondId || q.id || 0, 10);
                return qId === parseInt(editFormData.questionId, 10);
            });

            console.log("Question trouvée pour la mise à jour:", question);

            // Récupérer l'ID avec la bonne casse (TrainingSuggestionId)
            const id = currentSuggestion.TrainingSuggestionId !== undefined
                ? currentSuggestion.TrainingSuggestionId
                : currentSuggestion.trainingSuggestionId;

            console.log("ID de la suggestion à mettre à jour:", id);

            if (!id && id !== 0) {
                throw new Error("ID de suggestion non valide");
            }

            const requestData = {
                TrainingSuggestionId: id,
                Training: editFormData.training,
                Details: editFormData.details,
                EvaluationTypeId: parseInt(editFormData.evaluationTypeId),
                QuestionId: parseInt(editFormData.questionId),
                ScoreThreshold: parseInt(editFormData.scoreThreshold),
                State: 1, // Toujours défini à 1
                evaluationType: evaluationType || {},
                evaluationQuestion: question || {}
            };

            console.log("Données envoyées pour mise à jour:", requestData);

            // Update
            await axios.put(`https://localhost:7082/api/Evaluation/training-suggestions/${id}`, requestData);

            fetchAllData();
            resetForm();
            alert('Suggestion de formation mise à jour avec succès');

            // Fermer la modale après mise à jour
            setShowEditModal(false);
        } catch (error) {
            console.error("Error updating training suggestion:", error);
            if (error.response) {
                console.error("Error response data:", error.response.data);
            }
            setError("Erreur lors de la mise à jour: " + (error.response?.data?.error || error.message));
        }
    };

    const handleEdit = (suggestion) => {
        console.log("Suggestion à éditer:", suggestion);
        setCurrentSuggestion(suggestion);

        // Récupérer l'identifiant de la question selon les différentes nomenclatures possibles
        const questionIdFromSuggestion = parseInt(suggestion.questiondId || suggestion.QuestiondId || suggestion.questionId || suggestion.QuestionId || 0, 10);

        // Vérifier si cette question existe dans notre liste de questions
        const matchingQuestion = questions.find(q => parseInt(q.questionId || q.QuestionId || q.questiondId || q.QuestiondId || q.id || 0, 10) === questionIdFromSuggestion);
        console.log("ID de question à rechercher:", questionIdFromSuggestion);
        console.log("Question correspondante trouvée:", matchingQuestion ? "Oui" : "Non");

        if (!matchingQuestion && questionIdFromSuggestion !== 0) {
            console.log("ERREUR: Question non trouvée dans la liste des questions");
            console.log("ID recherché:", questionIdFromSuggestion);
            console.log("IDs disponibles:", questions.map(q => parseInt(q.questionId || q.QuestionId || q.questiondId || q.QuestiondId || q.id || 0, 10)));
        }

        setEditFormData({
            training: suggestion.training || suggestion.Training || '',
            details: suggestion.details || suggestion.Details || '',
            evaluationTypeId: suggestion.evaluationTypeId || suggestion.EvaluationTypeId || 0,
            questionId: questionIdFromSuggestion,
            scoreThreshold: suggestion.scoreThreshold || suggestion.ScoreThreshold || 0,
            state: suggestion.state || suggestion.State || 1
        });

        // Ouvrir la modal pour l'édition
        setShowEditModal(true);
    };

    const handleDelete = async (id) => {
        try {
            // S'assurer que l'ID est un nombre valide
            const suggestionId = parseInt(id, 10);
            if (isNaN(suggestionId)) {
                console.error("ID de suggestion non valide");
                return;
            }

            if (window.confirm('Êtes-vous sûr de vouloir supprimer cette suggestion de formation ?')) {
                await axios.delete(`https://localhost:7082/api/Evaluation/training-suggestions/${suggestionId}`);
                fetchAllData();
            }
        } catch (error) {
            console.error("Error deleting training suggestion:", error);
            setError("Erreur lors de la suppression: " + (error.response?.data?.error || error.message));
        }
    };

    const resetForm = () => {
        setCurrentSuggestion(null);
        setFormData({
            training: '',
            details: '',
            evaluationTypeId: 0,
            questionId: 0,
            scoreThreshold: 0,
            state: 1
        });
        setEditFormData({
            training: '',
            details: '',
            evaluationTypeId: 0,
            questionId: 0,
            scoreThreshold: 0,
            state: 1
        });
        setShowEditModal(false);
    };

    // Fonction pour prévisualiser
    const handleCsvPreview = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        Papa.parse(file, {
            header: true,
            complete: (results) => {
                // Limiter la prévisualisation aux 5 premières lignes
                setImportPreview(results.data.slice(0, 5));
            }
        });
    };

    // Fonction pour envoyer au backend
    const handleCsvImport = async () => {
        const file = document.getElementById('csvFileInput').files[0];
        if (!file) return;

        setIsImporting(true);

        // Créer un FormData pour envoyer le fichier
        const formData = new FormData();
        formData.append('file', file);

        try {
            const token = localStorage.getItem('token');
            const response = await axios.post(
                'https://localhost:7082/api/Evaluation/import-training-suggestions',
                formData,
                {
                    headers: {
                        "Authorization": `Bearer ${token}`,
                        "Content-Type": "multipart/form-data" // Important pour les fichiers
                    }
                }
            );

            alert(`${response.data.imported} suggestions de formation importées avec succès!`);
            fetchAllData(); // Rafraîchir les données
        } catch (error) {
            alert(`Erreur lors de l'import: ${error.response?.data?.error || error.message}`);
        } finally {
            setIsImporting(false);
            setImportPreview([]);
        }
    };

    return (
        <Template>
            <div className="content-wrapper">
                <div className="row">
                    <div className="col-md-12 grid-margin">
                        <div className="d-flex justify-content-between align-items-center">
                            <h4 className="font-weight-bold mb-0">
                                <i className="mdi mdi-school menu-icon"></i> Gestion des Suggestions de Formation
                            </h4>
                        </div>

                        {error && (
                            <div className="alert alert-danger mt-3" role="alert">
                                {error}
                            </div>
                        )}
                    </div>
                </div>

                {loading ? (
                    <div className="d-flex justify-content-center my-5">
                        <div className="spinner-border text-primary" role="status">
                            <span className="sr-only">Chargement...</span>
                        </div>
                    </div>
                ) : (
                    <>
                        <div className="row">
                            <div className="col-12 grid-margin">
                                <div className="card">
                                    <div className="card-header title-container">
                                        <h5 className="title">
                                            <i className="mdi mdi-filter-outline"></i> Filtres
                                        </h5>
                                    </div>
                                    <div className="card-body">
                                        <div className="row align-items-end">
                                            <div className="col-md-5">
                                                <div className="form-group mb-0">
                                                    <label htmlFor="filterEvaluationType" className="form-label">Type d&apos;Évaluation</label>
                                                    <select
                                                        id="filterEvaluationType"
                                                        value={filterEvaluationType}
                                                        onChange={(e) => {
                                                            setFilterEvaluationType(e.target.value);
                                                            setPageNumber(1); // Revenir à la première page après filtrage
                                                        }}
                                                        className="form-control form-select"
                                                    >
                                                        <option value="">Tous</option>
                                                        {evaluationTypes.map(type => (
                                                            <option key={type.evaluationTypeId} value={type.evaluationTypeId}>
                                                                {type.designation}
                                                            </option>
                                                        ))}
                                                    </select>
                                                </div>
                                            </div>
                                            <div className="col-md-5">
                                                <div className="form-group mb-0">
                                                    <label htmlFor="filterScoreThreshold" className="form-label">Seuil de score</label>
                                                    <select
                                                        id="filterScoreThreshold"
                                                        value={filterScoreThreshold}
                                                        onChange={(e) => {
                                                            setFilterScoreThreshold(e.target.value);
                                                            setPageNumber(1); // Revenir à la première page après filtrage
                                                        }}
                                                        className="form-control form-select"
                                                    >
                                                        <option value="">Tous</option>
                                                        {[...new Set(allSuggestions.map(s => s.scoreThreshold || s.ScoreThreshold))].map(threshold => (
                                                            <option key={threshold} value={threshold}>
                                                                {threshold}
                                                            </option>
                                                        ))}
                                                    </select>
                                                </div>
                                            </div>
                                            <div className="col-md-2">
                                                <button
                                                    className="btn btn-outline-secondary w-100"
                                                    style={{ height: '38px' }}
                                                    onClick={() => {
                                                        setFilterEvaluationType('');
                                                        setFilterScoreThreshold('');
                                                        setPageNumber(1); // Revenir à la première page après réinitialisation des filtres
                                                    }}
                                                >
                                                    <i className="mdi mdi-refresh"></i> Réinitialiser
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="row">
                            <div className="col-12 grid-margin">
                                <div className="card">
                                    <div className="card-header title-container d-flex justify-content-between align-items-center">
                                        <h5 className="title mb-0">
                                            <i className="mdi mdi-format-list-bulleted"></i> Liste des Suggestions de Formation ({suggestions.length})
                                        </h5>
                                        <button
                                            className="btn btn-primary btn-sm d-flex align-items-center"
                                            onClick={() => {
                                                resetForm();
                                                setShowAddModal(true);
                                            }}
                                            title="Ajouter une nouvelle suggestion de formation"
                                            style={{ gap: '5px' }}
                                        >
                                            <i className="mdi mdi-plus"></i> Nouvelle suggestion
                                        </button>
                                        <button
                                            className="btn btn-secondary btn-sm d-flex align-items-center ms-2"
                                            onClick={() => document.getElementById('csvFileInput').click()}
                                            title="Importer depuis CSV"
                                            style={{ gap: '5px' }}
                                        >
                                            <i className="mdi mdi-file-import"></i> Importer CSV
                                        </button>
                                        <input
                                            type="file"
                                            id="csvFileInput"
                                            accept=".csv"
                                            style={{ display: 'none' }}
                                            onChange={handleCsvPreview}
                                        />

                                    </div>
                                    <div className="card-body">
                                        {suggestions.length === 0 ? (
                                            <div className="alert alert-info">
                                                Aucune suggestion de formation trouvée. {allSuggestions.length > 0 ? "Essayez de modifier vos filtres." : "Veuillez ajouter une nouvelle suggestion."}
                                            </div>
                                        ) : (
                                            <div className="table-responsive">
                                                <table className="table table-hover table-striped">
                                                    <thead className="bg-light">
                                                        <tr>
                                                            <th scope="col" style={{ width: '50px' }}>#</th>
                                                            <th scope="col">Formation</th>
                                                            <th scope="col">Détails</th>
                                                            <th scope="col">Type d&apos;évaluation</th>
                                                            <th scope="col">Seuil</th>
                                                            <th scope="col" className="text-center" style={{ width: '100px' }}>Actions</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {suggestions.map((suggestion, index) => {
                                                            const suggestionId = suggestion.TrainingSuggestionId || suggestion.trainingSuggestionId;
                                                            const evalType = evaluationTypes.find(type => type.evaluationTypeId === suggestion.evaluationTypeId)?.designation || "N/A";

                                                            // Troncature des textes si trop longs
                                                            const trainingText = suggestion.Training || suggestion.training || "";
                                                            const truncatedTraining = trainingText.length > 30 ? trainingText.substring(0, 30) + '...' : trainingText;

                                                            const detailsText = suggestion.Details || suggestion.details || "";
                                                            const truncatedDetails = detailsText.length > 50 ? detailsText.substring(0, 50) + '...' : detailsText;

                                                            return (
                                                                <tr key={suggestionId}>
                                                                    <td>{index + 1 + (pageNumber - 1) * pageSize}</td>
                                                                    <td title={trainingText}>{truncatedTraining}</td>
                                                                    <td title={detailsText}>{truncatedDetails}</td>
                                                                    <td>{evalType}</td>
                                                                    <td><span className="badge bg-info">{suggestion.ScoreThreshold || suggestion.scoreThreshold}</span></td>
                                                                    <td className="text-center">
                                                                        <button
                                                                            className="btn btn-outline-success btn-sm me-1"
                                                                            onClick={() => handleEdit(suggestion)}
                                                                            title="Modifier"
                                                                        >
                                                                            <i className="mdi mdi-pencil"></i>
                                                                        </button>
                                                                        <button
                                                                            className="btn btn-outline-danger btn-sm"
                                                                            onClick={() => handleDelete(suggestionId)}
                                                                            title="Supprimer"
                                                                        >
                                                                            <i className="mdi mdi-delete"></i>
                                                                        </button>
                                                                    </td>
                                                                </tr>
                                                            );
                                                        })}
                                                    </tbody>
                                                </table>
                                            </div>
                                        )}

                                        <div className="d-flex justify-content-center align-items-center mt-4">
                                            <div className="pagination-controls d-flex align-items-center">
                                                <button
                                                    onClick={() => setPageNumber((prev) => Math.max(prev - 1, 1))}
                                                    disabled={pageNumber === 1}
                                                    className="btn btn-sm me-2"
                                                    style={{
                                                        minWidth: '100px',
                                                        border: '1px solid #ced4da',
                                                        backgroundColor: '#f8f9fa'
                                                    }}
                                                >
                                                    <i className="mdi mdi-chevron-left"></i> Précédent
                                                </button>
                                                <span className="mx-3">
                                                    Page {pageNumber} sur {totalPages}
                                                </span>
                                                <button
                                                    onClick={() => setPageNumber((prev) => Math.min(prev + 1, totalPages))}
                                                    disabled={pageNumber === totalPages}
                                                    className="btn btn-sm me-3"
                                                    style={{
                                                        minWidth: '100px',
                                                        border: '1px solid #ced4da',
                                                        backgroundColor: '#f8f9fa'
                                                    }}
                                                >
                                                    Suivant <i className="mdi mdi-chevron-right"></i>
                                                </button>
                                                <select
                                                    value={pageSize}
                                                    onChange={(e) => {
                                                        setPageSize(Number(e.target.value));
                                                        setPageNumber(1); // Réinitialiser à la première page lorsque la taille de la page change
                                                    }}
                                                    className="form-select form-select-sm"
                                                    style={{ width: '120px' }}
                                                >
                                                    <option value={5}>5 par page</option>
                                                    <option value={10}>10 par page</option>
                                                    <option value={20}>20 par page</option>
                                                    <option value={50}>50 par page</option>
                                                </select>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Modal pour ajouter une suggestion */}
                        {showAddModal && (
                            <div className="modal fade show"
                                style={{
                                    display: 'block',
                                    backgroundColor: 'rgba(0,0,0,0.5)',
                                    paddingRight: '17px',
                                    overflow: 'scroll'
                                }}
                                tabIndex="-1"
                                onClick={(e) => {
                                    // Fermer le modal si on clique en dehors du contenu
                                    if (e.target.className.includes('modal fade show')) {
                                        setShowAddModal(false);
                                    }
                                }}
                            >
                                <div className="modal-dialog modal-lg modal-dialog-centered">
                                    <div className="modal-content">
                                        <div className="modal-header">
                                            <h5 className="modal-title">
                                                <i className="mdi mdi-file-document-plus"></i> Ajouter une suggestion de formation
                                            </h5>
                                            <button type="button" className="close text-dark" onClick={() => setShowAddModal(false)}>
                                                <span aria-hidden="true">&times;</span>
                                            </button>
                                        </div>
                                        <div className="modal-body">
                                            <form onSubmit={handleSubmit}>
                                                <div className="row mb-3">
                                                    <div className="col-md-6">
                                                        <div className="form-group">
                                                            <label htmlFor="add-training" className="form-label">
                                                                <i className="mdi mdi-book-open-page-variant"></i> Formation
                                                            </label>
                                                            <textarea
                                                                name="training"
                                                                id="add-training"
                                                                value={formData.training}
                                                                onChange={handleInputChange}
                                                                className="form-control"
                                                                placeholder="Entrez le nom de la formation"
                                                                required
                                                                rows="3"
                                                            ></textarea>
                                                        </div>
                                                    </div>
                                                    <div className="col-md-6">
                                                        <div className="form-group">
                                                            <label htmlFor="add-details" className="form-label">
                                                                <i className="mdi mdi-text-box"></i> Détails
                                                            </label>
                                                            <textarea
                                                                name="details"
                                                                id="add-details"
                                                                value={formData.details}
                                                                onChange={handleInputChange}
                                                                className="form-control"
                                                                placeholder="Entrez les détails de la formation"
                                                                required
                                                                rows="3"
                                                            ></textarea>
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="row mb-3">
                                                    <div className="col-md-6">
                                                        <div className="form-group">
                                                            <label htmlFor="add-evaluationTypeId" className="form-label">Type d&apos;Évaluation</label>
                                                            <select
                                                                name="evaluationTypeId"
                                                                id="add-evaluationTypeId"
                                                                value={formData.evaluationTypeId}
                                                                onChange={handleInputChange}
                                                                className="form-control form-select"
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
                                                    </div>
                                                    <div className="col-md-6">
                                                        <div className="form-group">
                                                            <label htmlFor="add-questionId" className="form-label">Question associée</label>
                                                            <select
                                                                name="questionId"
                                                                id="add-questionId"
                                                                value={formData.questionId}
                                                                onChange={handleInputChange}
                                                                className="form-control form-select"
                                                                required
                                                            >
                                                                <option value="">Sélectionner la question</option>
                                                                {questions.map(q => {
                                                                    // Récupérer l'ID de question avec toutes les variantes possibles
                                                                    const qId = q.questionId || q.QuestionId || q.questiondId || q.QuestiondId || q.id;
                                                                    return (
                                                                        <option key={qId} value={qId}>
                                                                            {q.question}
                                                                        </option>
                                                                    );
                                                                })}
                                                            </select>
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="row mb-3">
                                                    <div className="col-md-6">
                                                        <div className="form-group">
                                                            <label htmlFor="add-scoreThreshold" className="form-label">
                                                                <i className="mdi mdi-trending-down"></i> Seuil de score
                                                            </label>
                                                            <input
                                                                type="number"
                                                                name="scoreThreshold"
                                                                id="add-scoreThreshold"
                                                                value={formData.scoreThreshold}
                                                                onChange={handleInputChange}
                                                                className="form-control"
                                                                placeholder="Entrez le seuil de score"
                                                                required
                                                            />
                                                        </div>
                                                    </div>
                                                </div>
                                            </form>
                                        </div>
                                        <div className="modal-footer">
                                            <button type="button" className="btn btn-light btn-fw" onClick={() => setShowAddModal(false)}>
                                                <i className="mdi mdi-close-circle"></i> Annuler
                                            </button>
                                            <button type="button" className="btn btn-success btn-fw" onClick={handleSubmit}>
                                                <i className="mdi mdi-content-save"></i> Ajouter
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {importPreview.length > 0 && (
                            <div className="modal fade show" style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.5)' }}>
                                <div className="modal-dialog modal-lg">
                                    <div className="modal-content">
                                        <div className="modal-header">
                                            <h5>Prévisualisation de l&apos;import</h5>
                                            <button type="button" className="close" onClick={() => setImportPreview([])}>×</button>
                                        </div>
                                        <div className="modal-body">
                                            <div className="table-responsive">
                                                <table className="table table-sm">
                                                    {/* Afficher les colonnes et un aperçu des données */}
                                                </table>
                                            </div>
                                        </div>
                                        <div className="modal-footer">
                                            <button className="btn btn-secondary" onClick={() => setImportPreview([])}>Annuler</button>
                                            <button className="btn btn-primary" onClick={handleCsvImport} disabled={isImporting}>
                                                {isImporting ? 'Importation...' : 'Confirmer l\'import'}
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                        {/* Modal pour modifier une suggestion */}
                        {showEditModal && (
                            <div className="modal fade show"
                                style={{
                                    display: 'block',
                                    backgroundColor: 'rgba(0,0,0,0.5)',
                                    paddingRight: '17px',
                                    overflow: 'scroll'
                                }}
                                tabIndex="-1"
                                onClick={(e) => {
                                    // Fermer le modal si on clique en dehors du contenu
                                    if (e.target.className.includes('modal fade show')) {
                                        setShowEditModal(false);
                                    }
                                }}
                            >
                                <div className="modal-dialog modal-lg modal-dialog-centered">
                                    <div className="modal-content">
                                        <div className="modal-header">
                                            <h5 className="modal-title">
                                                <i className="mdi mdi-file-document-edit"></i> Modifier la suggestion de formation
                                            </h5>
                                            <button type="button" className="close text-dark" onClick={() => setShowEditModal(false)}>
                                                <span aria-hidden="true">&times;</span>
                                            </button>
                                        </div>
                                        <div className="modal-body">
                                            <form onSubmit={handleEditSubmit}>
                                                <div className="row mb-3">
                                                    <div className="col-md-6">
                                                        <div className="form-group">
                                                            <label htmlFor="edit-training" className="form-label">
                                                                <i className="mdi mdi-book-open-page-variant"></i> Formation
                                                            </label>
                                                            <textarea
                                                                name="training"
                                                                id="edit-training"
                                                                value={editFormData.training}
                                                                onChange={(e) => setEditFormData({
                                                                    ...editFormData,
                                                                    training: e.target.value
                                                                })}
                                                                className="form-control"
                                                                placeholder="Entrez le nom de la formation"
                                                                required
                                                                rows="3"
                                                            ></textarea>
                                                        </div>
                                                    </div>
                                                    <div className="col-md-6">
                                                        <div className="form-group">
                                                            <label htmlFor="edit-details" className="form-label">
                                                                <i className="mdi mdi-text-box"></i> Détails
                                                            </label>
                                                            <textarea
                                                                name="details"
                                                                id="edit-details"
                                                                value={editFormData.details}
                                                                onChange={(e) => setEditFormData({
                                                                    ...editFormData,
                                                                    details: e.target.value
                                                                })}
                                                                className="form-control"
                                                                placeholder="Entrez les détails"
                                                                required
                                                                rows="3"
                                                            ></textarea>
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="row mb-3">
                                                    <div className="col-md-6">
                                                        <div className="form-group">
                                                            <label htmlFor="edit-evaluationTypeId" className="form-label">Type d&apos;Évaluation</label>
                                                            <select
                                                                name="evaluationTypeId"
                                                                id="edit-evaluationTypeId"
                                                                value={editFormData.evaluationTypeId}
                                                                onChange={(e) => setEditFormData({
                                                                    ...editFormData,
                                                                    evaluationTypeId: parseInt(e.target.value)
                                                                })}
                                                                className="form-control form-select"
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
                                                    </div>
                                                    <div className="col-md-6">
                                                        <div className="form-group">
                                                            <label htmlFor="edit-questionId" className="form-label">Question associée</label>
                                                            <select
                                                                name="questionId"
                                                                id="edit-questionId"
                                                                value={editFormData.questionId}
                                                                onChange={(e) => setEditFormData({
                                                                    ...editFormData,
                                                                    questionId: parseInt(e.target.value)
                                                                })}
                                                                className="form-control form-select"
                                                                required
                                                            >
                                                                <option value="">Sélectionner la question</option>
                                                                {questions.map(q => {
                                                                    // Récupérer l'ID de question avec toutes les variantes possibles
                                                                    const qId = q.questionId || q.QuestionId || q.questiondId || q.QuestiondId || q.id;
                                                                    return (
                                                                        <option key={qId} value={qId}>
                                                                            {q.question}
                                                                        </option>
                                                                    );
                                                                })}
                                                            </select>
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="row mb-3">
                                                    <div className="col-md-6">
                                                        <div className="form-group">
                                                            <label htmlFor="edit-scoreThreshold" className="form-label">
                                                                <i className="mdi mdi-trending-down"></i> Seuil de score
                                                            </label>
                                                            <input
                                                                type="number"
                                                                name="scoreThreshold"
                                                                id="edit-scoreThreshold"
                                                                value={editFormData.scoreThreshold}
                                                                onChange={(e) => setEditFormData({
                                                                    ...editFormData,
                                                                    scoreThreshold: parseInt(e.target.value)
                                                                })}
                                                                className="form-control"
                                                                placeholder="Entrez le seuil de score"
                                                                required
                                                            />
                                                        </div>
                                                    </div>
                                                </div>
                                            </form>
                                        </div>
                                        <div className="modal-footer">
                                            <button type="button" className="btn btn-light btn-fw" onClick={() => setShowEditModal(false)}>
                                                <i className="mdi mdi-close-circle"></i> Annuler
                                            </button>
                                            <button type="button" className="btn btn-success btn-fw" onClick={handleEditSubmit}>
                                                <i className="mdi mdi-content-save"></i> Mettre à jour
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </>
                )}
            </div>
        </Template>
    );
}

export default FormationSuggestions;