import React, { useState, useEffect } from 'react';
import Template from '../../Template';
import PageHeader from '../../../components/PageHeader';
import Loader from '../../../helpers/Loader';
import { Button } from 'react-bootstrap';
import axios from 'axios';
import { urlApi } from '../../../helpers/utils';

function NewsLetterTemplateCrudPage() {
    const module = 'Plan de carrière';
    const action = 'Création';
    const url = '/carriere';

    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [data, setData] = useState([]);
    
    const [formData, setFormData] = useState({
        newsletterTemplateName: ''
    });

    const fetchData = async () => {
        setIsLoading(true);
        setError(null);
        try {
            const response = await axios.get(urlApi('/NewsletterTemplate'));
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
            await axios.post(urlApi('/NewsletterTemplate'), formData);
            fetchData();
            setFormData({ newsLetterTemplateName: '' });
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
            await axios.delete(urlApi(`/NewsletterTemplate/${itemToDelete}`));
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
            <h4>ENTITÉ BULLETIN</h4>
            {isLoading && <Loader />}
            {error && <div className="alert alert-danger">{error}</div>}
            <form className="forms-sample" onSubmit={handleSubmit}>
                <div className="row">            
                    <div className="col-md-6 grid-margin stretch-card">
                        <div className="card">
                            <div className="card-body">
                                <h5 className="card-title subtitle">Formulaire d'ajout</h5>
                                <div className="form-group">
                                    <label htmlFor="newsletterTemplateName">Désignation</label>
                                    <input type="text" name="newsletterTemplateName" value={formData.newsletterTemplateName} onChange={handleChange} className="form-control" id="name" required />
                                </div>
                                <div className="button-save-profil">
                                    <button type="submit" className="btn btn-success btn-fw" disabled={isLoading}>Créer</button>
                                    <button type="reset" className="btn btn-light btn-fw" onClick={() => setFormData({ newsletterTemplateName: '' })}>Annuler</button>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="col-md-6 grid-margin stretch-card">
                        <div className="card">
                            <div className="card-body">
                                <h5 className="card-title subtitle">Liste enregistrée</h5>
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
                                            <tr key={item.newsletterTemplateId}>
                                                <td className="text-center">{item.newsletterTemplateId}</td>
                                                <td>{item.newsletterTemplateName}</td>
                                                <td>
                                                    <Button
                                                        onClick={() => handleDeleteConfirmed(item.newsletterTemplateId)}
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

export default NewsLetterTemplateCrudPage;