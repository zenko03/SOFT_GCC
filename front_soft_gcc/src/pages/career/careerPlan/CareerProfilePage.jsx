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


function CareerProfilePage({ onSearch }) {
    const module = "Plan de carrière";
    const action = "Fiche";
    const url = "/carriere";
    const { registrationNumber } = useParams();
    const [isLoading, setIsLoading] = useState(false); 
    const [error, setError] = useState(false); 

    // Appel api pour les donnees du formulaire
    const [dataEmployee, setDataEmployee] = useState([]); 
    const [dataAssignmentAdvancement, setDataAssignmentAdvancement] = useState([]);
    const [dataAssignmentAppointment, setDataAssignmentAppointment] = useState([]);
    const [dataAssignmentAvailability, setDataAssignmentAvailability] = useState([]);

    const [componentToDisplay, setComponentToDisplay] = useState(1);

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

            <h4>Description de l'employe</h4>
            <div className="row description">    
                <div className="col-md-6 grid-margin stretch-card">
                    <div className="card">
                        <div className="card-body">
                            <p>Employe : <span className='value-profil'>{dataEmployee.firstName+" "+dataEmployee.name}</span></p>
                            <p>Matricule : <span className='value-profil'>{dataEmployee.registrationNumber}</span></p>
                            <p>Date naissance : <span className='value-profil'>{new Date(dataEmployee.birthday).toLocaleDateString()}</span></p>
                        </div>
                    </div>
                </div>
                <div className="col-md-6 grid-margin stretch-card">
                    <div className="card">
                        <div className="card-body">
                            <p>Poste actuel : <span className='value-profil'>{dataEmployee.positionName}</span></p>
                            <p>Salaire : <span className='value-profil'>{dataEmployee.baseSalary} Ar</span></p>
                            <p>Date d'embauche : <span className='value-profil'>{new Date(dataEmployee.assignmentDate).toLocaleDateString()}</span></p>
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
                                    <a onClick={() => updateComponent(3)} className="nav-link" id="performance-tab" data-toggle="tab" href="#" role="tab" aria-selected="false">Historiques (13)</a>
                                </li>
                            </ul>
                </div>
            </div>

            {componentToDisplay === 2 ? (
                <Certificate />
            ) : componentToDisplay === 3 ? (
                <History registrationNumber={registrationNumber} />
            ) : (
                <AffectationList dataAssignmentAppointment={dataAssignmentAppointment} dataAssignmentAdvancement={dataAssignmentAdvancement} dataAssignmentAvailability={dataAssignmentAvailability} fetchData={fetchData} />
            )}
        </Template>
    );
}

export default CareerProfilePage;
