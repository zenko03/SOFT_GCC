import React, { useState, useEffect } from 'react';
import Template from '../../Template';
import PageHeader from '../../../components/PageHeader';
import Loader from '../../../helpers/Loader';
import { Button } from 'react-bootstrap';
import axios from 'axios';
import { urlApi } from '../../../helpers/utils';

function AssignmentTypeCrudPage() {
    const module = 'Plan de carrière';
    const action = 'Création';
    const url = '/carriere';

    const [isLoading, setIsLoading] = useState(false);
    const [isModifiedPage, setIsModifiedPage] = useState(false);
    const [error, setError] = useState(null);
    const [data, setData] = useState([]);
    const [idItem, setIdItem] = useState(0);
    
    const [formData, setFormData] = useState({
        assignmentTypeName: ''
    });

    const handleChangeToModifiedPage = (id) => {
        setIsModifiedPage(true);
        getDataForModifiedPage(id); // Passer directement l'id ici
    };

    const fetchData = async () => {
        setIsLoading(true);
        setError(null);
        try {
            const response = await axios.get(urlApi('/AssignmentType'));
            setData(response.data || []);
        } catch (err) {
            setError(`Erreur lors de la récupération des données : ${err.message}`);
        } finally {
            setIsLoading(false);
        }
    };
    
    useEffect(() => {
        fetchData();
    }, []);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prevData) => ({
            ...prevData,
            [name]: value,
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);
        try {
            await axios.post(urlApi('/AssignmentType'), formData);
            fetchData();
            setFormData({ assignmentTypeName: '' });
        } catch (error) {
            setError(`Erreur lors de l'insertion : ${error.response?.data || error.message}`);
        } finally {
            setIsLoading(false);
        }
    };

    const handleDeleteConfirmed = async (itemToDelete) => {
        setIsLoading(true);
        setError(null);
        try {
            await axios.delete(urlApi(`/AssignmentType/${itemToDelete}`));
            fetchData();
            setIsModifiedPage(false);
            setFormData({ assignmentTypeName: '' });
        } catch (error) {
            setError(`Erreur lors de la suppression : ${error.message}`);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSubmitModified = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);
        try {
            await axios.put(urlApi(`/AssignmentType/${idItem}`), formData);
            fetchData();
        } catch (error) {
            setError(`Erreur lors de l'insertion : ${error.response?.data || error.message}`);
        } finally {
            setIsLoading(false);
        }
    };

    const getDataForModifiedPage = async (id) => { // Recevoir l'id en paramètre
        setIsLoading(true);
        setError(null);
        try {
            const response = await axios.get(urlApi(`/AssignmentType/${id}`)); // Utiliser l'id passé
            setIdItem(id);
            setFormData({
                assignmentTypeId: response.data.assignmentTypeId,
                assignmentTypeName: response.data.assignmentTypeName // Prendre directement la bonne valeur
            });
        } catch (err) {
            setError(`Erreur lors de la récupération des données : ${err.message}`);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Template>
            <PageHeader module={module} action={action} url={url} />
            <div className="col-lg-12 skill-header">
                <i className="mdi mdi-account-arrow-right skill-icon"></i>
                <h4 className="skill-title">ENTITÉ TYPE D'AFFECTATION</h4>
            </div> 
            {isLoading && <Loader />}
            {error && <div className="alert alert-danger">{error}</div>}
                <div className="row">            
                    <div className="col-md-6 grid-margin stretch-card">
                        {isModifiedPage ? (
                            <div className="card">
                                <form className="forms-sample" onSubmit={handleSubmitModified}>
                                    <div className="card-header title-container">
                                        <h5 className="title">
                                            <i className="mdi mdi-file-document-edit"></i> Formulaire de modification
                                        </h5>
                                    </div>
                                    <div className="card-body">
                                        <div className="form-group">
                                            <label htmlFor="name">Désignation</label>
                                            <input type="text" name="assignmentTypeName" value={formData.assignmentTypeName} onChange={handleChange} className="form-control" id="name" required />
                                        </div>
                                        <div className="button-save-profil">
                                            <button type="submit" className="btn btn-success btn-fw" disabled={isLoading}>Modifier</button>
                                            <button type="reset" className="btn btn-light btn-fw" onClick={() => setFormData({ assignmentTypeName: '' })}>Annuler</button>
                                        </div>
                                    </div>
                                </form>
                            </div>
                        ) : (
                            <div className="card">
                                <form className="forms-sample" onSubmit={handleSubmit}>
                                    <div className="card-header title-container">
                                        <h5 className="title">
                                            <i className="mdi mdi-file-document-edit"></i> Formulaire d'ajout
                                        </h5>
                                    </div>
                                    <div className="card-body">
                                        <div className="form-group">
                                            <label htmlFor="name">Désignation</label>
                                            <input type="text" name="assignmentTypeName" value={formData.assignmentTypeName} onChange={handleChange} className="form-control" id="name" required />
                                        </div>
                                        <div className="button-save-profil">
                                            <button type="submit" className="btn btn-success btn-fw" disabled={isLoading}>Créer</button>
                                            <button type="reset" className="btn btn-light btn-fw" onClick={() => setFormData({ assignmentTypeName: '' })}>Annuler</button>
                                        </div>
                                    </div>
                                </form>
                            </div>
                        )}
                    </div>
                    <div className="col-md-6 grid-margin stretch-card">
                        <div className="card">
                            <div className="card-header title-container">
                                <h5 className="title">
                                    <i className="mdi mdi-format-list-bulleted"></i> Liste enregistrée
                                </h5>
                            </div>
                            <div className="card-body">
                                <table className="table table-hover table-bordered">
                                    <thead className="bg-primary text-white">
                                        <tr>
                                            <th>#</th>
                                            <th>Désignation</th>
                                            <th>Action</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {data.map((item, id) => (
                                            <tr key={item.assignmentTypeId}>
                                                <td className="text-center">{item.assignmentTypeId}</td>
                                                <td>{item.assignmentTypeName}</td>
                                                <td>
                                                    <Button
                                                        onClick={() => handleChangeToModifiedPage(item.assignmentTypeId)}
                                                        className="btn btn-danger btn-sm"
                                                        style={{backgroundColor: 'white'}}
                                                    >
                                                        <i className="mdi mdi-pencil icon-edit" style={{ fontSize: '20px' }}></i>
                                                    </Button>
                                                    <Button
                                                        onClick={() => handleDeleteConfirmed(item.assignmentTypeId)}
                                                        className="btn btn-danger btn-sm"
                                                        style={{backgroundColor: 'white', margin: '20px'}}
                                                    >
                                                        <i className="mdi mdi-delete icon-delete" 
                                                        style={{fontSize: '20px'}}></i>
                                                    </Button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>                
        </Template>
    );
}

export default AssignmentTypeCrudPage;