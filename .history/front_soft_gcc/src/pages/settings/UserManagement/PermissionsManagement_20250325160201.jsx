import React, { useState, useEffect, useMemo } from 'react';
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
    const [formData, setFormData] = useState({ name: '', description: '' });
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

    if (!hasPermission('MANAGE_PERMISSIONS')) {
        return (
            <Template>
                <div className="container mt-4">
                    <div className="alert alert-danger">
                        <h4>Accès non autorisé</h4>
                        <p>Vous devez être administrateur pour accéder à cette section.</p>
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
            toast.error('Erreur lors du chargement des permissions');
        } finally {
            setLoading(false);
        }
    };

    const fetchRoles = async () => {
        try {
            const response = await axios.get('https://localhost:7082/api/Role');
            setRoles(response.data);
        } catch (error) {
            toast.error('Erreur lors du chargement des rôles');
        }
    };

    const fetchRolePermissions = async (roleId) => {
        try {
            const response = await axios.get(`https://localhost:7082/api/Permission/role/${roleId}`);
            setRolePermissions(response.data);
            setTempPermissions(response.data);
        } catch (error) {
            toast.error('Erreur lors du chargement des permissions du rôle');
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const updatedPermission = currentPermission 
                ? { 
                    ...currentPermission, 
                    name: formData.name,
                    description: formData.description 
                } 
                : formData;

            if (currentPermission) {
                await axios.put(
                    `https://localhost:7082/api/Permission/${currentPermission.permissionId}`,
                    updatedPermission
                );
                toast.success('Permission modifiée avec succès');
            } else {
                await axios.post('https://localhost:7082/api/Permission', formData);
                toast.success('Permission créée avec succès');
            }

            setShowModal(false);
            fetchPermissions();
            resetForm();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Erreur lors de l\'enregistrement');
        }
    };

    const filteredPermissionsList = useMemo(() => {
        if (!searchQuery.trim()) return permissions;

        const cleanQuery = searchQuery
            .toLowerCase()
            .trim()
            .replace(/[^a-z0-9\s]/gi, '');

        return permissions.filter(permission => {
            const nameMatch = permission.name?.toLowerCase().includes(cleanQuery);
            const descriptionMatch = permission.description?.toLowerCase().includes(cleanQuery);
            return nameMatch || descriptionMatch;
        });
    }, [searchQuery, permissions]);

    const handlePermissionToggle = (permissionId) => {
        setIsEditing(true);
        const isAssigned = tempPermissions.some(p => p.permissionId === permissionId);
        const permission = permissions.find(p => p.permissionId === permissionId);

        if (isAssigned) {
            setTempPermissions(tempPermissions.filter(p => p.permissionId !== permissionId));
        } else if (permission) {
            setTempPermissions([...tempPermissions, permission]);
        }
    };

    const handleSavePermissions = async () => {
        if (!selectedRole) return toast.error('Veuillez sélectionner un rôle');

        try {
            await axios.put(
                `https://localhost:7082/api/Permission/role/${selectedRole.roleId}`,
                { permissionIds: tempPermissions.map(p => p.permissionId) }
            );
            setRolePermissions(tempPermissions);
            setIsEditing(false);
            toast.success('Permissions mises à jour');
        } catch (error) {
            toast.error(error.response?.data?.message || 'Erreur lors de la mise à jour');
        }
    };

    const resetForm = () => {
        setCurrentPermission(null);
        setFormData({ name: '', description: '' });
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

                <div className="row mb-4">
                    <div className="col-md-6">
                        <select
                            className="form-select"
                            value={selectedRole?.roleId || ''}
                            onChange={(e) => {
                                const role = roles.find(r => r.roleId === parseInt(e.target.value));
                                setSelectedRole(role);
                                setIsEditing(false);
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
                    <div className="col-md-6">
                        <input
                            type="text"
                            className="form-control"
                            placeholder="Rechercher..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                </div>

                {selectedRole && (
                    <div className="row mb-3">
                        <div className="col-12">
                            {isEditing ? (
                                <div className="alert alert-warning d-flex justify-content-between">
                                    <div>
                                        <FaExclamationTriangle className="me-2" />
                                        Modifications en cours
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
                                            onClick={() => setTempPermissions(rolePermissions)}
                                        >
                                            <FaTimes className="me-2" /> Annuler
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <div className="alert alert-info">
                                    <FaInfoCircle className="me-2" />
                                    Cliquez sur les cases à cocher pour modifier les permissions
                                </div>
                            )}
                        </div>
                    </div>
                )}

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
                                        <div className="spinner-border text-primary" />
                                    </td>
                                </tr>
                            ) : filteredPermissionsList.length === 0 ? (
                                <tr>
                                    <td colSpan="4" className="text-center py-4">
                                        Aucune permission trouvée
                                    </td>
                                </tr>
                            ) : (
                                filteredPermissionsList.map((permission) => (
                                    <tr key={permission.permissionId}>
                                        <td>{permission.name}</td>
                                        <td>{permission.description}</td>
                                        {selectedRole && (
                                            <td className="text-center">
                                                <input
                                                    type="checkbox"
                                                    className="form-check-input"
                                                    checked={isEditing 
                                                        ? tempPermissions.some(p => p.permissionId === permission.permissionId)
                                                        : rolePermissions.some(p => p.permissionId === permission.permissionId)
                                                    }
                                                    onChange={() => handlePermissionToggle(permission.permissionId)}
                                                    disabled={!isEditing}
                                                />
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

                {showModal && (
                    <div className="modal show" style={{ display: 'block' }}>
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
                                    />
                                </div>
                                <form onSubmit={handleSubmit}>
                                    <div className="modal-body">
                                        <div className="mb-3">
                                            <label className="form-label">Nom</label>
                                            <input
                                                type="text"
                                                className="form-control"
                                                value={formData.name}
                                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                                required
                                            />
                                        </div>
                                        <div className="mb-3">
                                            <label className="form-label">Description</label>
                                            <textarea
                                                className="form-control"
                                                value={formData.description}
                                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
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
                )}
            </div>
        </Template>
    );
}

export default PermissionsManagement;