import React, {useState, useEffect} from 'react';
import Template from '../../Template';
import PageHeader from '../../../components/PageHeader';
import AppointmentForm from '../../../components/career/AppointmentForm';
import AdvancementForm from '../../../components/career/AdvancementForm';
import LayOffForm from '../../../components/career/LayOffForm';
import axios from 'axios';
import { urlApi } from '../../../helpers/utils';
import Loader from '../../../helpers/Loader';


// Page de creation d'un plan de carriere
function CreationCareerPlan({ onSearch }) {
    // Url d'en-tete de page
    const module = "Plan de carrière";
    const action = "Creation";
    const url = "/carriere/creation";

    // Initialisation des states
    const [selectedItem, setSelectedItem] = useState('1');
    const [formErrors, setFormErrors] = useState({});
    const [submitError, setSubmitError] = useState(''); 
    const [isLoading, setIsLoading] = useState(false); 
    const [error, setError] = useState(false); 

    // Appel api pour les donnees du formulaire
    const [dataEmployee, setDataEmployee] = useState([]); 
    const [dataAssignmentType, setDataAssignmentType] = useState([]); 

    //const { data: dataEmployee } = useSWR('/Employee', Fetcher);
    //const { data: dataAssignmentType } = useSWR('/AssignmentType', Fetcher);


    // Chargement des donnees depuis l'api 
    const fetchData = async () => {
        setIsLoading(true);
        try {
            const [employeeResponse, assignmentTypeResponse] = await Promise.all([
                axios.get(urlApi(`/Employee`)),
                axios.get(urlApi(`/AssignmentType`))
            ]);
            setDataEmployee(employeeResponse.data || []);
            setDataAssignmentType(assignmentTypeResponse.data || []);
        } catch (error) {
            setError(`Erreur lors de la recuperation des donnees : ${error}`);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);


    // Fonction qui gère le changement dans la liste déroulante
    const handleSelectChange = (event) => {
        setSelectedItem(event.target.value);
        handleChange(event);
        initializeForm();
    };


    // Gestion état du formulaire
    const [formData, setFormData] = useState({
        assignmentTypeId: undefined,
        registrationNumber: undefined,
        decisionNumber: undefined,
        decisionDate: undefined,
        assignmentDate: undefined,
        description: undefined,
        establishmentId: undefined,
        departmentId: undefined,
        positionId: undefined,
        employeeTypeId: undefined,
        socioCategoryProfessionalId: undefined,
        indicationId: undefined,
        baseSalary: undefined,
        netSalary: undefined,
        professionalCategoryId: undefined,
        legalClassId: undefined,
        newsletterTemplateId: undefined,
        paymentMethodId: undefined,
        endingContract: undefined,
        reason: undefined,
        assigningInstitution: undefined,
        startDate: undefined,
        endDate: undefined,
        echelonId: undefined,
        state: 1,
    });

  // Gérer les changements dans les champs du formulaire
  const handleChange = (e) => {
      const { name, value } = e.target;
      setFormData((prevData) => ({
          ...prevData,
          [name]: value,
      }));
  };

 /* // Gestion de la validation du formulaire
  const validateForm = () => {
    const errors = {};
    
    if (!formData.language_id) errors.language_id = 'Veuillez sélectionner une langue.';
    if (!formData.level) errors.level = 'Veuillez entrer un nombre entre 0 et 100.';
    if (!formData.state) errors.state = 'Veuillez sélectionner un état.';
    else if (formData.level < 0 || formData.level > 100) errors.year = 'Veuillez entrer un nombre entre 0 et 100.';

    setFormErrors(errors);
    return Object.keys(errors).length === 0; // Retourne `true` si aucune erreur
  };*/

  // Gérer la soumission du formulaire
  const handleSubmit = async () => {
      setIsLoading(true);
        try {
            const dataToSend = {
                ...formData,
                creationDate: new Date().toISOString(),
                updatedDate: new Date().toISOString(),
            };
  
            const response = await axios.post(urlApi('/CareerPlan'), dataToSend);
            console.log(response.data);
        } catch (error) {
            console.error('Erreur lors de l\'insertion :', error.response?.data || error.message);
        } finally {
            setIsLoading(false);
        }
  };
        
    const initializeForm = () => {
        setFormData((prevData) => ({
            ...prevData, // Conserve les autres champs inchangés
            establishmentId: undefined,
            departmentId: undefined,
            positionId: undefined,
            employeeTypeId: undefined,
            socioCategoryProfessionalId: undefined,
            indicationId: undefined,
            baseSalary: undefined,
            netSalary: undefined,
            professionalCategoryId: undefined,
            legalClassId: undefined,
            newsletterTemplateId: undefined,
            paymentMethodId: undefined,
            endingContract: undefined,
            reason: undefined,
            assigningInstitution: undefined,
            startDate: undefined,
            endDate: undefined,
            echelonId: undefined,
        }));
    };

    /// Gestion d'affichage de loading
    if (isLoading) {
        return <div>
                <Loader />
            </div>;
    }

    /// Gestion d'affichage d'erreur
    if (error) {
        return <div>Erreur: {error.message}</div>;
    }

    return (
        <Template>
            <PageHeader module={module} action={action} url={url} />
            <div className="row">
                <div className="button-save-profil">
                    <button onClick={handleSubmit} type="button" className="btn btn-success btn-fw">Enregistrer</button>
                    <button type="button" className="btn btn-light btn-fw">Annuler</button>
                </div>
            </div>

            <form className="forms-sample">
                <div className="row">            
                    <div className="col-md-6 grid-margin stretch-card">
                        <div className="card">
                            <div className="card-body">
                                <div className="form-group">
                                    <label htmlFor="exampleInputUsername1">Matricule</label>
                                    <select name="registrationNumber" value={formData.registrationNumber} onChange={handleChange} className="form-control" id="exampleSelectGender">
                                        <option value="">Sélectionner une matricule</option>
                                        {dataEmployee && dataEmployee.map((item, id) => (
                                            <option key={id} value={item.registrationNumber}>
                                                {item.registrationNumber}
                                            </option>
                                        ))}
                                    </select>    
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="col-md-6 grid-margin stretch-card">
                        <div className="card">
                            <div className="card-body">
                                <div className="form-group">
                                    <label htmlFor="exampleInputUsername1">Type d'affectation</label>
                                    <select name="assignmentTypeId" value={formData.assignmentTypeId} onChange={handleSelectChange} className="form-control" id="exampleSelectGender">
                                        <option value="">Sélectionner une affectation</option>
                                        {dataAssignmentType && dataAssignmentType.map((item, id) => (
                                            <option key={item.assignmentTypeId} value={item.assignmentTypeId}>
                                                {item.assignmentTypeName}
                                            </option>
                                        ))}
                                    </select>    
                                </div>
                                <div className="form-group">
                                    <label htmlFor="exampleInputEmail1">Numero de decision</label>
                                    <input type="text" name="decisionNumber" value={formData.decisionNumber} onChange={handleChange} className="form-control" id="exampleInputEmail1"/>
                                </div>
                                <div className="form-group">
                                    <label htmlFor="exampleInputEmail1">Date de decision</label>
                                    <input type="date" name="decisionDate" value={formData.decisionDate} onChange={handleChange} className="form-control" id="exampleInputEmail1"/>
                                </div>
                                <div className="form-group">
                                    <label htmlFor="exampleInputEmail1">Date d'affectation</label>
                                    <input type="date" name="assignmentDate" value={formData.assignmentDate} onChange={handleChange} className="form-control" id="exampleInputEmail1"/>
                                </div>
                                <div className="form-group">
                                    <label htmlFor="exampleInputEmail1">Description</label>
                                    <textarea name="description" value={formData.description} onChange={handleChange} className="form-control" id="exampleTextarea1" rows="4"></textarea>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                {selectedItem === '1' ? (
                    <AppointmentForm formData={formData} setFormData={setFormData} />
                  ) : selectedItem === '2' ? (
                    <LayOffForm handleChange={handleChange} formData={formData} />
                  ) : (
                    <AdvancementForm handleChange={handleChange} formData={formData} />
                  )}
                
            </form>
        </Template>
    );
}

export default CreationCareerPlan;
