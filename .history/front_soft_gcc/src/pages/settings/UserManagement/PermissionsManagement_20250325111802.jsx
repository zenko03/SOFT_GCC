import React, { useState, useEffect } from 'react';
import Template from '../../Template';
import axios from 'axios';
import { FaEdit, FaTrash, FaPlus, FaUserShield } from 'react-icons/fa';
import { useUser } from '../../../pages/Evaluations/EvaluationInterview/UserContext';
import { Navigate } from 'react-router-dom';
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

    useEffect(() => {
        fetchPermissions();
        fetchRoles();
    }, []);

    useEffect(() => {
        if (selectedRole) {
            fetchRolePermissions(selectedRole.roleId);
        }
    }, [selectedRole]);

    // Vérification des permissions après les useEffect
    if (!hasPermission('MANAGE_PERMISSIONS')) {
        return (
            <Template>
                <div className="container mt-4">
                    <div className="alert alert-danger">
                        <h4>Accès non autorisé</h4>
                        <p>Cette section est réservée aux administrateurs système uniquement.</p>
                        <p>Si vous pensez que c&apos;est une erreur, veuillez contacter votre administrateur système.</p>
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
        }
    };

    const fetchRolePermissions = async (roleId) => {
        try {
            const response = await axios.get(`https://localhost:7082/api/Permission/role/${roleId}`);
            setRolePermissions(response.data);
        } catch (error) {
            console.error('Erreur lors de la récupération des permissions du rôle:', error);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (currentPermission) {
                await axios.put(`https://localhost:7082/api/Permission/${currentPermission.permissionId}`, formData);
                toast.success('Permission modifiée avec succès');
            } else {
                await axios.post('https://localhost:7082/api/Permission', formData);
                toast.success('Permission créée avec succès');
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
    };

    const handlePermissionToggle = async (permissionId) => {
        if (!selectedRole) {
            toast.error('Veuillez sélectionner un rôle avant de modifier les permissions.');
            return;
        }

        try {
            const isCurrentlyAssigned = rolePermissions.some(p => p.permissionId === permissionId);
            const newPermissions = isCurrentlyAssigned
                ? rolePermissions.filter(p => p.permissionId !== permissionId)
                : [...rolePermissions, permissions.find(p => p.permissionId === permissionId)];

            // Extraire uniquement les IDs
            const permissionIds = newPermissions.map(p => p.permissionId);
            
            // Utiliser un objet avec une propriété unique
            const formData = { PermissionIDs: permissionIds };
            
            console.log('Données envoyées:', formData);

            const response = await axios.put(
                `https://localhost:7082/api/Permission/role/${selectedRole.roleId}`, 
                formData,
                {
                    headers: {
                        'Content-Type': 'application/json'
                    }
                }
            );
            
            console.log('Réponse du serveur:', response.data);
            setRolePermissions(newPermissions);
            toast.success('Permissions mises à jour avec succès');
        } catch (error) {
            console.error('Erreur complète:', error);
            console.error('Détails de la réponse:', error.response?.data);
            toast.error(error.response?.data?.message || 'Erreur lors de la mise à jour des permissions');
        }
    };

    const resetForm = () => {
        setCurrentPermission(null);
        setFormData({
            name: '',
            description: ''
        });
    };

    const filteredPermissions = permissions.filter(permission => {
        if (!permission || !permission.name) return false;
        
        const searchLower = searchQuery.toLowerCase();
        const nameMatch = permission.name.toLowerCase().includes(searchLower);
        const descriptionMatch = permission.description && 
                               permission.description.toLowerCase().includes(searchLower);
        
        return nameMatch || descriptionMatch;
    });

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

                {/* Sélection du rôle */}
                <div className="row mb-4">
                    <div className="col-md-6">
                        <select
                            className="form-select"
                            value={selectedRole?.roleId || ''}
                            onChange={(e) => {
                                const role = roles.find(r => r.roleId === parseInt(e.target.value));
                                handleRoleSelect(role);
                            }}
                        >
                            <option value="">Sélectionner un rôle</option>
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
                            placeholder="Rechercher une permission..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                </div>

                {/* Table des permissions */}
                <div className="table-responsive">
                    <table className="table table-striped">
                        <thead>
                            <tr>
                                <th>Nom</th>
                                <th>Description</th>
                                {selectedRole && <th>Attribuée</th>}
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr>
                                    <td colSpan="4" className="text-center">
                                        Chargement...
                                    </td>
                                </tr>
                            ) : (
                                filteredPermissions.map((permission) => (
                                    <tr key={permission.permissionId}>
                                        <td>{permission.name}</td>
                                        <td>{permission.description}</td>
                                        {selectedRole && (
                                            <td>
                                                <div className="form-check">
                                                    <input
                                                        type="checkbox"
                                                        className="form-check-input"
                                                        checked={rolePermissions.some(p => p.permissionId === permission.permissionId)}
                                                        onChange={() => handlePermissionToggle(permission.permissionId)}
                                                    />
                                                </div>
                                            </td>
                                        )}
                                        <td>
                                            <button
                                                className="btn btn-sm btn-primary me-2"
                                                onClick={() => handleEdit(permission)}
                                            >
                                                <FaEdit />
                                            </button>
                                            <button
                                                className="btn btn-sm btn-danger"
                                                onClick={() => handleDelete(permission.permissionId)}
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