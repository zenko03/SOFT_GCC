import React, { useState, useEffect } from 'react';
import Template from '../../Template';
import PageHeader from '../../../components/PageHeader';
import Loader from '../../../helpers/Loader';
import { Button } from 'react-bootstrap';
import axios from 'axios';
import { urlApi } from '../../../helpers/utils';

function IndicationCrudPage() {
    const module = 'Plan de carrière';
    const action = 'Création';
    const url = '/carriere';

    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [data, setData] = useState([]);
    
    const [formData, setFormData] = useState({
        indicationName: ''
    });

    const fetchData = async () => {
        setIsLoading(true);
        setError(null);
        try {
            const response = await axios.get(urlApi('/Indication'));
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
            await axios.post(urlApi('/Indication'), formData);
            fetchData();
            setFormData({ indicationName: '' });
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
            await axios.delete(urlApi(`/Indication/${itemToDelete}`));
            fetchData();
        } catch (error) {
            setError(`Erreur lors de la suppression : ${error.message}`);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Template>
            <PageHeader module={module} action={action} url={url} />
            <div className="col-lg-12 skill-header">
                <i className="mdi mdi-star skill-icon"></i>
                <h4 className="skill-title">ENTITÉ INDICATION</h4>
            </div> 
            {isLoading && <Loader />}
            {error && <div className="alert alert-danger">{error}</div>}
            <form className="forms-sample" onSubmit={handleSubmit}>
                <div className="row">            
                    <div className="col-md-6 grid-margin stretch-card">
                        <div className="card">
                            <div className="card-header title-container">
                                <h5 className="title">
                                    <i className="mdi mdi-file-document-edit"></i> Formulaire d'ajout
                                </h5>
                            </div>
                            <div className="card-body">
                                <div className="form-group">
                                    <label htmlFor="indicationName">Désignation</label>
                                    <input type="text" name="indicationName" value={formData.indicationName} onChange={handleChange} className="form-control" id="name" required />
                                </div>
                                <div className="button-save-profil">
                                    <button type="submit" className="btn btn-success btn-fw" disabled={isLoading}>Créer</button>
                                    <button type="reset" className="btn btn-light btn-fw" onClick={() => setFormData({ indicationName: '' })}>Annuler</button>
                                </div>
                            </div>
                        </div>
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
                                            <tr key={item.indicationId}>
                                                <td className="text-center">{item.indicationId}</td>
                                                <td>{item.indicationName}</td>
                                                <td>
                                                    <Button
                                                        onClick={() => handleDeleteConfirmed(item.indicationId)}
                                                        className="btn btn-danger btn-sm"
                                                        style={{backgroundColor: 'white'}}
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
            </form>
        </Template>
    );
}

export default IndicationCrudPage;