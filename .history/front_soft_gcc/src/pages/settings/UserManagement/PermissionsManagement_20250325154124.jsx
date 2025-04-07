import { useState, useEffect } from 'react';
import Template from '../../Template';
import axios from 'axios';
import { FaEdit, FaTrash, FaPlus, FaSave, FaTimes } from 'react-icons/fa';
import { useUser } from '../../../pages/Evaluations/EvaluationInterview/UserContext';
import { toast } from 'react-hot-toast';

function PermissionsManagement() {
    const { hasPermission } = useUser();
    const [permissions, setPermissions] = useState([]);
    const [roles, setRoles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [currentPermission, setCurrentPermission] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        description: ''
    });
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedRole, setSelectedRole] = useState(null);
    const [rolePermissions, setRolePermissions] = useState([]);
    const [isEditing, setIsEditing] = useState(false);
    const [tempPermissions, setTempPermissions] = useState([]);

    useEffect(() => {
        fetchPermissions();
        fetchRoles();
    }, []);

    useEffect(() => {
        if (selectedRole) {
            fetchRolePermissions(selectedRole.roleId);
        }
    }, [selectedRole]);

    // Vérification des permissions
    if (!hasPermission('MANAGE_PERMISSIONS')) {
        return (
            <Template>
                <div className="container mt-4">
                    <div className="alert alert-danger">
                        <h4>Accès non autorisé</h4>
                        <p>Cette section est réservée aux administrateurs système uniquement.</p>
                    </div>
                </div>
            </Template>
        );
    }

    const fetchPermissions = async () => {
        try {
            setLoading(true);
            const response = await axios.get('https://localhost:7082/api/Permission');
            setPermissions(response.data);
        } catch (error) {
            console.error('Erreur lors de la récupération des permissions:', error);
            toast.error('Erreur lors de la récupération des permissions');
        } finally {
            setLoading(false);
        }
    };

    const fetchRoles = async () => {
        try {
            const response = await axios.get('https://localhost:7082/api/Role');
            setRoles(response.data);
        } catch (error) {
            console.error('Erreur lors de la récupération des rôles:', error);
            toast.error('Erreur lors de la récupération des rôles');
        }
    };

    const fetchRolePermissions = async (roleId) => {
        try {
            const response = await axios.get(`https://localhost:7082/api/Permission/role/${roleId}`);
            setRolePermissions(response.data);
            setTempPermissions(response.data);
            setIsEditing(false);
        } catch (error) {
            console.error('Erreur lors de la récupération des permissions du rôle:', error);
            toast.error('Erreur lors de la récupération des permissions du rôle');
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const updatedPermission = {
                ...currentPermission, // Inclut les données existantes (ex: PermissionId, State)
                name: formData.name,
                description: formData.description
            };

            if (currentPermission) {
                await axios.put(
                    `https://localhost:7082/api/Permission/${currentPermission.permissionId}`,
                    updatedPermission // Envoie l'objet complet
                );
            } else {
                await axios.post('https://localhost:7082/api/Permission', formData);
            }
            setShowModal(false);
            fetchPermissions();
            resetForm();
        } catch (error) {
            console.error('Erreur lors de l\'enregistrement:', error);
            toast.error(error.response?.data?.message || 'Erreur lors de l\'enregistrement de la permission');
        }
    };

    const handleEdit = (permission) => {
        setCurrentPermission(permission);
        setFormData({
            name: permission.name,
            description: permission.description
        });
        setShowModal(true);
    };

    const handleDelete = async (permissionId) => {
        if (window.confirm('Êtes-vous sûr de vouloir supprimer cette permission ?')) {
            try {
                await axios.delete(`https://localhost:7082/api/Permission/${permissionId}`);
                toast.success('Permission supprimée avec succès');
                fetchPermissions();
            } catch (error) {
                console.error('Erreur lors de la suppression:', error);
                toast.error(error.response?.data?.message || 'Erreur lors de la suppression de la permission');
            }
        }
    };

    const handleRoleSelect = (role) => {
        setSelectedRole(role);
        setIsEditing(false);
    };

    const handlePermissionToggle = (permissionId) => {
        if (!isEditing) {
            setIsEditing(true);
        }
        
        const isCurrentlyAssigned = tempPermissions.some(p => p.permissionId === permissionId);
        if (isCurrentlyAssigned) {
            setTempPermissions(tempPermissions.filter(p => p.permissionId !== permissionId));
        } else {
            const permissionToAdd = permissions.find(p => p.permissionId === permissionId);
            setTempPermissions([...tempPermissions, permissionToAdd]);
        }
    };

    const handleSavePermissions = async () => {
        if (!selectedRole) {
            toast.error('Veuillez sélectionner un rôle avant de modifier les permissions.');
            return;
        }

        try {
            const permissionIds = tempPermissions.map(p => p.permissionId);
            await axios.put(
                `https://localhost:7082/api/Permission/role/${selectedRole.roleId}`,
                { permissionIds },
                { headers: { 'Content-Type': 'application/json' } }
            );
            
            setRolePermissions(tempPermissions);
            setIsEditing(false);
            toast.success('Permissions mises à jour avec succès');
        } catch (error) {
            console.error('Erreur lors de la mise à jour des permissions:', error);
            toast.error(error.response?.data?.message || 'Erreur lors de la mise à jour des permissions');
        }
    };

    const handleCancelEdit = () => {
        setTempPermissions(rolePermissions);
        setIsEditing(false);
    };

    const resetForm = () => {
        setCurrentPermission(null);
        setFormData({
            name: '',
            description: ''
        });
    };

    const handleSearchChange = (e) => {
        const value = e.target.value;
        console.log('Nouvelle valeur de recherche:', value);
        setSearchQuery(value);
    };

    // Fonction de filtrage corrigée et optimisée
    const getFilteredPermissions = () => {
        if (!searchQuery || !searchQuery.trim()) {
            console.log('Aucun filtre actif, retourne toutes les permissions:', permissions.length);
            return permissions;
        }
        
        const searchTerms = searchQuery.toLowerCase().trim().split(' ');
        console.log('Termes de recherche:', searchTerms);
        
        const results = permissions.filter(permission => {
            if (!permission || !permission.name) return false;
            
            const name = permission.name.toLowerCase();
            const description = permission.description ? permission.description.toLowerCase() : '';
            
            // Vérifier si tous les termes de recherche sont présents dans le nom ou la description
            const isMatch = searchTerms.every(term => 
                name.includes(term) || description.includes(term)
            );
            
            return isMatch;
        });
        
        console.log('Résultats filtrés:', results.length);
        return results;
    };

    // Obtenir les permissions filtrées à chaque rendu
    const filteredPermissions = getFilteredPermissions();

    return (
        <Template>
            <div className="container-fluid">
                <div className="row mb-4 align-items-center">
                    <div className="col-md-6">
                        <h2>Gestion des Permissions</h2>
                    </div>
                    <div className="col-md-6 text-end">
                        <button
                            className="btn btn-primary"
                            onClick={() => {
                                resetForm();
                                setShowModal(true);
                            }}
                        >
                            <FaPlus className="me-2" /> Nouvelle Permission
                        </button>
                    </div>
                </div>

                {/* Sélection du rôle et recherche */}
                <div className="row mb-4">
                    <div className="col-md-6">
                        <div className="form-group">
                            <label className="form-label">Sélectionner un rôle</label>
                            <select
                                className="form-select"
                                value={selectedRole?.roleId || ''}
                                onChange={(e) => {
                                    const role = roles.find(r => r.roleId === parseInt(e.target.value));
                                    handleRoleSelect(role);
                                }}
                            >
                                <option value="">Choisir un rôle...</option>
                                {roles.map((role) => (
                                    <option key={role.roleId} value={role.roleId}>
                                        {role.title}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>
                    <div className="col-md-6">
                        <div className="form-group">
                            <label className="form-label">Rechercher une permission</label>
                            <div className="input-group">
                                <input
                                    type="text"
                                    className="form-control"
                                    placeholder="Nom ou description..."
                                    value={searchQuery}
                                    onChange={handleSearchChange}
                                    autoComplete="off"
                                />
                                {searchQuery && (
                                    <button 
                                        className="btn btn-outline-secondary" 
                                        type="button"
                                        onClick={() => {
                                            console.log('Effacement du filtre');
                                            setSearchQuery('');
                                        }}
                                    >
                                        <i className="fas fa-times"></i>
                                    </button>
                                )}
                            </div>
                            <small className="form-text text-muted mt-1">
                                {searchQuery.trim() 
                                    ? `${filteredPermissions.length} permission(s) trouvée(s)` 
                                    : `${permissions.length} permissions au total`
                                }
                            </small>
                        </div>
                    </div>
                </div>

                {/* Affichage d'un message quand aucun résultat de recherche */}
                {searchQuery && filteredPermissions.length === 0 && !loading && (
                    <div className="alert alert-info">
                        <i className="fas fa-search me-2"></i>
                        Aucune permission ne correspond à &quot;{searchQuery}&quot;
                    </div>
                )}

                {/* Boutons d'action pour les permissions du rôle */}
                {selectedRole && (
                    <div className="row mb-3">
                        <div className="col-12">
                            {isEditing ? (
                                <div className="alert alert-warning">
                                    <div className="d-flex justify-content-between align-items-center">
                                        <div>
                                            <i className="fas fa-exclamation-triangle me-2"></i>
                                            Modifications en cours. N&apos;oubliez pas d&apos;enregistrer vos changements.
                                        </div>
                                        <div>
                                            <button
                                                className="btn btn-success me-2"
                                                onClick={handleSavePermissions}
                                            >
                                                <FaSave className="me-2" /> Enregistrer
                                            </button>
                                            <button
                                                className="btn btn-secondary"
                                                onClick={handleCancelEdit}
                                            >
                                                <FaTimes className="me-2" /> Annuler
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="alert alert-info">
                                    <i className="fas fa-info-circle me-2"></i>
                                    Cliquez sur les cases à cocher pour modifier les permissions de ce rôle
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* Table des permissions */}
                <div className="table-responsive">
                    <table className="table table-hover">
                        <thead className="table-light">
                            <tr>
                                <th>Nom</th>
                                <th>Description</th>
                                {selectedRole && <th className="text-center">Attribuée</th>}
                                <th className="text-center">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr>
                                    <td colSpan="4" className="text-center py-4">
                                        <div className="spinner-border text-primary" role="status">
                                            <span className="visually-hidden">Chargement...</span>
                                        </div>
                                    </td>
                                </tr>
                            ) : filteredPermissions.length === 0 && !searchQuery ? (
                                <tr>
                                    <td colSpan="4" className="text-center py-4">
                                        Aucune permission trouvée
                                    </td>
                                </tr>
                            ) : (
                                filteredPermissions.map((permission) => (
                                    <tr key={permission.permissionId}>
                                        <td>{permission.name}</td>
                                        <td>{permission.description}</td>
                                        {selectedRole && (
                                            <td className="text-center">
                                                <div className="form-check d-flex justify-content-center">
                                                    <input
                                                        type="checkbox"
                                                        className="form-check-input"
                                                        checked={isEditing 
                                                            ? tempPermissions.some(p => p.permissionId === permission.permissionId)
                                                            : rolePermissions.some(p => p.permissionId === permission.permissionId)
                                                        }
                                                        onChange={() => handlePermissionToggle(permission.permissionId)}
                                                        disabled={!isEditing && !rolePermissions.some(p => p.permissionId === permission.permissionId)}
                                                    />
                                                </div>
                                            </td>
                                        )}
                                        <td className="text-center">
                                            <button
                                                className="btn btn-sm btn-outline-primary me-2"
                                                onClick={() => handleEdit(permission)}
                                                title="Modifier"
                                            >
                                                <FaEdit />
                                            </button>
                                            <button
                                                className="btn btn-sm btn-outline-danger"
                                                onClick={() => handleDelete(permission.permissionId)}
                                                title="Supprimer"
                                            >
                                                <FaTrash />
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Modal pour ajouter/modifier une permission */}
                {showModal && (
                    <>
                        <div className="modal-backdrop fade show"></div>
                        <div className="modal fade show" style={{ display: 'block' }}>
                            <div className="modal-dialog">
                                <div className="modal-content">
                                    <div className="modal-header">
                                        <h5 className="modal-title">
                                            {currentPermission ? 'Modifier' : 'Ajouter'} une permission
                                        </h5>
                                        <button
                                            type="button"
                                            className="btn-close"
                                            onClick={() => setShowModal(false)}
                                        ></button>
                                    </div>
                                    <form onSubmit={handleSubmit}>
                                        <div className="modal-body">
                                            <div className="mb-3">
                                                <label className="form-label">Nom de la Permission</label>
                                                <input
                                                    type="text"
                                                    className="form-control"
                                                    value={formData.name}
                                                    onChange={(e) =>
                                                        setFormData({ ...formData, name: e.target.value })
                                                    }
                                                    required
                                                />
                                            </div>
                                            <div className="mb-3">
                                                <label className="form-label">Description</label>
                                                <textarea
                                                    className="form-control"
                                                    value={formData.description}
                                                    onChange={(e) =>
                                                        setFormData({ ...formData, description: e.target.value })
                                                    }
                                                    required
                                                />
                                            </div>
                                        </div>
                                        <div className="modal-footer">
                                            <button
                                                type="button"
                                                className="btn btn-secondary"
                                                onClick={() => setShowModal(false)}
                                            >
                                                Annuler
                                            </button>
                                            <button type="submit" className="btn btn-primary">
                                                {currentPermission ? 'Modifier' : 'Ajouter'}
                                            </button>
                                        </div>
                                    </form>
                                </div>
                            </div>
                        </div>
                    </>
                )}
            </div>
        </Template>
    );
}

export default PermissionsManagement; 