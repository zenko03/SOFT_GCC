import React, { useState, useEffect } from 'react';
import Template from '../../Template';
import PageHeader from '../../../components/PageHeader';
import useSWR from 'swr';
import Fetcher from '../../../components/Fetcher';
import Loader from '../../../helpers/Loader';
import axios from 'axios';
import { urlApi } from '../../../helpers/utils';
import "../../../styles/careerStyle.css";

function CreateEmployeePage({ onSearch }) {
    const module = "Souhait evolution";
    const action = "Ajouter";
    const url = "/SouhaitEvolution/Ajouter";

    const { data: dataEmployee } = useSWR('/Employee', Fetcher);
    const { data: dataDepartment } = useSWR('/Department', Fetcher);

    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [formErrors, setFormErrors] = useState({});

    const [formData, setFormData] = useState({
        registrationNumber: '',
        name: '',
        firstName: '',
        birthday: '',
        department_id: '',
        hiring_date: '',
        civiliteId: '',
        managerId: '',
        photo: null
    });

    useEffect(() => {
        if (success) {
            const timer = setTimeout(() => setSuccess(""), 3000);
            return () => clearTimeout(timer);
        }
    }, [success]);

    const validateForm = () => {
        let errors = {};
        const today = new Date();
        const birthdayDate = new Date(formData.birthday);
        const hiringDate = new Date(formData.hiring_date);
        const minAgeDate = new Date();
        minAgeDate.setFullYear(minAgeDate.getFullYear() - 18);

        if (!formData.registrationNumber) errors.registrationNumber = "Le numéro de matricule est requis";
        if (!formData.name) errors.name = "Le nom est requis";
        if (!formData.firstName) errors.firstName = "Le prénom est requis";
        if (!formData.birthday) {
            errors.birthday = "La date de naissance est requise";
        } else if (birthdayDate > minAgeDate) {
            errors.birthday = "L'employé doit avoir au moins 18 ans";
        }
        if (!formData.department_id) errors.department_id = "Le département est requis";
        if (!formData.hiring_date) {
            errors.hiring_date = "La date d'embauche est requise";
        } else if (hiringDate > today) {
            errors.hiring_date = "La date d'embauche ne peut pas être dans le futur";
        }
        if (!formData.civiliteId) errors.civiliteId = "La civilité est requise";
        if (!formData.photo) errors.photo = "Le photo est requis";

        setFormErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleSubmit = async () => {
        if (!validateForm()) return;
        setIsLoading(true);
        try {
            const form = new FormData();
            form.append("registrationNumber", formData.registrationNumber);
            form.append("name", formData.name);
            form.append("firstName", formData.firstName);
            form.append("birthday", formData.birthday);
            form.append("department_id", formData.department_id);
            form.append("hiring_date", formData.hiring_date);
            form.append("civiliteId", formData.civiliteId);
            form.append("managerId", formData.managerId);

            if (formData.photo) {
                form.append("photo", formData.photo);
            }

            await axios.post(urlApi('/Employee'), form);
            setFormData({
                registrationNumber: '',
                name: '',
                firstName: '',
                birthday: '',
                department_id: '',
                hiring_date: '',
                civiliteId: '',
                managerId: '',
                photo: null
            });
            setError(null);
            setSuccess("Creation du nouveau employé "+formData.registrationNumber+" réussi");
        } catch (error) {
            setError('Erreur lors de l\'insertion : ' + (error.response?.data || error.message));
        } finally {
            setIsLoading(false);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prevData) => ({
            ...prevData,
            [name]: value,
        }));
    };

    const handleFileChange = (e) => {
        setFormData((prevData) => ({ ...prevData, photo: e.target.files[0] }));
    };

    if (isLoading) return <Loader />;

    return (
        <Template>
            <PageHeader module={module} action={action} url={url} />
            <h4>AJOUT D'UN NOUVEAU EMPLOYE</h4>
            {error && <div className="alert alert-danger">{error}</div>}
            {success && <div className="alert alert-success">{success}</div>}
            <form className="forms-sample">
                <div className="row">            
                    <div className="col-md-6 grid-margin stretch-card">
                        <div className="card">
                            <div className="card-body">
                                <h5 className="card-title subtitle">Formulaire d'ajout d'un nouvel employé</h5>
                                <br />
                                <div className="form-group">
                                    <label>Numero de matricule</label>
                                    <input type="text" name="registrationNumber" value={formData.registrationNumber} onChange={handleChange} className="form-control" />
                                    {formErrors.registrationNumber && <div className="error-text">{formErrors.registrationNumber}</div>}
                                </div>
                                <div className="form-group">
                                    <label>Nom</label>
                                    <input type="text" name="name" value={formData.name} onChange={handleChange} className="form-control" />
                                    {formErrors.name && <div className="error-text">{formErrors.name}</div>}
                                </div>
                                <div className="form-group">
                                    <label>Prénom</label>
                                    <input type="text" name="firstName" value={formData.firstName} onChange={handleChange} className="form-control" />
                                    {formErrors.firstName && <div className="error-text">{formErrors.firstName}</div>}
                                </div>
                                <div className="form-group">
                                    <label>Date de naissance</label>
                                    <input type="date" name="birthday" value={formData.birthday} onChange={handleChange} className="form-control" />
                                    {formErrors.birthday && <div className="error-text">{formErrors.birthday}</div>}
                                </div>                                
                                <div className="form-group">
                                    <label>Département</label>
                                    <select name="department_id" value={formData.department_id} onChange={handleChange} className="form-control">
                                        <option value="">Sélectionner un département</option>
                                        {dataDepartment && dataDepartment.map((item) => (
                                            <option key={item.departmentId} value={item.departmentId}>{item.name}</option>
                                        ))}
                                    </select>  
                                    {formErrors.department_id && <div className="error-text">{formErrors.department_id}</div>}
                                </div>
                                <div className="form-group">
                                    <label>Date d'embauche</label>
                                    <input type="date" name="hiring_date" value={formData.hiring_date} onChange={handleChange} className="form-control" />
                                    {formErrors.hiring_date && <div className="error-text">{formErrors.hiring_date}</div>}
                                </div>
                                <div className="form-group">
                                    <label>Civilité</label>
                                    <select name="civiliteId" value={formData.civiliteId} onChange={handleChange} className="form-control">
                                        <option value="">Sélectionner la civilité</option>
                                        <option value="1">Monsieur</option>
                                        <option value="2">Madame</option>
                                    </select>  
                                    {formErrors.civiliteId && <div className="error-text">{formErrors.civiliteId}</div>}
                                </div>
                                <div className="form-group">
                                    <label htmlFor="exampleInputUsername1">Manager</label>
                                    <select name="managerId" value={formData.managerId} onChange={handleChange} className="form-control" id="exampleSelectGender">
                                        <option value="">Selectionner le manager</option>
                                        {dataEmployee && dataEmployee.map((item, id) => (
                                            <option key={item.employeeId} value={item.employeeId}>
                                                {item.registrationNumber}
                                            </option>
                                        ))}
                                    </select>  
                                </div>
                                <div className="form-group">
                                    <label>Photo</label>
                                    <input type="file" accept="image/*" onChange={handleFileChange} className="form-control" />
                                    {formErrors.photo && <div className="error-text">{formErrors.photo}</div>}  
                                </div>
                                <div className="button-save-profil">
                                    <button onClick={handleSubmit} type="button" className="btn btn-success btn-fw">
                                        <i className='mdi mdi-content-save button-logo'></i> Enregistrer
                                    </button>
                                    <button type="button" className="btn btn-light btn-fw">
                                        <i className='mdi mdi-undo-variant button-logo'></i> Retour
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </form>
        </Template>
    );
}

export default CreateEmployeePage;