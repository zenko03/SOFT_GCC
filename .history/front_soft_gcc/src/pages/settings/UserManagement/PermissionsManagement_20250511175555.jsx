import { useState, useEffect } from 'react';
import Template from '../../Template';
import axios from 'axios';
import { FaPlus, FaSave, FaTimes, FaChevronDown, FaChevronRight, FaSearch } from 'react-icons/fa';
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
    const [permissionsByModule, setPermissionsByModule] = useState({});
    const [expandedModules, setExpandedModules] = useState({});
    const [moduleSelectAll, setModuleSelectAll] = useState({});

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

    useEffect(() => {
        fetchPermissions();
        fetchRoles();
    }, []);

    useEffect(() => {
        if (selectedRole) {
            fetchRolePermissions(selectedRole.roleId);
        }
    }, [selectedRole]);

    useEffect(() => {
        const grouped = {};
        permissions.forEach(permission => {
            const module = permission.module || 'Autre';
            if (!grouped[module]) {
                grouped[module] = [];
            }
            grouped[module].push(permission);
        });
        
        setPermissionsByModule(grouped);
        
        const initialExpanded = {};
        Object.keys(grouped).forEach(module => {
            initialExpanded[module] = true;
        });
        setExpandedModules(initialExpanded);
        
        updateModuleSelectAllState(grouped, tempPermissions);
    }, [permissions, tempPermissions]);

    const updateModuleSelectAllState = (modules, selectedPermissions) => {
        const selectAllState = {};
        Object.keys(modules).forEach(module => {
            const modulePermissions = modules[module];
            const modulePermissionIds = modulePermissions.map(p => p.permissionId);
            const allSelected = modulePermissionIds.every(id => 
                selectedPermissions.some(p => p.permissionId === id)
            );
            selectAllState[module] = allSelected;
        });
        setModuleSelectAll(selectAllState);
    };

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

    const fetchRolePermissions = async (roleId) => {
        try {
            const response = await axios.get(`https://localhost:7082/api/Permission/role/${roleId}`);
            if (response.data && Array.isArray(response.data)) {
                setRolePermissions(response.data);
                setTempPermissions(response.data);
                setIsEditing(false);
                const newModuleSelectAll = {};
                Object.keys(permissionsByModule).forEach(module => {
                    const modulePermissions = permissionsByModule[module] || [];
                    const modulePermissionIds = modulePermissions.map(p => p.permissionId);
                    const allSelected = modulePermissionIds.every(id => 
                        response.data.some(p => p.permissionId === id)
                    );
                    newModuleSelectAll[module] = allSelected;
                });
                setModuleSelectAll(newModuleSelectAll);
            } else {
                console.error('Format de données invalide reçu:', response.data);
                toast.error('Format de données invalide reçu du serveur');
            }
        } catch (error) {
            console.error('Erreur lors de la récupération des permissions du rôle:', error);
            toast.error('Erreur lors de la récupération des permissions du rôle');
        }
    };

    const handleRoleSelect = (role) => {
        setSelectedRole(role);
        setIsEditing(false);
        setTempPermissions([]);
        const initialModuleSelectAll = {};
        Object.keys(permissionsByModule).forEach(module => {
            initialModuleSelectAll[module] = false;
        });
        setModuleSelectAll(initialModuleSelectAll);
        if (role) {
            fetchRolePermissions(role.roleId);
        }
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
        
        setTempPermissions(updatedPermissions);
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
            modulePermissions.forEach(permission => {
                if (!updatedPermissions.some(p => p.permissionId === permission.permissionId)) {
                    updatedPermissions.push(permission);
                }
            });
        } else {
            updatedPermissions = updatedPermissions.filter(permission =>
                !modulePermissions.some(p => p.permissionId === permission.permissionId)
            );
        }
        
        setTempPermissions(updatedPermissions);
    };

    const handleSavePermissions = async () => {
        if (!selectedRole) {
            toast.error('Veuillez sélectionner un rôle avant de modifier les permissions.');
            return;
        }

        try {
            const permissionIds = tempPermissions.map(p => p.permissionId);
            const response = await axios.put(
                `https://localhost:7082/api/Permission/role/${selectedRole.roleId}`,
                { permissionIds },
                { headers: { 'Content-Type': 'application/json' } }
            );
            
            await fetchRolePermissions(selectedRole.roleId);
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

    const formatPermissionName = (name) => {
        const parts = name.split('_');
        if (parts.length > 1) {
            return parts.slice(1).map(part => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase()).join(' ');
        }
        return name;
    };

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
                        <h2 className="text-gray-800 font-weight-bold">Gestion des Accès</h2>
                        <p className="text-muted">Configurez les permissions pour chaque rôle</p>
                    </div>
                    <div className="col-md-6 text-end">
                        <button
                            className="btn btn-primary d-inline-flex align-items-center"
                            onClick={() => {
                                setFormData({ name: '', description: '' });
                                setCurrentPermission(null);
                                setShowModal(true);
                            }}
                        >
                            <FaPlus className="me-2" /> Nouvelle Permission
                        </button>
                    </div>
                </div>

                <div className="row mb-4">
                    <div className="col-md-6">
                        <div className="form-group">
                            <label className="form-label text-gray-700">Rôle</label>
                            <div className="input-group">
                                <select
                                    className="form-select border-2 border-gray-300 focus:border-blue-500 rounded-lg px-3 py-2"
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
                    </div>
                    <div className="col-md-6">
                        <div className="form-group">
                            <label className="form-label text-gray-700">Rechercher une permission</label>
                            <div className="input-group">
                                <span className="input-group-text bg-white border-end-0">
                                    <FaSearch className="text-gray-500" />
                                </span>
                                <input
                                    type="text"
                                    className="form-control border-start-0 border-2 border-gray-300 focus:border-blue-500 rounded-lg px-3 py-2"
                                    placeholder="Rechercher..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                />
                            </div>
                        </div>
                    </div>
                </div>

                <div className="row">
                    <div className="col-12">
                        <div className="card shadow-sm border-0 rounded-lg overflow-hidden mb-4">
                            <div className="card-header bg-white py-3 d-flex justify-content-between align-items-center border-bottom">
                                <h6 className="m-0 font-weight-semibold text-gray-800">
                                    {selectedRole ? `Permissions du rôle : ${selectedRole.title}` : 'Veuillez sélectionner un rôle'}
                                </h6>
                                {isEditing && (
                                    <div>
                                        <button 
                                            className="btn btn-success me-2 d-inline-flex align-items-center"
                                            onClick={handleSavePermissions}
                                        >
                                            <FaSave className="me-1" /> Enregistrer
                                        </button>
                                        <button 
                                            className="btn btn-outline-secondary d-inline-flex align-items-center"
                                            onClick={handleCancelEdit}
                                        >
                                            <FaTimes className="me-1" /> Annuler
                                        </button>
                                    </div>
                                )}
                            </div>
                            <div className="card-body p-0">
                                {loading ? (
                                    <div className="text-center my-4">
                                        <div className="spinner-border text-primary" role="status">
                                            <span className="visually-hidden">Chargement...</span>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="menus p-4">
                                        {Object.keys(filteredModules).length === 0 ? (
                                            <div className="alert alert-info border-0 rounded-lg">
                                                Aucune permission ne correspond à votre recherche.
                                            </div>
                                        ) : (
                                            Object.keys(filteredModules).map(module => (
                                                <div key={module} className="module-section mb-4 border border-gray-200 rounded-lg overflow-hidden">
                                                    <div 
                                                        className="module-header d-flex align-items-center p-3 bg-gray-50 hover:bg-gray-100 transition-colors cursor-pointer"
                                                        onClick={() => setExpandedModules({
                                                            ...expandedModules,
                                                            [module]: !expandedModules[module]
                                                        })}
                                                    >
                                                        <div className="form-check me-2 flex-grow-1">
                                                            <input
                                                                className="form-check-input h-4 w-4 border-2 border-gray-300 rounded focus:ring-blue-500"
                                                                type="checkbox"
                                                                id={`module-${module}`}
                                                                checked={moduleSelectAll[module] || false}
                                                                onChange={(e) => {
                                                                    e.stopPropagation();
                                                                    handleModuleToggle(module);
                                                                }}
                                                            />
                                                            <label 
                                                                className="form-check-label text-gray-700 font-medium ml-2" 
                                                                htmlFor={`module-${module}`}
                                                                onClick={(e) => e.stopPropagation()}
                                                            >
                                                                {module}
                                                            </label>
                                                        </div>
                                                        <div className="text-gray-500">
                                                            {expandedModules[module] ? <FaChevronDown /> : <FaChevronRight />}
                                                        </div>
                                                    </div>
                                                    
                                                    {expandedModules[module] && (
                                                        <div className="module-content bg-white p-4">
                                                            <div className="row">
                                                                {filteredModules[module].map(permission => (
                                                                    <div key={permission.permissionId} className="col-md-4 mb-3">
                                                                        <div className="form-check">
                                                                            <input
                                                                                className="form-check-input h-4 w-4 border-2 border-gray-300 rounded focus:ring-blue-500"
                                                                                type="checkbox"
                                                                                id={`permission-${permission.permissionId}`}
                                                                                checked={tempPermissions.some(p => p.permissionId === permission.permissionId)}
                                                                                onChange={() => handlePermissionToggle(permission.permissionId)}
                                                                            />
                                                                            <label 
                                                                                className="form-check-label text-gray-700 ml-2" 
                                                                                htmlFor={`permission-${permission.permissionId}`}
                                                                                title={permission.description}
                                                                            >
                                                                                {formatPermissionName(permission.name)}
                                                                                {permission.description && (
                                                                                    <span className="d-block text-xs text-gray-500 mt-1">{permission.description}</span>
                                                                                )}
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
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {showModal && (
                    <div className="modal fade show" style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.5)' }}>
                        <div className="modal-dialog modal-dialog-centered">
                            <div className="modal-content border-0 shadow-lg">
                                <div className="modal-header bg-gray-50 border-bottom-0 py-3 px-4">
                                    <h5 className="modal-title text-gray-800 font-semibold">
                                        {currentPermission ? 'Modifier la permission' : 'Nouvelle permission'}
                                    </h5>
                                    <button 
                                        type="button" 
                                        className="btn-close" 
                                        onClick={() => setShowModal(false)}
                                        aria-label="Close"
                                    ></button>
                                </div>
                                <form onSubmit={async (e) => {
                                    e.preventDefault();
                                    try {
                                        if (currentPermission) {
                                            await axios.put(
                                                `https://localhost:7082/api/Permission/${currentPermission.permissionId}`,
                                                { ...currentPermission, ...formData }
                                            );
                                        } else {
                                            await axios.post('https://localhost:7082/api/Permission', formData);
                                        }
                                        setShowModal(false);
                                        fetchPermissions();
                                        setFormData({ name: '', description: '' });
                                        setCurrentPermission(null);
                                    } catch (error) {
                                        console.error('Erreur lors de l\'enregistrement:', error);
                                        toast.error(error.response?.data?.message || 'Erreur lors de l\'enregistrement de la permission');
                                    }
                                }}>
                                    <div className="modal-body px-4 py-3">
                                        <div className="mb-4">
                                            <label htmlFor="permissionName" className="form-label text-gray-700">Nom</label>
                                            <input
                                                type="text"
                                                className="form-control border-2 border-gray-300 focus:border-blue-500 focus:ring-blue-500 rounded-lg px-3 py-2"
                                                id="permissionName"
                                                value={formData.name}
                                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                                required
                                            />
                                            <small className="text-muted">Format recommandé: ACTION_RESSOURCE (ex: VIEW_USERS)</small>
                                        </div>
                                        <div className="mb-4">
                                            <label htmlFor="permissionDescription" className="form-label text-gray-700">Description</label>
                                            <textarea
                                                className="form-control border-2 border-gray-300 focus:border-blue-500 focus:ring-blue-500 rounded-lg px-3 py-2"
                                                id="permissionDescription"
                                                value={formData.description}
                                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                                rows="3"
                                            ></textarea>
                                        </div>
                                    </div>
                                    <div className="modal-footer bg-gray-50 border-top-0 px-4 py-3">
                                        <button 
                                            type="button" 
                                            className="btn btn-outline-secondary px-4 py-2 rounded-lg"
                                            onClick={() => setShowModal(false)}
                                        >
                                            Annuler
                                        </button>
                                        <button 
                                            type="submit" 
                                            className="btn btn-primary px-4 py-2 rounded-lg"
                                        >
                                            Enregistrer
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                )}
                {showModal && <div className="modal-backdrop fade show"></div>}
            </div>
            
            <style>{`
                .module-section {
                    border: 1px solid #e2e8f0;
                    border-radius: 0.5rem;
                    overflow: hidden;
                    transition: box-shadow 0.2s;
                }
                .module-section:hover {
                    box-shadow: 0 1px 3px rgba(0,0,0,0.1);
                }
                .module-header {
                    background-color: #f8fafc;
                    transition: background-color 0.2s;
                }
                .module-header:hover {
                    background-color: #f1f5f9;
                }
                .form-check-input:checked {
                    background-color: #3b82f6;
                    border-color: #3b82f6;
                }
                .module-content {
                    padding: 1rem;
                    background-color: #fff;
                }
                .form-select:focus, .form-control:focus {
                    box-shadow: 0 0 0 0.2rem rgba(59, 130, 246, 0.25);
                    border-color: #3b82f6;
                }
                .btn-close:focus {
                    box-shadow: none;
                }
            `}</style>
        </Template>
    );
}

export default PermissionsManagement;