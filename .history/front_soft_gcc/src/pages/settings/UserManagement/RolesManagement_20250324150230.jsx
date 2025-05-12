import React, { useState, useEffect } from 'react';
import Template from '../../Template';
import axios from 'axios';
import { FaEdit, FaTrash, FaPlus } from 'react-icons/fa';

function RolesManagement() {
    const [roles, setRoles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [currentRole, setCurrentRole] = useState(null);
    const [formData, setFormData] = useState({
        title: ''
    });
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        fetchRoles();
    }, []);

    const fetchRoles = async () => {
        try {
            setLoading(true);
            const response = await axios.get('https://localhost:7082/api/Role');
            setRoles(response.data);
        } catch (error) {
            console.error('Erreur lors de la récupération des rôles:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (currentRole) {
                await axios.put(`https://localhost:7082/api/Role/${currentRole.roleId}`, formData);
            } else {
                await axios.post('https://localhost:7082/api/Role', formData);
            }
            setShowModal(false);
            fetchRoles();
            resetForm();
        } catch (error) {
            console.error('Erreur lors de l\'enregistrement:', error);
        }
    };

    const handleEdit = (role) => {
        setCurrentRole(role);
        setFormData({
            title: role.title
        });
        setShowModal(true);
    };

    const handleDelete = async (roleId) => {
        if (window.confirm('Êtes-vous sûr de vouloir supprimer ce rôle ?')) {
            try {
                await axios.delete(`https://localhost:7082/api/Role/${roleId}`);
                fetchRoles();
            } catch (error) {
                console.error('Erreur lors de la suppression:', error);
            }
        }
    };

    const resetForm = () => {
        setCurrentRole(null);
        setFormData({
            title: ''
        });
    };

    const filteredRoles = roles.filter(role =>
        role.title.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <Template>
            <div className="container-fluid">
                <div className="row mb-4 align-items-center">
                    <div className="col-md-6">
                        <h2>Gestion des Rôles</h2>
                    </div>
                    <div className="col-md-6 text-end">
                        <button
                            className="btn btn-primary"
                            onClick={() => {
                                resetForm();
                                setShowModal(true);
                            }}
                        >
                            <FaPlus className="me-2" /> Nouveau Rôle
                        </button>
                    </div>
                </div>

                {/* Barre de recherche */}
                <div className="row mb-4">
                    <div className="col-md-6">
                        <input
                            type="text"
                            className="form-control"
                            placeholder="Rechercher un rôle..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                </div>

                {/* Table des rôles */}
                <div className="table-responsive">
                    <table className="table table-striped">
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Nom du Rôle</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr>
                                    <td colSpan="3" className="text-center">
                                        Chargement...
                                    </td>
                                </tr>
                            ) : (
                                filteredRoles.map((role) => (
                                    <tr key={role.roleid}>
                                        <td>{role.roleid}</td>
                                        <td>{role.title}</td>
                                        <td>
                                            <button
                                                className="btn btn-sm btn-primary me-2"
                                                onClick={() => handleEdit(role)}
                                            >
                                                <FaEdit />
                                            </button>
                                            <button
                                                className="btn btn-sm btn-danger"
                                                onClick={() => handleDelete(role.roleId)}
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

                {/* Modal pour ajouter/modifier un rôle */}
                {showModal && (
                    <>
                        <div className="modal-backdrop fade show"></div>
                        <div className="modal fade show" style={{ display: 'block' }}>
                            <div className="modal-dialog">
                                <div className="modal-content">
                                    <div className="modal-header">
                                        <h5 className="modal-title">
                                            {currentRole ? 'Modifier' : 'Ajouter'} un rôle
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
                                                <label className="form-label">Nom du Rôle</label>
                                                <input
                                                    type="text"
                                                    className="form-control"
                                                    value={formData.title}
                                                    onChange={(e) =>
                                                        setFormData({ ...formData, title: e.target.value })
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
                                                {currentRole ? 'Modifier' : 'Ajouter'}
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

export default RolesManagement; 