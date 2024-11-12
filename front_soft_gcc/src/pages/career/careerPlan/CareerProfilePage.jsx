import React, { useState } from 'react';
import Template from '../../Template';
import PageHeader from '../../../components/PageHeader';
import AffectationList from '../../../components/career/AffectationList';
import Certificate from '../../../components/career/Certificate';
import History from '../../../components/career/History';
import '../../../styles/careerStyle.css';

function CareerProfilePage({ onSearch }) {
    const module = "Plan de carrière";
    const action = "Fiche";
    const url = "/carriere/fiche";

    const [componentToDisplay, setComponentToDisplay] = useState(1);

    const updateComponent = (value) => {
        setComponentToDisplay(value);
    };

    return (
        <Template>
            <PageHeader module={module} action={action} url={url} />

            <h4>Description de l'employe</h4>
            <div className="row description">    
                <div className="col-md-6 grid-margin stretch-card">
                    <div className="card">
                        <div className="card-body">
                            <p>Employe : <span className='value-profil'>Rakoto Jean</span></p>
                            <p>Matricule : <span className='value-profil'>NUM002334</span></p>
                            <p>Date naissance : <span className='value-profil'>19/06/2002</span></p>
                        </div>
                    </div>
                </div>
                <div className="col-md-6 grid-margin stretch-card">
                    <div className="card">
                        <div className="card-body">
                            <p>Poste actuel : <span className='value-profil'>Developpeur</span></p>
                            <p>Salaire : <span className='value-profil'>1 000 000 Ar</span></p>
                            <p>Date d'embauche : <span className='value-profil'>19/06/2022</span></p>
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
                <History />
            ) : (
                <AffectationList />
            )}
        </Template>
    );
}

export default CareerProfilePage;
