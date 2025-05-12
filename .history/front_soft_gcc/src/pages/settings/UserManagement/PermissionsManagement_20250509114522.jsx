import { useState, useEffect, useMemo } from 'react';
import Template from '../../Template';
import axios from 'axios';
import { FaPlus, FaSave, FaTimes } from 'react-icons/fa';
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
    
    // Nouvelles variables d'état pour organiser les permissions par catégorie
    const [permissionsByCategory, setPermissionsByCategory] = useState({});
    const [expandedCategories, setExpandedCategories] = useState({});

    useEffect(() => {
        fetchPermissions();
        fetchRoles();
    }, []);

    useEffect(() => {
        if (selectedRole) {
            fetchRolePermissions(selectedRole.roleId);
        }
    }, [selectedRole]);

    // Organisez les permissions par catégorie (basé sur le préfixe du nom de la permission)
    useEffect(() => {
        const categorized = {};
        permissions.forEach(permission => {
            const prefix = permission.name.split('_')[0];
            if (!categorized[prefix]) {
                categorized[prefix] = [];
            }
            categorized[prefix].push(permission);
        });
        setPermissionsByCategory(categorized);
        
        // Initialiser toutes les catégories comme étant développées
        const initialExpanded = {};
        Object.keys(categorized).forEach(category => {
            initialExpanded[category] = true;
        });
        setExpandedCategories(initialExpanded);
    }, [permissions]);

    const filteredPermissionsList = useMemo(() => {
        if (!searchQuery || !searchQuery.trim()) {
            return permissions;
        }
        
        const searchTerms = searchQuery.toLowerCase().trim().split(' ');
        return permissions.filter(permission => {
            if (!permission || !permission.name) return false;
            
            const name = permission.name.toLowerCase();
            const description = permission.description ? permission.description.toLowerCase() : '';
            
            return searchTerms.every(term => 
                name.includes(term) || description.includes(term)
            );
        });
    }, [searchQuery, permissions]);

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
        setSearchQuery(e.target.value);
    };

    const toggleCategory = (category) => {
        setExpandedCategories(prev => ({
            ...prev,
            [category]: !prev[category]
        }));
    };

    const isPermissionChecked = (permissionId) => {
        return tempPermissions.some(p => p.permissionId === permissionId);
    };

    // Fonction pour convertir les noms de catégories en libellés plus lisibles
    const getCategoryLabel = (category) => {
        const labels = {
            'VIEW': 'Affichage',
            'CREATE': 'Création',
            'EDIT': 'Modification',
            'DELETE': 'Suppression',
            'MANAGE': 'Gestion',
            'APPROVE': 'Approbation',
            'EXPORT': 'Exportation'
        };
        return labels[category] || category;
    };

    // Formatter le nom de la permission pour affichage
    const formatPermissionName = (name) => {
        const parts = name.split('_');
        if (parts.length > 1) {
            // Supprimer le préfixe et créer une chaîne lisible
            return parts.slice(1).map(part => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase()).join(' ');
        }
        return name;
    };

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
                            <input
                                type="text"
                                className="form-control"
                                placeholder="Rechercher..."
                                value={searchQuery}
                                onChange={handleSearchChange}
                            />
                        </div>
                    </div>
                </div>

                {/* Affichage de l'interface de gestion des permissions */}
                <div className="row">
                    <div className="col-12">
                        <div className="card shadow mb-4">
                            <div className="card-header py-3 d-flex justify-content-between align-items-center">
                                <h6 className="m-0 font-weight-bold text-primary">
                                    {selectedRole ? `Permissions du rôle : ${selectedRole.title}` : 'Veuillez sélectionner un rôle'}
                                </h6>
                                {isEditing && (
                                    <div>
                                        <button className="btn btn-success me-2" onClick={handleSavePermissions}>
                                            <FaSave className="me-1" /> Enregistrer
                                        </button>
                                        <button className="btn btn-secondary" onClick={handleCancelEdit}>
                                            <FaTimes className="me-1" /> Annuler
                                        </button>
                                    </div>
                                )}
                            </div>
                            <div className="card-body">
                                {loading ? (
                                    <div className="text-center my-4">
                                        <div className="spinner-border text-primary" role="status">
                                            <span className="visually-hidden">Chargement...</span>
                                        </div>
                                    </div>
                                ) : selectedRole ? (
                                    <div className="table-responsive">
                                        <table className="table table-bordered">
                                            <thead>
                                                <tr>
                                                    <th style={{ width: '20%' }}>Module</th>
                                                    <th style={{ width: '80%' }}>Permissions</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {Object.keys(permissionsByCategory).map(category => (
                                                    <tr key={category}>
                                                        <td>
                                                            <div 
                                                                className="d-flex justify-content-between align-items-center cursor-pointer" 
                                                                onClick={() => toggleCategory(category)}
                                                                style={{ cursor: 'pointer' }}
                                                            >
                                                                <strong>{getCategoryLabel(category)}</strong>
                                                                <span>
                                                                    {expandedCategories[category] ? '▼' : '►'}
                                                                </span>
                                                            </div>
                                                        </td>
                                                        <td>
                                                            {expandedCategories[category] && (
                                                                <div className="row">
                                                                    {permissionsByCategory[category].map(permission => (
                                                                        <div key={permission.permissionId} className="col-md-4 mb-2">
                                                                            <div className="form-check">
                                                                                <input
                                                                                    className="form-check-input"
                                                                                    type="checkbox"
                                                                                    id={`permission-${permission.permissionId}`}
                                                                                    checked={isPermissionChecked(permission.permissionId)}
                                                                                    onChange={() => handlePermissionToggle(permission.permissionId)}
                                                                                />
                                                                                <label 
                                                                                    className="form-check-label" 
                                                                                    htmlFor={`permission-${permission.permissionId}`}
                                                                                    title={permission.description}
                                                                                >
                                                                                    {formatPermissionName(permission.name)}
                                                                                </label>
                                                                            </div>
                                                                        </div>
                                                                    ))}
                                                                </div>
                                                            )}
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                ) : (
                                    <div className="alert alert-info">
                                        Veuillez sélectionner un rôle pour gérer ses permissions.
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Modal pour créer/éditer une permission */}
                {showModal && (
                    <div className="modal fade show" style={{ display: 'block' }}>
                        <div className="modal-dialog">
                            <div className="modal-content">
                                <div className="modal-header">
                                    <h5 className="modal-title">
                                        {currentPermission ? 'Modifier la permission' : 'Nouvelle permission'}
                                    </h5>
                                    <button type="button" className="btn-close" onClick={() => setShowModal(false)}></button>
                                </div>
                                <form onSubmit={handleSubmit}>
                                    <div className="modal-body">
                                        <div className="mb-3">
                                            <label htmlFor="permissionName" className="form-label">Nom</label>
                                            <input
                                                type="text"
                                                className="form-control"
                                                id="permissionName"
                                                value={formData.name}
                                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                                required
                                            />
                                            <small className="text-muted">Format recommandé: ACTION_RESSOURCE (ex: VIEW_USERS)</small>
                                        </div>
                                        <div className="mb-3">
                                            <label htmlFor="permissionDescription" className="form-label">Description</label>
                                            <textarea
                                                className="form-control"
                                                id="permissionDescription"
                                                value={formData.description}
                                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                                rows="3"
                                            ></textarea>
                                        </div>
                                    </div>
                                    <div className="modal-footer">
                                        <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Annuler</button>
                                        <button type="submit" className="btn btn-primary">Enregistrer</button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                )}
                {showModal && <div className="modal-backdrop fade show"></div>}
            </div>
        </Template>
    );
}

export default PermissionsManagement; 