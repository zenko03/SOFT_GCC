import React, { useState, useEffect } from 'react';
import Template from '../../Template';
import axios from 'axios';
import { FaEdit, FaTrash, FaUserPlus } from 'react-icons/fa';

function UsersList() {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [currentUser, setCurrentUser] = useState(null);
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        roleId: '',
        password: '',
        departmentId: '',
        positionId: ''
    });
    const [roles, setRoles] = useState([]);
    const [departments, setDepartments] = useState([]);
    const [positions, setPositions] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const pageSize = 10;

    useEffect(() => {
        fetchUsers();
        fetchRoles();
        fetchDepartments();
        fetchPositions();
    }, [currentPage, searchQuery]);

    const fetchUsers = async () => {
        try {
            setLoading(true);
            const response = await axios.get('https://localhost:7082/api/User/paginated', {
                params: {
                    pageNumber: currentPage,
                    pageSize: pageSize,
                    search: searchQuery
                }
            });
            setUsers(response.data.users);
            setTotalPages(response.data.totalPages);
        } catch (error) {
            console.error('Erreur lors de la récupération des utilisateurs:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchRoles = async () => {
        try {
            const response = await axios.get('https://localhost:7082/api/User/roles');
            setRoles(response.data);
        } catch (error) {
            console.error('Erreur lors de la récupération des rôles:', error);
        }
    };

    const fetchDepartments = async () => {
        try {
            const response = await axios.get('https://localhost:7082/api/EvaluationPlanning/departments');
            setDepartments(response.data);
        } catch (error) {
            console.error('Erreur lors de la récupération des départements:', error);
        }
    };

    const fetchPositions = async () => {
        try {
            const response = await axios.get('https://localhost:7082/api/EvaluationPlanning/positions');
            setPositions(response.data);
        } catch (error) {
            console.error('Erreur lors de la récupération des positions:', error);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (currentUser) {
                await axios.put(`https://localhost:7082/api/User/${currentUser.userId}`, formData);
            } else {
                await axios.post('https://localhost:7082/api/User/register', formData);
            }
            setShowModal(false);
            fetchUsers();
            resetForm();
        } catch (error) {
            console.error('Erreur lors de l\'enregistrement:', error);
        }
    };

    const handleEdit = (user) => {
        setCurrentUser(user);
        setFormData({
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
            roleId: user.Role.roleId,
            departmentId: user.departmentId,
            positionId: user.Position.positionId,
            password: '' // Le mot de passe n'est pas rempli pour l'édition
        });
        setShowModal(true);
    };

    const handleDelete = async (userId) => {
        if (window.confirm('Êtes-vous sûr de vouloir supprimer cet utilisateur ?')) {
            try {
                await axios.delete(`https://localhost:7082/api/User/${userId}`);
                fetchUsers();
            } catch (error) {
                console.error('Erreur lors de la suppression:', error);
            }
        }
    };

    const resetForm = () => {
        setCurrentUser(null);
        setFormData({
            firstName: '',
            lastName: '',
            email: '',
            roleId: '',
            password: '',
            departmentId: '',
            positionId: ''
        });
    };

    return (
        <Template>
            <div className="container-fluid">
                <div className="row mb-4 align-items-center">
                    <div className="col-md-6">
                        <h2>Liste des Utilisateurs</h2>
                    </div>
                    <div className="col-md-6 text-end">
                        <button
                            className="btn btn-primary"
                            onClick={() => {
                                resetForm();
                                setShowModal(true);
                            }}
                        >
                            <FaUserPlus className="me-2" /> Nouvel Utilisateur
                        </button>
                    </div>
                </div>

                {/* Barre de recherche */}
                <div className="row mb-4">
                    <div className="col-md-6">
                        <input
                            type="text"
                            className="form-control"
                            placeholder="Rechercher un utilisateur..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                </div>

                {/* Table des utilisateurs */}
                <div className="table-responsive">
                    <table className="table table-striped">
                        <thead>
                            <tr>
                                <th>Nom</th>
                                <th>Prénom</th>
                                <th>Email</th>
                                <th>Rôle</th>
                                <th>Département</th>
                                <th>Position</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr>
                                    <td colSpan="7" className="text-center">
                                        Chargement...
                                    </td>
                                </tr>
                            ) : (
                                users.map((user) => (
                                    <tr key={user.userId}>
                                        <td>{user.lastName}</td>
                                        <td>{user.firstName}</td>
                                        <td>{user.email}</td>
                                        <td>{user.roleName}</td>
                                        <td>{user.departmentName}</td>
                                        <td>{user.positionName}</td>
                                        <td>
                                            <button
                                                className="btn btn-sm btn-primary me-2"
                                                onClick={() => handleEdit(user)}
                                            >
                                                <FaEdit />
                                            </button>
                                            <button
                                                className="btn btn-sm btn-danger"
                                                onClick={() => handleDelete(user.userId)}
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

                {/* Pagination */}
                <div className="d-flex justify-content-center mt-4">
                    <nav>
                        <ul className="pagination">
                            <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                                <button
                                    className="page-link"
                                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                                >
                                    Précédent
                                </button>
                            </li>
                            {[...Array(totalPages)].map((_, i) => (
                                <li
                                    key={i + 1}
                                    className={`page-item ${currentPage === i + 1 ? 'active' : ''}`}
                                >
                                    <button
                                        className="page-link"
                                        onClick={() => setCurrentPage(i + 1)}
                                    >
                                        {i + 1}
                                    </button>
                                </li>
                            ))}
                            <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
                                <button
                                    className="page-link"
                                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                                >
                                    Suivant
                                </button>
                            </li>
                        </ul>
                    </nav>
                </div>

                {/* Modal pour ajouter/modifier un utilisateur */}
                {showModal && (
                    <>
                        <div className="modal-backdrop fade show"></div>
                        <div className="modal fade show" style={{ display: 'block' }}>
                            <div className="modal-dialog">
                                <div className="modal-content">
                                    <div className="modal-header">
                                        <h5 className="modal-title">
                                            {currentUser ? 'Modifier' : 'Ajouter'} un utilisateur
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
                                                <label className="form-label">Nom</label>
                                                <input
                                                    type="text"
                                                    className="form-control"
                                                    value={formData.lastName}
                                                    onChange={(e) =>
                                                        setFormData({ ...formData, lastName: e.target.value })
                                                    }
                                                    required
                                                />
                                            </div>
                                            <div className="mb-3">
                                                <label className="form-label">Prénom</label>
                                                <input
                                                    type="text"
                                                    className="form-control"
                                                    value={formData.firstName}
                                                    onChange={(e) =>
                                                        setFormData({ ...formData, firstName: e.target.value })
                                                    }
                                                    required
                                                />
                                            </div>
                                            <div className="mb-3">
                                                <label className="form-label">Email</label>
                                                <input
                                                    type="email"
                                                    className="form-control"
                                                    value={formData.email}
                                                    onChange={(e) =>
                                                        setFormData({ ...formData, email: e.target.value })
                                                    }
                                                    required
                                                />
                                            </div>
                                            {!currentUser && (
                                                <div className="mb-3">
                                                    <label className="form-label">Mot de passe</label>
                                                    <input
                                                        type="password"
                                                        className="form-control"
                                                        value={formData.password}
                                                        onChange={(e) =>
                                                            setFormData({ ...formData, password: e.target.value })
                                                        }
                                                        required={!currentUser}
                                                    />
                                                </div>
                                            )}
                                            <div className="mb-3">
                                                <label className="form-label">Rôle</label>
                                                <select
                                                    className="form-select"
                                                    value={formData.roleId}
                                                    onChange={(e) =>
                                                        setFormData({ ...formData, roleId: e.target.value })
                                                    }
                                                    required
                                                >
                                                    <option value="">Sélectionner un rôle</option>
                                                    {roles.map((role) => (
                                                        <option key={role.roleId} value={role.roleId}>
                                                            {role.name}
                                                        </option>
                                                    ))}
                                                </select>
                                            </div>
                                            <div className="mb-3">
                                                <label className="form-label">Département</label>
                                                <select
                                                    className="form-select"
                                                    value={formData.departmentId}
                                                    onChange={(e) =>
                                                        setFormData({ ...formData, departmentId: e.target.value })
                                                    }
                                                    required
                                                >
                                                    <option value="">Sélectionner un département</option>
                                                    {departments.map((dept) => (
                                                        <option key={dept.departmentId} value={dept.departmentId}>
                                                            {dept.name}
                                                        </option>
                                                    ))}
                                                </select>
                                            </div>
                                            <div className="mb-3">
                                                <label className="form-label">Position</label>
                                                <select
                                                    className="form-select"
                                                    value={formData.positionId}
                                                    onChange={(e) =>
                                                        setFormData({ ...formData, positionId: e.target.value })
                                                    }
                                                    required
                                                >
                                                    <option value="">Sélectionner une position</option>
                                                    {positions.map((position) => (
                                                        <option key={position.positionId} value={position.positionId}>
                                                            {position.positionName}
                                                        </option>
                                                    ))}
                                                </select>
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
                                                {currentUser ? 'Modifier' : 'Ajouter'}
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

export default UsersList; 