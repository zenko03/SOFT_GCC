import React, {useState, useEffect} from 'react';
import Template from '../Template';
import PageHeader from '../../components/PageHeader';
import useSWR from 'swr';
import Fetcher from '../../components/Fetcher';
import Loader from '../../helpers/Loader';
import axios from 'axios';
import { urlApi } from '../../helpers/utils';
import "../../styles/careerStyle.css";

// Page de creation d'un plan de carriere
function AddWishEvolution({ onSearch }) {
    // Url d'en-tete de page
    const module = "Souhait evolution";
    const action = "Ajouter";
    const url = "/SouhaitEvolution/Ajouter";

    // Preparation des donnees de formulaire
    const { data: dataEmployee } = useSWR('/Employee', Fetcher);
    const { data: dataPosition } = useSWR('/Position', Fetcher);
    const { data: dataWishType } = useSWR('/WishType', Fetcher);

    // Initialisation des states 
    const [isLoading, setIsLoading] = useState(false); 
    const [error, setError] = useState(false); 
    const [success, setSuccess] = useState(""); 
    const [selectedItem, setSelectedItem] = useState(null); 
    const [dataSuggestionPosition, setDataSuggestionPosition] = useState([]); 

    // Pour les saisies de donnees
    const [formData, setFormData] = useState({
        positionId: '',
        employeeId: '',
        wishTypeId: '',
        motivation: '',
        disponibility: '',
        priority: '',
        requestDate: '',
        state: 1,
    });

    // Gérer la soumission du formulaire
    const handleSubmit = async () => {
        setIsLoading(true);
        try {
            const dataToSend = {
                ...formData,
                creationDate: new Date().toISOString(),
                updatedDate: new Date().toISOString(),
            };

            const response = await axios.post(urlApi('/WishEvolution'), dataToSend);
            setFormData({
                positionId: '',
                employeeId: '',
                wishTypeId: '',
                motivation: '',
                disponibility: '',
                priority: '',
                requestDate: '',
                state: 1,
            });
            setSuccess("Insertion de la nouvelle demande reussie");

        } catch (error) {
            setError('Erreur lors de l\'insertion : '+error.message);
        } finally {
            setIsLoading(false);
      }
    };

    const fetchData = async () => {
        setIsLoading(true);
        try {
            if(selectedItem===null) {
                setDataSuggestionPosition([]);
            } else {
                const [suggestionPositionResponse] = await Promise.all([
                    axios.get(urlApi(`/WishEvolution/suggestionPosition/${selectedItem}`))
                ]);
                setDataSuggestionPosition(suggestionPositionResponse.data || []);
            }
        } catch (error) {
            setError(`Erreur lors de la recuperation des donnees : ${error.message}`);
        } finally {
            setIsLoading(false);
        }
    };

    // Gérer les changements dans les champs du formulaire
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prevData) => ({
            ...prevData,
            [name]: value,
        }));
    };

    const handleSelectChange = (event) => {
        setSelectedItem(event.target.value);
        handleChange(event);
    };

    useEffect(() => {
        fetchData();
    }, [selectedItem]);

    useEffect(() => {
        if (success) {
            const timer = setTimeout(() => {
                setSuccess("");
            }, 5000);
            return () => clearTimeout(timer);
        }
    }, [success]);


    return (
        <Template>
            {isLoading && <Loader />}
            <PageHeader module={module} action={action} url={url} />
            {success && <div className="alert alert-success">{success}</div>}
            {error && <div className="alert alert-danger">{error}</div>}
            <div className="skill-header">
                <h4 className="skill-title">AJOUT D'UN SOUHAIT D'ÉVALUATION</h4>
            </div>
            <form className="forms-sample">
                <div className="row">            
                    <div className="col-md-6 grid-margin stretch-card">
                        <div className="card">
                            <div className="card-header title-container">
                                <h5 className="title">
                                    <i className="mdi mdi-file-document-edit "></i> Formulaire d'ajout
                                </h5>
                            </div>
                            <div className="card-body">
                                <div className="form-group">
                                    <label htmlFor="exampleInputUsername1">Employe</label>
                                    <select name="employeeId" value={formData.employeeId} onChange={handleSelectChange} className="form-control" id="exampleSelectGender">
                                        <option value="">Selectionner une employe</option>
                                        {dataEmployee && dataEmployee.map((item, id) => (
                                            <option key={item.employeeId} value={item.employeeId}>
                                                {item.registrationNumber}
                                            </option>
                                        ))}
                                    </select>    
                                </div>
                                <div className="form-group">
                                    <label htmlFor="exampleInputUsername1">Poste souhait</label>
                                    <select name="positionId" value={formData.positionIdId} onChange={handleChange} className="form-control" id="exampleSelectGender">
                                        <option value="">Selectionner une poste souhait</option>
                                        {dataPosition && dataPosition.map((item, id) => (
                                            <option key={item.positionId} value={item.positionId}>
                                                {item.positionName}
                                            </option>
                                        ))}
                                    </select>    
                                </div>
                                <div className="form-group">
                                    <label htmlFor="exampleInputUsername1">Type de souhait</label>
                                    <select name="wishTypeId" value={formData.wishTypeId} onChange={handleChange} className="form-control" id="exampleSelectGender">
                                        <option value="">Selectionner un type de souhait</option>
                                        {dataWishType && dataWishType.map((item, id) => (
                                            <option key={item.wishTypeId} value={item.wishTypeId}>
                                                {item.designation}
                                            </option>
                                        ))}
                                    </select>    
                                </div>
                                <div className="form-group">
                                    <label htmlFor="exampleInputEmail1">Motivation</label>
                                    <input type="text" value={formData.motivation} onChange={handleChange} name="motivation" className="form-control" id="exampleInputEmail1"/>
                                </div>
                                <div className="form-group">
                                    <label htmlFor="exampleInputEmail1">Disponibilite</label>
                                    <input type="date" value={formData.disponibility} onChange={handleChange} name="disponibility" className="form-control" id="exampleInputEmail1"/>
                                </div>
                                <div className="form-group">
                                    <label htmlFor="exampleInputEmail1">Priorite (/10)</label>
                                    <input type="number" value={formData.priority} onChange={handleChange} name="priority" className="form-control" id="exampleInputEmail1"/>
                                </div>
                                <div className="form-group">
                                    <label htmlFor="exampleInputEmail1">Date du demande</label>
                                    <input type="date" value={formData.requestDate} onChange={handleChange} name="requestDate" className="form-control" id="exampleInputEmail1"/>
                                </div>
                                <div className="button-save-profil">
                                    <button onClick={handleSubmit} type="button" className="btn btn-success btn-fw">
                                        <i className='mdi mdi-content-save button-logo'></i>
                                        Enregistrer
                                    </button>
                                    <button type="button" className="btn btn-light btn-fw">
                                        <i className='mdi mdi-undo-variant button-logo'></i>
                                        Retour
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="col-md-6 grid-margin stretch-card">
                        <div className="card">
                            <div className="card-header title-container">
                                <h5 className="title">
                                    <i className="mdi mdi-playlist-star"></i> Liste de Suggestions
                                </h5>
                            </div>
                            <div className="card-body">
                            <table className="table table-bordered table-skill">
                                    <tr>
                                        <th>#</th>
                                        <th>Poste suggerrée</th>
                                    </tr>
                                    {dataSuggestionPosition.length > 0 ? (
                                        dataSuggestionPosition.map((item, id) => (
                                        <tr key={id}>
                                            <td>{item.positionId}</td>
                                            <td>{item.positionName}</td>
                                        </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan="7" className="text-center">Aucun résultat trouvé.</td>
                                        </tr>
                                    )}
                                </table>
                            </div>
                        </div>
                    </div>
                </div>
            </form>
        </Template>
    );
}

export default AddWishEvolution;
