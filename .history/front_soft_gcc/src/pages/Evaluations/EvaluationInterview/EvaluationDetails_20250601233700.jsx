import { useEffect, useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import '../../../assets/css/Evaluations/EvaluationDetails.css'; // Styles spécifiques
import axios from 'axios';
import { useUser } from '../../Authentification/UserContext';
import { toast } from 'react-toastify';
import PropTypes from 'prop-types';
import Template from '../../Template';

const EvaluationDetails = ({ interview, employeeId }) => {
    const { interviewId: urlInterviewId } = useParams(); // Récupération de l'ID depuis l'URL si disponible
    const actualInterviewId = interview?.interviewId || urlInterviewId;
    const navigate = useNavigate();
    const location = useLocation(); // Déplacer useLocation ici
    
    const [interviewDetails, setInterviewDetails] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [saving, setSaving] = useState(false);
    const { user } = useUser(); // Récupération de l'objet utilisateur
    
    // État pour le formulaire de validation
    const [validationForm, setValidationForm] = useState({
        approved: false,
        comments: ''
    });
    
    // Déterminer si l'utilisateur est manager ou directeur
    const isManager = user?.role === 'Manager' || user?.permissions?.some(p => p.name === 'VALIDATE_AS_MANAGER');
    const isDirector = user?.role === 'Director' || user?.permissions?.some(p => p.name === 'VALIDATE_AS_DIRECTOR');

    // Variable pour déterminer si l'utilisateur a déjà validé cet entretien
    const [alreadyValidated, setAlreadyValidated] = useState(false);

    useEffect(() => {
        // Ajouter des logs pour voir ce qui est reçu
        console.log("EvaluationDetails - Props reçues:", { interview, employeeId, location: window.location });
        console.log("EvaluationDetails - URL interviewId:", urlInterviewId);
        console.log("EvaluationDetails - Interview état:", interview);
        console.log("EvaluationDetails - Localisation actuelle:", window.location.href);
        console.log("EvaluationDetails - État de location:", location.state);
        
        const fetchInterviewDetails = async () => {
            if (!actualInterviewId) {
                console.error("ID d'entretien manquant dans les props et l'URL");
                
                // Vérifier si on peut le récupérer depuis l'état de location
                const locationState = location.state;
                if (locationState?.interview?.interviewId) {
                    console.log("ID d'entretien trouvé dans location.state:", locationState.interview.interviewId);
                    const interviewFromLocation = locationState.interview;
                    setInterviewDetails(interviewFromLocation);
                    
                    // Si l'utilisateur a déjà validé cet entretien
                    if (isManager && interviewFromLocation.managerApproval !== null) {
                        setAlreadyValidated(true);
                        setValidationForm({
                            approved: interviewFromLocation.managerApproval,
                            comments: interviewFromLocation.managerComments || ''
                        });
                    } else if (isDirector && interviewFromLocation.directorApproval !== null) {
                        setAlreadyValidated(true);
                        setValidationForm({
                            approved: interviewFromLocation.directorApproval,
                            comments: interviewFromLocation.directorComments || ''
                        });
                    }
                    
                    // Si l'entretien a des notes au format JSON, les parser
                    if (interviewFromLocation.notes) {
                        try {
                            const parsedNotes = JSON.parse(interviewFromLocation.notes);
                            setInterviewDetails({
                                ...interviewFromLocation,
                                parsedNotes: parsedNotes
                            });
                        } catch (e) {
                            console.error("Erreur lors du parsing des notes JSON:", e);
                        }
                    }
                    
                    setLoading(false);
                    return;
                }
                
                setError("ID d'entretien manquant");
                setLoading(false);
                return;
            }

            try {
                // Utiliser l'employeeId pour des requêtes spécifiques si nécessaire
                console.log("Employé concerné ID:", employeeId);
                
                const response = await axios.get(`https://localhost:7082/api/EvaluationInterview/interview-details/${actualInterviewId}`);
                const data = response.data;
                setInterviewDetails(data);
                
                // Vérifier si l'utilisateur a déjà validé cet entretien
                if (isManager && data.managerApproval !== null) {
                    setAlreadyValidated(true);
                    setValidationForm({
                        approved: data.managerApproval,
                        comments: data.managerComments || ''
                    });
                } else if (isDirector && data.directorApproval !== null) {
                    setAlreadyValidated(true);
                    setValidationForm({
                        approved: data.directorApproval,
                        comments: data.directorComments || ''
                    });
                }
                
                // Si l'entretien a des notes au format JSON, les parser
                if (data.notes) {
                    try {
                        const parsedNotes = JSON.parse(data.notes);
                        // Associer les notes parsées aux détails de l'entretien
                        setInterviewDetails({
                            ...data,
                            parsedNotes: parsedNotes
                        });
                    } catch (e) {
                        console.error("Erreur lors du parsing des notes JSON:", e);
                    }
                }
            } catch (err) {
                console.error("Erreur lors du chargement des détails de l'entretien:", err);
                setError(err.response?.data || 'Erreur lors du chargement des détails');
            } finally {
                setLoading(false);
            }
        };

        fetchInterviewDetails();
    }, [actualInterviewId, isManager, isDirector, employeeId, interview, urlInterviewId, location]);

    const handleValidationChange = (e) => {
        const { name, value, type, checked } = e.target;
        setValidationForm({
            ...validationForm,
            [name]: type === 'checkbox' ? checked : value
        });
    };

    const handleValidationSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        
        try {
            // Créer le payload avec les données de validation appropriées selon le rôle
            const payload = {
                notes: interviewDetails.notes, // Préserver les notes existantes
                status: 25, // PENDING_VALIDATION
            };
            
            // Ajouter les champs spécifiques selon le rôle
            if (isManager) {
                payload.managerApproval = validationForm.approved;
                payload.managerComments = validationForm.comments;
                
                // Si directeur et déjà validé par directeur, préserver ses données
                if (interviewDetails.directorApproval !== null) {
                    payload.directorApproval = interviewDetails.directorApproval;
                    payload.directorComments = interviewDetails.directorComments;
                }
            } else if (isDirector) {
                payload.directorApproval = validationForm.approved;
                payload.directorComments = validationForm.comments;
                
                // Si manager et déjà validé par manager, préserver ses données
                if (interviewDetails.managerApproval !== null) {
                    payload.managerApproval = interviewDetails.managerApproval;
                    payload.managerComments = interviewDetails.managerComments;
                }
            }
            
            // Si validation complète, mettre le statut à COMPLETED (30)
            if ((isManager && payload.managerApproval && interviewDetails.directorApproval) || 
                (isDirector && payload.directorApproval && interviewDetails.managerApproval)) {
                payload.status = 30; // COMPLETED
            }
            
            console.log("Envoi de la validation:", payload);
            
            // Utiliser l'endpoint complete-interview pour la validation
            const response = await axios.put(
                `https://localhost:7082/api/EvaluationInterview/complete-interview/${actualInterviewId}`,
                payload
            );
            
            if (response.status === 200 || response.status === 204) {
                toast.success("Validation enregistrée avec succès");
                
                // Rediriger après un court délai
                setTimeout(() => {
                    navigate('/');
                }, 1500);
            }
        } catch (error) {
            console.error("Erreur lors de la validation:", error);
            toast.error("Erreur lors de la validation. Veuillez réessayer.");
        } finally {
            setSaving(false);
        }
    };

    // Fonction pour afficher les notes structurées
    const renderStructuredNotes = () => {
        const notes = interviewDetails.parsedNotes;
        if (!notes) return <p>Aucune note structurée disponible</p>;
        
        return (
            <div className="structured-notes">
                {/* Section Général */}
                {notes.general && (
                    <div className="note-section">
                        <h5>Informations générales</h5>
                        {notes.general.date && <p><strong>Date:</strong> {notes.general.date}</p>}
                        {notes.general.location && <p><strong>Lieu:</strong> {notes.general.location}</p>}
                        {notes.general.context && (
                            <div>
                                <p><strong>Contexte:</strong></p>
                                <p className="note-text">{notes.general.context}</p>
                            </div>
                        )}
                    </div>
                )}
                
                {/* Bilan précédent */}
                {notes.previousPeriod && (
                    <div className="note-section">
                        <h5>Bilan de la période précédente</h5>
                        {notes.previousPeriod.achievements && (
                            <div>
                                <p><strong>Réalisations:</strong></p>
                                <p className="note-text">{notes.previousPeriod.achievements}</p>
                            </div>
                        )}
                        {notes.previousPeriod.challenges && (
                            <div>
                                <p><strong>Défis:</strong></p>
                                <p className="note-text">{notes.previousPeriod.challenges}</p>
                            </div>
                        )}
                        {notes.previousPeriod.previousObjectivesAchieved && (
                            <div>
                                <p><strong>Objectifs atteints:</strong></p>
                                <p className="note-text">{notes.previousPeriod.previousObjectivesAchieved}</p>
                            </div>
                        )}
                    </div>
                )}
                
                {/* Objectifs */}
                {notes.objectives && notes.objectives.length > 0 && (
                    <div className="note-section">
                        <h5>Objectifs</h5>
                        <div className="objectives-list">
                            {notes.objectives.map((objective, i) => (
                                <div key={i} className="objective-item">
                                    <p><strong>Objectif {i+1}:</strong> {objective.description}</p>
                                    {objective.dueDate && <p><strong>Échéance:</strong> {objective.dueDate}</p>}
                                    {objective.indicator && <p><strong>Indicateur:</strong> {objective.indicator}</p>}
                                </div>
                            ))}
                        </div>
                    </div>
                )}
                
                {/* Notes globales */}
                {notes.globalNotes && (
                    <div className="note-section">
                        <h5>Notes globales</h5>
                        <p className="note-text">{notes.globalNotes}</p>
                    </div>
                )}
            </div>
        );
    };

    // Contenu à afficher en fonction de l'état du chargement
    const renderContent = () => {
        if (loading) {
            return (
                <div className="container mt-4">
                    <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '300px' }}>
                        <div className="spinner-border text-primary" role="status">
                            <span className="visually-hidden">Chargement...</span>
                        </div>
                        <span className="ms-3">Chargement des détails de l&apos;entretien...</span>
                    </div>
                </div>
            );
        }
        
        if (error) {
            return (
                <div className="container mt-4">
                    <div className="alert alert-danger">
                        <i className="mdi mdi-alert-circle me-2"></i>
                        Erreur : {error}
                    </div>
                    <button 
                        className="btn btn-secondary mt-3"
                        onClick={() => navigate('/')}
                    >
                        Retour à l&apos;accueil
                    </button>
                </div>
            );
        }
        
        if (!interviewDetails) {
            return (
                <div className="container mt-4">
                    <div className="alert alert-warning">
                        <i className="mdi mdi-information-outline me-2"></i>
                        Aucun détail disponible pour cet entretien.
                    </div>
                    <button 
                        className="btn btn-secondary mt-3"
                        onClick={() => navigate('/')}
                    >
                        Retour à l&apos;accueil
                    </button>
                </div>
            );
        }

        // Récupérer les informations de l'employé concerné par l'évaluation
        let employeeInfo = {};
        
        if (interviewDetails.employeeName || interviewDetails.position || interviewDetails.department) {
            employeeInfo = {
                fullName: interviewDetails.employeeName,
                position: interviewDetails.position,
                department: interviewDetails.department
            };
        } else if (location.state && location.state.employeeDetails) {
            employeeInfo = location.state.employeeDetails;
        }

        return (
            <div className="container-fluid mt-4">
                <div className="row">
                    <div className="col-12 mb-4">
                        <h2 className="page-title d-flex align-items-center">
                            <i className="mdi mdi-clipboard-text-outline text-primary me-2"></i>
                            Validation de l&apos;entretien d&apos;évaluation
                        </h2>
                        <nav aria-label="breadcrumb">
                            <ol className="breadcrumb">
                                <li className="breadcrumb-item"><a href="/">Accueil</a></li>
                                <li className="breadcrumb-item"><a href="/homeInterview">Entretiens</a></li>
                                <li className="breadcrumb-item active" aria-current="page">Validation</li>
                            </ol>
                        </nav>
                    </div>
                </div>
                
                {/* Informations de l'employé */}
                {employeeInfo && Object.keys(employeeInfo).length > 0 && (
                    <div className="card shadow-sm mb-4">
                        <div className="card-header bg-light">
                            <div className="d-flex justify-content-between align-items-center">
                                <h5 className="mb-0 d-flex align-items-center">
                                    <i className="mdi mdi-account-outline text-primary me-2"></i>
                                    Détails de l&apos;employé
                                </h5>
                            </div>
                        </div>
                        <div className="card-body py-3">
                            <div className="row">
                                <div className="col-md-4">
                                    <p className="mb-1 text-muted">Employé</p>
                                    <p className="mb-0 fw-bold">{employeeInfo.fullName || "Non spécifié"}</p>
                                </div>
                                <div className="col-md-4">
                                    <p className="mb-1 text-muted">Poste</p>
                                    <p className="mb-0">{employeeInfo.position || "Non spécifié"}</p>
                                </div>
                                <div className="col-md-4">
                                    <p className="mb-1 text-muted">Département</p>
                                    <p className="mb-0">{employeeInfo.department || "Non spécifié"}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
                
                {/* Informations générales sur l'entretien */}
                <div className="card shadow-sm mb-4">
                    <div className="card-header bg-light">
                        <h5 className="mb-0 d-flex align-items-center">
                            <i className="mdi mdi-information-outline text-primary me-2"></i>
                            Informations générales
                        </h5>
                    </div>
                    <div className="card-body">
                        <div className="row">
                            <div className="col-md-6">
                                <p><strong>Date de l&apos;entretien :</strong> {interviewDetails.interviewDate ? new Date(interviewDetails.interviewDate).toLocaleDateString() : "Non spécifiée"}</p>
                                <p><strong>Statut :</strong> {
                                    interviewDetails.status === 10 ? "Planifié" :
                                    interviewDetails.status === 20 ? "En cours" :
                                    interviewDetails.status === 25 ? "En attente de validation" :
                                    interviewDetails.status === 30 ? "Complété" :
                                    interviewDetails.status === 40 ? "Rejeté" :
                                    interviewDetails.status === 50 ? "Annulé" : "Inconnu"
                                }</p>
                            </div>
                            <div className="col-md-6">
                                <p><strong>Validation manager :</strong> {
                                    interviewDetails.managerApproval === null ? "En attente" : 
                                    interviewDetails.managerApproval ? "Approuvé" : "Rejeté"
                                }</p>
                                <p><strong>Validation directeur :</strong> {
                                    interviewDetails.directorApproval === null ? "En attente" : 
                                    interviewDetails.directorApproval ? "Approuvé" : "Rejeté"
                                }</p>
                            </div>
                        </div>
                    </div>
                </div>
                
                {/* Affichage des notes structurées */}
                <div className="card shadow-sm mb-4">
                    <div className="card-header bg-light">
                        <h5 className="mb-0 d-flex align-items-center">
                            <i className="mdi mdi-clipboard-list-outline text-primary me-2"></i>
                            Compte-rendu de l&apos;entretien
                        </h5>
                    </div>
                    <div className="card-body">
                        {renderStructuredNotes()}
                    </div>
                </div>
                
                {/* Formulaire de validation pour Manager/Directeur */}
                {(isManager || isDirector) && (
                    <div className="card shadow-sm mb-4">
                        <div className="card-header bg-light">
                            <h5 className="mb-0 d-flex align-items-center">
                                <i className="mdi mdi-check-circle-outline text-primary me-2"></i>
                                Validation de l&apos;entretien {isManager ? "(Manager)" : "(Directeur)"}
                            </h5>
                        </div>
                        <div className="card-body">
                            <form onSubmit={handleValidationSubmit}>
                                <div className="form-group mb-4">
                                    <div className="form-check form-switch">
                                        <input
                                            type="checkbox"
                                            className="form-check-input"
                                            id="approvalCheck"
                                            name="approved"
                                            checked={validationForm.approved}
                                            onChange={handleValidationChange}
                                        />
                                        <label className="form-check-label" htmlFor="approvalCheck">
                                            J&apos;approuve cet entretien d&apos;évaluation
                                        </label>
                                    </div>
                                    <small className="text-muted d-block mt-1">
                                        En approuvant cet entretien, vous confirmez avoir examiné et validé toutes les informations saisies.
                                    </small>
                                </div>
                                
                                <div className="form-group mb-4">
                                    <label htmlFor="validationComments" className="form-label">Commentaires</label>
                                    <textarea
                                        className="form-control"
                                        id="validationComments"
                                        name="comments"
                                        rows="4"
                                        value={validationForm.comments}
                                        onChange={handleValidationChange}
                                        placeholder="Ajoutez vos commentaires concernant cet entretien d'évaluation"
                                    ></textarea>
                                    <small className="text-muted mt-1 d-block">
                                        Ces commentaires seront visibles par les autres validateurs et le service RH.
                                    </small>
                                </div>
                                
                                <div className="d-flex justify-content-end">
                                    <button
                                        type="button"
                                        className="btn btn-outline-secondary me-2"
                                        onClick={() => navigate('/homeInterview')}
                                    >
                                        <i className="mdi mdi-arrow-left me-1"></i>
                                        Retour
                                    </button>
                                    <button
                                        type="submit"
                                        className="btn btn-primary"
                                        disabled={saving}
                                    >
                                        {saving ? (
                                            <span>
                                                <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                                                Enregistrement...
                                            </span>
                                        ) : (
                                            <>
                                                <i className="mdi mdi-content-save-outline me-1"></i>
                                                Enregistrer ma validation
                                            </>
                                        )}
                                    </button>
                                </div>
                                
                                {alreadyValidated && (
                                    <div className="alert alert-info mt-3">
                                        <i className="mdi mdi-information-outline me-2"></i>
                                        Vous avez déjà validé cet entretien. Vos modifications écraseront votre précédente validation.
                                    </div>
                                )}
                            </form>
                        </div>
                    </div>
                )}
                
                {/* Commentaires existants */}
                <div className="card shadow-sm mb-4">
                    <div className="card-header bg-light">
                        <h5 className="mb-0 d-flex align-items-center">
                            <i className="mdi mdi-comment-text-outline text-primary me-2"></i>
                            Commentaires
                        </h5>
                    </div>
                    <div className="card-body">
                        <div className="existing-comments">
                            {interviewDetails.managerComments && (
                                <div className="comment-block p-3 mb-3 bg-light rounded">
                                    <h6 className="d-flex align-items-center">
                                        <i className="mdi mdi-account-tie me-2 text-warning"></i>
                                        Commentaires du manager:
                                    </h6>
                                    <p className="comment-text mb-0 mt-2">{interviewDetails.managerComments}</p>
                                </div>
                            )}
                            
                            {interviewDetails.directorComments && (
                                <div className="comment-block p-3 bg-light rounded">
                                    <h6 className="d-flex align-items-center">
                                        <i className="mdi mdi-account-star me-2 text-info"></i>
                                        Commentaires du directeur:
                                    </h6>
                                    <p className="comment-text mb-0 mt-2">{interviewDetails.directorComments}</p>
                                </div>
                            )}
                            
                            {!interviewDetails.managerComments && !interviewDetails.directorComments && (
                                <p className="text-muted">Aucun commentaire ajouté</p>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    return (
        <Template>
            {renderContent()}
        </Template>
    );
};

EvaluationDetails.propTypes = {
    interview: PropTypes.object,
    employeeId: PropTypes.number
};

export default EvaluationDetails;
