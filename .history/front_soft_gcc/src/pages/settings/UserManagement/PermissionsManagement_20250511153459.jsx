import { useState, useEffect } from 'react';
import Template from '../../Template';
import axios from 'axios';
import { FaPlus, FaSave, FaTimes, FaChevronDown, FaChevronRight } from 'react-icons/fa';
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
    
    // Nouvelles variables d'état pour organiser les permissions par module
    const [permissionsByModule, setPermissionsByModule] = useState({});
    const [expandedModules, setExpandedModules] = useState({});
    const [moduleSelectAll, setModuleSelectAll] = useState({});

    useEffect(() => {
        fetchPermissions();
        fetchRoles();
    }, []);

    useEffect(() => {
        if (selectedRole) {
            fetchRolePermissions(selectedRole.roleId);
        }
    }, [selectedRole]);

    // Organiser les permissions par le module fourni par le backend
    useEffect(() => {
        // Grouper par module
        const grouped = {};
        permissions.forEach(permission => {
            const module = permission.module || 'Autre';
            
            if (!grouped[module]) {
                grouped[module] = [];
            }
            
            grouped[module].push(permission);
        });
        
        setPermissionsByModule(grouped);
        
        // Initialiser l'état d'expansion des modules
        const initialExpanded = {};
        Object.keys(grouped).forEach(module => {
            initialExpanded[module] = true;
        });
        setExpandedModules(initialExpanded);
        
        // Vérifier quels modules ont toutes leurs permissions sélectionnées
        updateModuleSelectAllState(grouped, tempPermissions);
    }, [permissions, tempPermissions]);

    // Mettre à jour l'état "tout sélectionner" pour chaque module
    const updateModuleSelectAllState = (modules, selectedPermissions) => {
        const selectAllState = {};
        
        Object.keys(modules).forEach(module => {
            const modulePermissions = modules[module];
            const modulePermissionIds = modulePermissions.map(p => p.permissionId);
            
            // Vérifier si toutes les permissions de ce module sont sélectionnées
            const allSelected = modulePermissionIds.every(id => 
                selectedPermissions.some(p => p.permissionId === id)
            );
            
            selectAllState[module] = allSelected;
        });
        
        setModuleSelectAll(selectAllState);
    };

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
            // Normaliser les données pour avoir une structure cohérente
            const normalizedRoles = response.data.map(role => ({
                roleId: role.roleid,
                title: role.title,
                state: role.state
            }));
            setRoles(normalizedRoles);
        } catch (error) {
            console.error('Erreur lors de la récupération des rôles:', error);
            toast.error('Erreur lors de la récupération des rôles');
        }
    };

    const fetchRolePermissions = async (roleId) => {
        try {
            console.log('Fetching permissions for role:', roleId);
            const response = await axios.get(`https://localhost:7082/api/Permission/role/${roleId}`);
            console.log('Permissions reçues:', response.data);
            
            if (response.data && Array.isArray(response.data)) {
                setRolePermissions(response.data);
                setTempPermissions(response.data);
                setIsEditing(false);
                
                // Mettre à jour l'état "tout sélectionner" pour chaque module
                updateModuleSelectAllState(permissionsByModule, response.data);
            } else {
                console.error('Format de données invalide reçu:', response.data);
                toast.error('Format de données invalide reçu du serveur');
            }
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

    const handleRoleSelect = (role) => {
        console.log('Rôle sélectionné:', role);
        setSelectedRole(role);
        setIsEditing(false);
    };

    const handlePermissionToggle = (permissionId) => {
        if (!isEditing) {
            setIsEditing(true);
        }
        
        const isCurrentlyAssigned = tempPermissions.some(p => p.permissionId === permissionId);
        let updatedPermissions;
        
        if (isCurrentlyAssigned) {
            updatedPermissions = tempPermissions.filter(p => p.permissionId !== permissionId);
        } else {
            const permissionToAdd = permissions.find(p => p.permissionId === permissionId);
            if (permissionToAdd) {
                updatedPermissions = [...tempPermissions, permissionToAdd];
            } else {
                console.error('Permission non trouvée:', permissionId);
                return;
            }
        }
        
        console.log('Permissions mises à jour:', updatedPermissions);
        setTempPermissions(updatedPermissions);
        
        // Mettre à jour l'état des cases à cocher des modules
        updateModuleSelectAllState(permissionsByModule, updatedPermissions);
    };

    const handleModuleToggle = (module) => {
        if (!isEditing) {
            setIsEditing(true);
        }
        
        const newSelectAllState = !moduleSelectAll[module];
        setModuleSelectAll({
            ...moduleSelectAll,
            [module]: newSelectAllState
        });
        
        const modulePermissions = permissionsByModule[module] || [];
        let updatedPermissions = [...tempPermissions];
        
        if (newSelectAllState) {
            // Ajouter toutes les permissions du module qui ne sont pas déjà sélectionnées
            modulePermissions.forEach(permission => {
                if (!updatedPermissions.some(p => p.permissionId === permission.permissionId)) {
                    updatedPermissions.push(permission);
                }
            });
        } else {
            // Retirer toutes les permissions du module
            updatedPermissions = updatedPermissions.filter(permission =>
                !modulePermissions.some(p => p.permissionId === permission.permissionId)
            );
        }
        
        setTempPermissions(updatedPermissions);
    };

    const handleToggleModuleExpansion = (module) => {
        setExpandedModules({
            ...expandedModules,
            [module]: !expandedModules[module]
        });
    };

    const handleSavePermissions = async () => {
        if (!selectedRole) {
            toast.error('Veuillez sélectionner un rôle avant de modifier les permissions.');
            return;
        }

        try {
            const permissionIds = tempPermissions.map(p => p.permissionId);
            console.log('Envoi des permissions:', permissionIds);
            
            const response = await axios.put(
                `https://localhost:7082/api/Permission/role/${selectedRole.roleId}`,
                { permissionIds },
                { headers: { 'Content-Type': 'application/json' } }
            );
            
            console.log('Réponse du serveur:', response.data);
            
            // Recharger les permissions du rôle
            await fetchRolePermissions(selectedRole.roleId);
            
            // Recharger toutes les permissions pour mettre à jour l'interface
            await fetchPermissions();
            
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
        updateModuleSelectAllState(permissionsByModule, rolePermissions);
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

    const isPermissionChecked = (permissionId) => {
        return tempPermissions.some(p => p.permissionId === permissionId);
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

    // Filtrer les permissions par la recherche
    const getFilteredModules = () => {
        if (!searchQuery.trim()) {
            return permissionsByModule;
        }
        
        const filtered = {};
        const search = searchQuery.toLowerCase().trim();
        
        Object.keys(permissionsByModule).forEach(module => {
            const filteredPermissions = permissionsByModule[module].filter(permission => 
                permission.name.toLowerCase().includes(search) || 
                (permission.description && permission.description.toLowerCase().includes(search))
            );
            
            if (filteredPermissions.length > 0) {
                filtered[module] = filteredPermissions;
            }
        });
        
        return filtered;
    };

    const filteredModules = getFilteredModules();

    return (
        <Template>
            <div className="container-fluid">
                <div className="row mb-4 align-items-center">
                    <div className="col-md-6">
                        <h2>Gestion des Accès</h2>
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
                            <label className="form-label">Rôle</label>
                            <select
                                className="form-select"
                                value={selectedRole?.roleId || ''}
                                onChange={(e) => {
                                    const selectedValue = e.target.value;
                                    console.log('Valeur sélectionnée:', selectedValue);
                                    const role = roles.find(r => r.roleId === parseInt(selectedValue));
                                    console.log('Rôle trouvé:', role);
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
                                    <div className="menus">
                                        {Object.keys(filteredModules).length === 0 ? (
                                            <div className="alert alert-info">
                                                Aucune permission ne correspond à votre recherche.
                                            </div>
                                        ) : (
                                            Object.keys(filteredModules).map(module => (
                                                <div key={module} className="module-section mb-4">
                                                    <div 
                                                        className="module-header d-flex align-items-center p-2 bg-light rounded"
                                                        style={{ cursor: 'pointer' }}
                                                        onClick={() => handleToggleModuleExpansion(module)}
                                                    >
                                                        <div className="form-check me-2">
                                                            <input
                                                                className="form-check-input"
                                                                type="checkbox"
                                                                id={`module-${module}`}
                                                                checked={moduleSelectAll[module] || false}
                                                                onChange={(e) => {
                                                                    e.stopPropagation();
                                                                    handleModuleToggle(module);
                                                                }}
                                                            />
                                                            <label 
                                                                className="form-check-label" 
                                                                htmlFor={`module-${module}`}
                                                                onClick={(e) => e.stopPropagation()}
                                                            >
                                                                {module}
                                                            </label>
                                                        </div>
                                                        <div className="ms-auto">
                                                            {expandedModules[module] ? <FaChevronDown /> : <FaChevronRight />}
                                                        </div>
                                                    </div>
                                                    
                                                    {expandedModules[module] && (
                                                        <div className="module-content mt-2 ms-4">
                                                            <div className="row">
                                                                {filteredModules[module].map(permission => (
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
                                                        </div>
                                                    )}
                                                </div>
                                            ))
                                        )}
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
            
            {/* CSS pour le style de la gestion des permissions */}
            <style>{`
                .module-section {
                    border: 1px solid #e3e6f0;
                    border-radius: 0.35rem;
                    overflow: hidden;
                }
                .module-header {
                    background-color: #f8f9fc;
                    transition: background-color 0.2s;
                }
                .module-header:hover {
                    background-color: #eaecf4;
                }
                .form-check-input:checked {
                    background-color: #4e73df;
                    border-color: #4e73df;
                }
                .module-content {
                    padding: 1rem;
                    background-color: #fff;
                }
            `}</style>
        </Template>
    );
}

export default PermissionsManagement; 