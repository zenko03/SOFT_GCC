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
    const url = "/carriere";

    // Initialisation des states
    const [selectedItem, setSelectedItem] = useState('1');
    const [formErrors, setFormErrors] = useState({});
    const [submitError, setSubmitError] = useState(''); 
    const [isLoading, setIsLoading] = useState(false); 
    const [error, setError] = useState(false); 

    // Appel api pour les donnees du formulaire
    const [dataEmployee, setDataEmployee] = useState([]); 
    const [dataAssignmentType, setDataAssignmentType] = useState([]); 

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
        assignmentTypeId: 1,
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

    if (formErrors[name]) {
        // Revalider le champ en temps réel
        validateField(name, value);
    }
  };


  const validateField = (fieldName, value) => {
    let error = '';
    if (fieldName === 'registrationNumber' && !value) {
      error = 'La matricule est obligatoire.';
    } else if (fieldName === 'assignmentTypeId' && !value) {
      error = 'Le type d’affectation est obligatoire.';
    } else if (fieldName === 'decisionNumber' && !value.trim()) {
      error = 'Le numéro de décision est obligatoire.';
    } else if (
      (fieldName === 'decisionDate' || fieldName === 'assignmentDate') &&
      !value
    ) {
      error = `La date est obligatoire.`;
    }
    setFormErrors((prevErrors) => ({ ...prevErrors, [fieldName]: error }));
  };

  const validateForm = () => {
    const errors = {};
    if (!formData.registrationNumber) {
      errors.registrationNumber = 'La matricule est obligatoire.';
    }
    if (!formData.assignmentTypeId) {
      errors.assignmentTypeId = 'Le type d’affectation est obligatoire.';
    }
    if (!formData.decisionNumber) {
      errors.decisionNumber = 'Le numéro de décision est obligatoire.';
    }
    if (!formData.decisionDate) {
      errors.decisionDate = 'La date de décision est obligatoire.';
    }
    if (!formData.assignmentDate) {
      errors.assignmentDate = 'La date d’affectation est obligatoire.';
    }
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };



  // Gérer la soumission du formulaire
  const handleSubmit = async () => {
    if (!validateForm()) {
        return; // Empêche la soumission si le formulaire n’est pas valide
    }

    setIsLoading(true);
    try {
        const dataToSend = {
            ...formData,
            creationDate: new Date().toISOString(),
            updatedDate: new Date().toISOString(),
        };
  
        const response = await axios.post(urlApi('/CareerPlan'), dataToSend);
        setFormData({
            assignmentTypeId: 1,
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
            <div className="row header-title">
                <div className="col-lg-10 skill-header">
                    <i className="mdi mdi-map-marker-path skill-icon"></i>
                    <h4 className="skill-title">CREATION D'UN PLAN DE CARRIÈRE</h4>
                </div>
            </div>
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
                                                {item.registrationNumber + " - " + item.name + " " + item.firstName}
                                            </option>
                                        ))}
                                    </select>   
                                    {formErrors.registrationNumber && (
                                        <p className="text-danger">{formErrors.registrationNumber}</p>
                                    )} 
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
                                    {formErrors.assignmentTypeId && (
                                        <p className="text-danger">{formErrors.assignmentTypeId}</p>
                                    )} 
                                </div>
                                <div className="form-group">
                                    <label htmlFor="exampleInputEmail1">Numero de decision</label>
                                    <input type="text" name="decisionNumber" value={formData.decisionNumber} onChange={handleChange} className="form-control" id="exampleInputEmail1"/>
                                    {formErrors.decisionNumber && (
                                        <p className="text-danger">{formErrors.decisionNumber}</p>
                                    )}
                                </div>
                                <div className="form-group">
                                    <label htmlFor="exampleInputEmail1">Date de decision</label>
                                    <input type="date" name="decisionDate" value={formData.decisionDate} onChange={handleChange} className="form-control" id="exampleInputEmail1"/>
                                    {formErrors.decisionDate && (
                                        <p className="text-danger">{formErrors.decisionDate}</p>
                                    )}
                                </div>
                                <div className="form-group">
                                    <label htmlFor="exampleInputEmail1">Date d'affectation</label>
                                    <input type="date" name="assignmentDate" value={formData.assignmentDate} onChange={handleChange} className="form-control" id="exampleInputEmail1"/>
                                    {formErrors.assignmentDate && (
                                        <p className="text-danger">{formErrors.assignmentDate}</p>
                                    )}
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
