import React, { useState, useEffect } from 'react';
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
        if (selectedRole) fetchRolePermissions(selectedRole.roleId);
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

    const handlePermissionToggle = (permissionId) => {
        setIsEditing(true);
        const isAssigned = tempPermissions.some(p => p.permissionId === permissionId);
        const newPermissions = isAssigned 
            ? tempPermissions.filter(p => p.permissionId !== permissionId)
            : [...tempPermissions, permissions.find(p => p.permissionId === permissionId)];
        setTempPermissions(newPermissions);
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

    const filteredPermissions = permissions.filter(permission => {
        if (!searchQuery.trim()) return true;
        const cleanQuery = searchQuery.trim().toLowerCase().replace(/[^a-z0-9]/gi, '');
        return (
            permission.name?.toLowerCase().replace(/[^a-z0-9]/gi, '').includes(cleanQuery) ||
            permission.description?.toLowerCase().replace(/[^a-z0-9]/gi, '').includes(cleanQuery)
        );
    });

    return (
        <Template>
            {/* Interface améliorée avec feedback visuel et accessibilité */}
            {/* ... (reste du JSX avec les améliorations de design décrites précédemment) */}
        </Template>
    );
}

export default PermissionsManagement;