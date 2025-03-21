import React, {useState, useEffect} from 'react';
import Template from '../../Template';
import PageHeader from '../../../components/PageHeader';
import AffectationList from '../../../components/career/AffectationList';
import Certificate from '../../../components/career/Certificate';
import History from '../../../components/career/History';
import '../../../styles/careerStyle.css';
import axios from 'axios';
import { urlApi } from '../../../helpers/utils';
import Loader from '../../../helpers/Loader';
import { useParams } from 'react-router-dom';
import FormattedDate from '../../../helpers/FormattedDate';
import { useNavigate } from 'react-router-dom';

// Page détails du plan de carrière
function CareerProfilePage({ onSearch }) {
    // Url d'en-tete de page
    const module = "Plan de carrière";
    const action = "Fiche";
    const url = "/carriere";

    // Initialisation des variables utiles
    const { registrationNumber } = useParams();
    const [isLoading, setIsLoading] = useState(false); 
    const [error, setError] = useState(false); 
    const navigate = useNavigate();

    // Appel api pour les donnees du formulaire
    const [dataEmployee, setDataEmployee] = useState([]); 
    const [dataAssignmentAdvancement, setDataAssignmentAdvancement] = useState([]);
    const [dataAssignmentAppointment, setDataAssignmentAppointment] = useState([]);
    const [dataAssignmentAvailability, setDataAssignmentAvailability] = useState([]);
    const [componentToDisplay, setComponentToDisplay] = useState(1);

    // Mise à jour du coomposant responsable à l'affichage
    const updateComponent = (value) => {
        setComponentToDisplay(value);
    };

    // Chargement des donnees depuis l'api 
    const fetchData = async () => {
        setIsLoading(true);
        try {
            const [employeeResponse, advancementResponse, appointmentResponse, availabilityResponse] = await Promise.all([
                axios.get(urlApi(`/CareerPlan/careers/${registrationNumber}`)),
                axios.get(urlApi(`/CareerPlan/employee/${registrationNumber}/advancement`)),
                axios.get(urlApi(`/CareerPlan/employee/${registrationNumber}/appointment`)),
                axios.get(urlApi(`/CareerPlan/employee/${registrationNumber}/availability`))
            ]);
            setDataEmployee(employeeResponse.data || []);
            setDataAssignmentAdvancement(advancementResponse.data || []);
            setDataAssignmentAppointment(appointmentResponse.data || []);
            setDataAssignmentAvailability(availabilityResponse.data || []);
        } catch (error) {
            setError(`Erreur lors de la recuperation des donnees : ${error}`);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [registrationNumber]);

    // Fonction qui gère le retour en arrière de la page
    const handleRetour = () => {
        navigate(`/carriere`);
    };

    // Loading page
    if (isLoading) {
        return <div>
                <Loader />
            </div>;
    }

    // Gestion d'erreur
    if (error) {
        return <div>Erreur: {error.message}</div>;
    }

    return (
        <Template>
            <PageHeader module={module} action={action} url={url} />

            <div className="title-container">
                <div className="col-lg-10 skill-header">
                    <i className="mdi mdi-note-text skill-icon"></i>
                    <h4 className="skill-title" style={{color: '#B8860B'}}>DESCRIPTION DU PLAN DE CARRIERE</h4>
                </div>
                <div className="col-lg-2">
                    <button onClick={handleRetour} className="btn-outline-dark btn-fw" style={{float: 'right'}}>
                        <i className="mdi mdi-arrow-left-circle" style={{marginRight: '10px'}}></i>
                        Retour
                    </button>
                </div>  
            </div>

           


            <div className="row description">    
                <div className="col-md-6 grid-margin stretch-card">
                    <div className="card">
                        <div className="card-body">
                            <p>Employe : <span className='value-profil'>{dataEmployee.firstName+" "+dataEmployee.name}</span></p>
                            <p>Matricule : <span className='value-profil'>{dataEmployee.registrationNumber}</span></p>
                            <p>Date naissance : <span className='value-profil'><FormattedDate date={dataEmployee.birthday} /></span></p>
                        </div>
                    </div>
                </div>
                <div className="col-md-6 grid-margin stretch-card">
                    <div className="card">
                        <div className="card-body">
                            <p>Poste actuel : <span className='value-profil'>{dataEmployee.positionName}</span></p>
                            <p>Salaire : <span className='value-profil'>{dataEmployee.baseSalary} Ar</span></p>
                            <p>Date d'embauche : <span className='value-profil'><FormattedDate date={dataEmployee.assignmentDate} /></span></p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="row">
                <div className="col-lg-12 grid-margin">
                            {/* Menu de navigation des compétences */}
                            <ul className="nav nav-tabs tab-transparent" role="tablist">
                                <li className="nav-item">
                                    <a onClick={() => updateComponent(2)} className="nav-link" id="home-tab" data-toggle="tab" href="#" role="tab" aria-selected="true">Attestation</a>
                                </li>
                                <li className="nav-item">
                                    <a onClick={() => updateComponent(1)} className="nav-link active" id="business-tab" data-toggle="tab" href="#business-1" role="tab" aria-selected="false">Suivi carriere</a>
                                </li>
                                <li className="nav-item">
                                    <a onClick={() => updateComponent(3)} className="nav-link" id="performance-tab" data-toggle="tab" href="#" role="tab" aria-selected="false">Historiques</a>
                                </li>
                            </ul>
                </div>
            </div>

            {componentToDisplay === 2 ? (   // Certification
                <Certificate dataEmployee={dataEmployee}/>
            ) : componentToDisplay === 3 ? (    // Historique
                <History registrationNumber={registrationNumber} />
            ) : (   // Liste d'affectation
                <AffectationList dataAssignmentAppointment={dataAssignmentAppointment} dataAssignmentAdvancement={dataAssignmentAdvancement} dataAssignmentAvailability={dataAssignmentAvailability} fetchData={fetchData} />
            )}
        </Template>
    );
}

export default CareerProfilePage;
