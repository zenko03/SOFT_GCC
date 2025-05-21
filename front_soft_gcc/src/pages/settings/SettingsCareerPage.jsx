import React, { useState, useEffect, useCallback } from 'react';
import PageHeader from '../../components/PageHeader';
import Template from '../Template';
import '../../styles/skillsStyle.css';
import '../../styles/pagination.css';
import { useNavigate } from 'react-router-dom';
import Loader from '../../helpers/Loader';
import '../../styles/pagination.css';
import BarChart from '../../components/BarChart';
import { urlApi } from '../../helpers/utils';
import axios from "axios";

// Page de suivi des souhaits d'évolution
function SettingCareerPage() {
    const module = 'Parametre';
    const action = 'Carriere';
    const url = '/Parametre';
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null); 

    const  [listSettings, setListSettings] = useState([
        {url: '/softGcc/settings/carriere/typeAffectation', crudName: 'Type d\'affectation', icon: 'mdi mdi-account-arrow-right settings-icon'}, 
        {url: '/softGcc/settings/carriere/typeCertificat', crudName: 'Type de certificat', icon: 'mdi mdi-certificate settings-icon'},
        {url: '/softGcc/settings/carriere/echelon', crudName: 'Echelon', icon: 'mdi mdi-stairs settings-icon'},  
        {url: '/softGcc/settings/carriere/typeEmploye', crudName: 'Type d\'employé', icon: 'mdi mdi-account-tie settings-icon'},  
        {url: '/softGcc/settings/carriere/etablissement', crudName: 'Etablissement', icon: 'mdi mdi-domain settings-icon'}, 
        {url: '/softGcc/settings/carriere/fonction', crudName: 'Fonction', icon: 'mdi mdi-briefcase settings-icon'}, 
        {url: '/softGcc/settings/carriere/indication', crudName: 'Indication', icon: 'mdi mdi-star settings-icon'}, 
        {url: '/softGcc/settings/carriere/classeLegale', crudName: 'Classe legale', icon: 'mdi mdi-gavel settings-icon'}, 
        {url: '/softGcc/settings/carriere/bulletin', crudName: 'Bulletin', icon: 'mdi mdi-newspaper settings-icon'}, 
        {url: '/softGcc/settings/carriere/methodePaiement', crudName: 'Methode de paiement', icon: 'mdi mdi-credit-card settings-icon'},                 
        {url: '/softGcc/settings/carriere/poste', crudName: 'Poste', icon: 'mdi mdi-briefcase settings-icon'},     
        {url: '/softGcc/settings/carriere/categorieProfessionnelle', crudName: 'Categorie professionnelle', icon: 'mdi mdi-account-tie settings-icon'},                 
        {url: '/softGcc/settings/carriere/categorieSocioProfessionnelle', crudName: 'Categorie socio-professionnelle', icon: 'mdi mdi-account-tie settings-icon'},                 
    ]);
    
    // Navigation dans la page de crud
    const handleCrudPage = (item) => {
        navigate(item.url);
    };

    return (
        <Template>
            {loading && <Loader />} {/* Affichez le loader lorsque `loading` est true */}
          
            <PageHeader module={module} action={action} url={url} />
            <div className='row'>
                <div className="col-lg-12 skill-header">
                    <i className="mdi mdi-settings skill-icon"></i>
                    <h4 className="skill-title">PARAMETRE DES CARRIERES</h4>
                </div>             
            </div>

            <div className="row">
                {listSettings.map((item, id) => (
                    <div key={id} className="col-lg-2 grid-margin stretch-card">
                        <div onClick={() => (handleCrudPage(item))} className="card settings-card">
                            <div className="card-body"> 
                                <h5 className="card-text">
                                    <i className={item.icon}></i>
                                    <span className='settings-title'>{item.crudName}</span> 
                                </h5>
                            </div>
                        </div>
                    </div>
                ))}
            </div>        
        </Template>
      );
}

export default SettingCareerPage;
