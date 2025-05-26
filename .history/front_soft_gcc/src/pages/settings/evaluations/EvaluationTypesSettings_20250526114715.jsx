import { useState, useEffect, useCallback } from 'react';
import Template from '../../Template';
import EvaluationTypeService from '../../../services/Evaluations/EvaluationTypeService';
import { toast } from 'react-toastify'; // Assurez-vous d'avoir react-toastify ou un système de notification similaire

function EvaluationTypesSettings() {
    const [evaluationTypes, setEvaluationTypes] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    const [showModal, setShowModal] = useState(false);
    const [currentEvaluationType, setCurrentEvaluationType] = useState(null); // Pour l'édition
    const [formData, setFormData] = useState({ designation: '', state: 1 });

    const fetchEvaluationTypes = useCallback(async () => {
        setIsLoading(true);
        try {
            const response = await EvaluationTypeService.getEvaluationTypes();
            setEvaluationTypes(response.data);
            setError(null);
        } catch (err) {
            setError(err.message || 'Erreur lors de la récupération des types d\'évaluation.');
            toast.error(err.message || 'Erreur lors de la récupération des types d\'évaluation.');
        }
        setIsLoading(false);
    }, []);

    useEffect(() => {
        fetchEvaluationTypes();
    }, [fetchEvaluationTypes]);

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? (checked ? 1 : 0) : value
        }));
    };

    const resetForm = () => {
        setFormData({ designation: '', state: 1 });
        setCurrentEvaluationType(null);
    };

    const handleOpenModal = (evaluationType = null) => {
        if (evaluationType) {
            setCurrentEvaluationType(evaluationType);
            setFormData({ 
                designation: evaluationType.designation,
                state: evaluationType.state !== undefined ? evaluationType.state : 1
            });
        }
        setShowModal(true);
    };

    const handleCloseModal = () => {
        resetForm();
        setShowModal(false);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            if (currentEvaluationType && currentEvaluationType.evaluation_type_id) {
                await EvaluationTypeService.updateEvaluationType(currentEvaluationType.evaluation_type_id, {
                    ...formData,
                    evaluation_type_id: currentEvaluationType.evaluation_type_id
                });
                toast.success('Type d\'évaluation mis à jour avec succès !');
            } else {
                await EvaluationTypeService.createEvaluationType(formData);
                toast.success('Type d\'évaluation créé avec succès !');
            }
            fetchEvaluationTypes();
            handleCloseModal();
        } catch (err) {
            setError(err.message || 'Erreur lors de la soumission.');
            toast.error(err.message || 'Erreur lors de la soumission.');
        }
        setIsLoading(false);
    };

    const handleDelete = async (id) => {
        if (window.confirm('Êtes-vous sûr de vouloir supprimer ce type d\'évaluation ?')) {
            setIsLoading(true);
            try {
                await EvaluationTypeService.deleteEvaluationType(id);
                toast.success('Type d\'évaluation supprimé avec succès !');
                fetchEvaluationTypes();
            } catch (err) {
                setError(err.message || 'Erreur lors de la suppression.');
                toast.error(err.message || 'Erreur lors de la suppression.');
            }
            setIsLoading(false);
        }
    };

    return (
        <Template>
            <div className="content-wrapper">
                <div className="row">
                    <div className="col-md-12 grid-margin">
                        <div className="d-flex justify-content-between align-items-center">
                            <h4 className="font-weight-bold mb-0">
                                <i className="mdi mdi-format-list-bulleted-type menu-icon"></i> Gestion des Types d&apos;Évaluation
                            </h4>
                            <button className="btn btn-primary" onClick={() => handleOpenModal()}>Ajouter un Type</button>
                        </div>
                    </div>
                </div>

                {isLoading && <p>Chargement...</p>}
                {error && <p className="text-danger">{error}</p>}

                <div className="row">
                    <div className="col-lg-12 grid-margin stretch-card">
                        <div className="card">
                            <div className="card-body">
                                <h4 className="card-title">Liste des Types d&apos;Évaluation</h4>
                                <div className="table-responsive">
                                    <table className="table table-striped">
                                        <thead>
                                            <tr>
                                                <th>ID</th>
                                                <th>Désignation</th>
                                                <th>État</th>
                                                <th>Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {evaluationTypes.map(et => (
                                                <tr key={et.evaluation_type_id}>
                                                    <td>{et.evaluation_type_id}</td>
                                                    <td>{et.designation}</td>
                                                    <td>{et.state === 1 ? <span className="badge badge-success">Actif</span> : <span className="badge badge-danger">Inactif</span>}</td>
                                                    <td>
                                                        <button className="btn btn-sm btn-outline-info mr-2" onClick={() => handleOpenModal(et)}>Modifier</button>
                                                        <button className="btn btn-sm btn-outline-danger" onClick={() => handleDelete(et.evaluation_type_id)}>Supprimer</button>
                                                    </td>
                                                </tr>
                                            ))}
                                            {evaluationTypes.length === 0 && (
                                                <tr>
                                                    <td colSpan="4" className="text-center">Aucun type d&apos;évaluation trouvé.</td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Modal pour Ajouter/Modifier */} 
                {showModal && (
                    <div className="modal fade show d-block" tabIndex="-1" role="dialog" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
                        <div className="modal-dialog modal-dialog-centered" role="document">
                            <div className="modal-content">
                                <form onSubmit={handleSubmit}>
                                    <div className="modal-header">
                                        <h5 className="modal-title">{currentEvaluationType ? 'Modifier le' : 'Ajouter un'} Type d&apos;Évaluation</h5>
                                        <button type="button" className="close" onClick={handleCloseModal} aria-label="Close">
                                            <span aria-hidden="true">&times;</span>
                                        </button>
                                    </div>
                                    <div className="modal-body">
                                        <div className="form-group">
                                            <label htmlFor="designation">Désignation</label>
                                            <input 
                                                type="text" 
                                                className="form-control"
                                                id="designation"
                                                name="designation"
                                                value={formData.designation}
                                                onChange={handleInputChange}
                                                required 
                                            />
                                        </div>
                                        <div className="form-group">
                                            <label htmlFor="state">État</label>
                                            <select 
                                                className="form-control"
                                                id="state"
                                                name="state"
                                                value={formData.state}
                                                onChange={handleInputChange}
                                            >
                                                <option value={1}>Actif</option>
                                                <option value={0}>Inactif</option>
                                            </select>
                                        </div>
                                    </div>
                                    <div className="modal-footer">
                                        <button type="button" className="btn btn-secondary" onClick={handleCloseModal}>Annuler</button>
                                        <button type="submit" className="btn btn-primary" disabled={isLoading}>
                                            {isLoading ? 'Sauvegarde...' : (currentEvaluationType ? 'Modifier' : 'Créer')}
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </Template>
    );
}

export default EvaluationTypesSettings; 