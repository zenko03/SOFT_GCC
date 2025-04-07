import React, { useState, useEffect } from 'react';
import Template from '../../Template';
import axios from 'axios';
import { FaEdit, FaTrash, FaPlus, FaUserShield } from 'react-icons/fa';

function PermissionsManagement() {
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
            } else {
                await axios.post('https://localhost:7082/api/Permission', formData);
            }
            setShowModal(false);
            fetchPermissions();
            resetForm();
        } catch (error) {
            console.error('Erreur lors de l\'enregistrement:', error);
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
                fetchPermissions();
            } catch (error) {
                console.error('Erreur lors de la suppression:', error);
            }
        }
    };

    const handleRoleSelect = (role) => {
        setSelectedRole(role);
    };

    const handlePermissionToggle = async (permissionId) => {
        if (!selectedRole) return;

        const newPermissions = rolePermissions.some(p => p.permissionId === permissionId)
            ? rolePermissions.filter(p => p.permissionId !== permissionId)
            : [...rolePermissions, permissions.find(p => p.permissionId === permissionId)];

        try {
            await axios.put(`https://localhost:7082/api/Permission/role/${selectedRole.roleId}`, 
                newPermissions.map(p => p.permissionId));
            setRolePermissions(newPermissions);
        } catch (error) {
            console.error('Erreur lors de la mise à jour des permissions:', error);
        }
    };

    const resetForm = () => {
        setCurrentPermission(null);
        setFormData({
            name: '',
            description: ''
        });
    };

    const filteredPermissions = permissions.filter(permission =>
        permission.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        permission.description.toLowerCase().includes(searchQuery.toLowerCase())
    );

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