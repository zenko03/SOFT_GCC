import React, {useState, useEffect} from 'react';
import Template from '../Template';
import PageHeader from '../../components/PageHeader';
import useSWR from 'swr';
import Fetcher from '../../components/Fetcher';
import Loader from '../../helpers/Loader';
import axios from 'axios';
import { urlApi } from '../../helpers/utils';
import { useParams } from "react-router-dom";
import "../../styles/careerStyle.css";

// Page de creation d'un plan de carriere
function EditWishEvolution({ onSearch }) {
    // Url d'en-tete de page
    const module = "Souhait evolution";
    const action = "Modifier";
    const url = "/SouhaitEvolution/Modifier";

    const { WishEvolutionId } = useParams();

    // Preparation des donnees de formulaire
    const { data: dataPosition } = useSWR('/Position', Fetcher);
    const { data: dataWishType } = useSWR('/WishType', Fetcher);

    // Initialisation des states 
    const [isLoading, setIsLoading] = useState(false); 
    const [error, setError] = useState(false); 
    const [selectedItem, setSelectedItem] = useState(null); 
    const [dataSuggestionPosition, setDataSuggestionPosition] = useState([]); 
    const [wishEvolutionToEdit, setWishEvolutionToEdit] = useState(null); 

    // Pour les saisies de donnees
    const [formData, setFormData] = useState({
        positionId: '',
        employeeId: '',
        wishTypeId: '',
        motivation: '',
        disponibility: '',
        priority: '',
        requestDate: '',
        state: '',
    });

    // Formate une date ou retourne une chaîne vide si invalide
    const formatDate = (date) => {
        if (!date) return '';
        const parsedDate = new Date(date);
        return isNaN(parsedDate) ? '' : parsedDate.toISOString().split('T')[0];
    };

    // Gérer la soumission du formulaire
    const handleSubmit = async () => {
        setIsLoading(true);
        try {
            const dataToSend = {
                ...formData,
                updatedDate: new Date().toISOString(),
            };
            
            console.log(dataToSend);
            const response = await axios.put(urlApi(`/WishEvolution/${WishEvolutionId}`), dataToSend);
        } catch (error) {
            console.error('Erreur lors de la modification du souhait d\'evaluation : '+error);
            setError('Erreur lors de la modification du souhait d\'evaluation : '+error);
        } finally {
            setIsLoading(false);
      }
    };

    const fetchData = async () => {
        setIsLoading(true);
        try {
            const response = await axios.get(urlApi(`/WishEvolution/${WishEvolutionId}`));
            setWishEvolutionToEdit(response.data[0]);
            console.log(wishEvolutionToEdit);
            const [suggestionPositionResponse] = await Promise.all([
                axios.get(urlApi(`/WishEvolution/suggestionPosition/${response.data[0].employeeId}`))
            ]);
            setDataSuggestionPosition(suggestionPositionResponse.data || []);
            console.log("Yo");
            console.log(dataSuggestionPosition);
        } catch (err) {
            console.log(err);
            setError(`Erreur lors de la recuperation des donnees : ${err.message}`);
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

    useEffect(() => {
        if (WishEvolutionId) {
            console.log("Tonga = ");
            fetchData();
        }
    }, [WishEvolutionId]);

    useEffect(() => {
        if (wishEvolutionToEdit) {
            setFormData({
                wishEvolutionCareerId: wishEvolutionToEdit.wishEvolutionCareerId,
                positionId: wishEvolutionToEdit.wishPositionId || '',
                employeeId: wishEvolutionToEdit.employeeId || '',
                wishTypeId: wishEvolutionToEdit.wishTypeId || '',
                motivation: wishEvolutionToEdit.motivation || '',
                disponibility: formatDate(wishEvolutionToEdit.disponibility) || '',
                priority: wishEvolutionToEdit.priority || '',
                requestDate: formatDate(wishEvolutionToEdit.requestDate) || '',
                state: wishEvolutionToEdit.state || '',
                creationDate: wishEvolutionToEdit.creationDate || '',
            });
        }
    }, [wishEvolutionToEdit]);

    if (isLoading) {
        return <div>
            <Loader />
        </div>;
    }

    /// Gestion d'affichage d'erreur
    if (error) {
        return <div>{error}</div>;
    }

    return (
        <Template>
            <PageHeader module={module} action={action} url={url} />
            <h4>MODIFICATION D'UN SOUHAIT D'EVALUATION</h4>
            <form className="forms-sample">
                <div className="row">            
                    <div className="col-md-6 grid-margin stretch-card">
                        <div className="card">
                            <div className="card-body">
                                <h6 className="card-title subtitle">Formulaire de modification</h6>
                                <br></br>
                                <div className="form-group">
                                    <label htmlFor="exampleInputUsername1">Employe</label>
                                    <select name="employeeId" value={formData.employeeId} className="form-control" id="exampleSelectGender">
                                        {wishEvolutionToEdit ? (
                                            <option value={wishEvolutionToEdit.employeeId}>{wishEvolutionToEdit.registrationNumber}</option>
                                        ) : (
                                            <option value="">Selectionner un employé</option>
                                        )}
                                    </select>    
                                </div>
                                <div className="form-group">
                                    <label htmlFor="exampleInputUsername1">Poste souhait</label>
                                    <select name="positionId" value={formData.positionId} onChange={handleChange} className="form-control" id="exampleSelectGender">
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
                                    <button onClick={handleSubmit} type="button" className="btn btn-success btn-fw">Modifier</button>
                                    <button type="button" className="btn btn-light btn-fw">Annuler</button>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="col-md-6 grid-margin stretch-card">
                        <div className="card">
                            <div className="card-body">
                                <h6 className="card-title subtitle">Suggestion des postes</h6>
                                <table className="table table-bordered table-skill">
                                    <tr>
                                        <th>#</th>
                                        <th>Postes suggerres</th>
                                    </tr>
                                    {dataSuggestionPosition.length > 0 ? (
                                        dataSuggestionPosition.map((item) => (
                                        <tr key={item.positionId}>
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

export default EditWishEvolution;
