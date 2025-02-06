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
        {url: '/softGcc/settings/carriere/typeAffectation', crudName: 'Type d\'affectation'}, 
        {url: '/softGcc/settings/carriere/typeCertificat', crudName: 'Type de certificat'},
        {url: '/softGcc/settings/carriere/echelon', crudName: 'Echelon'},  
        {url: '/softGcc/settings/carriere/typeEmploye', crudName: 'Type d\'employé'},  
        {url: '/softGcc/settings/carriere/etablissement', crudName: 'Etablissement'}, 
        {url: '/softGcc/settings/carriere/fonction', crudName: 'Fonction'}, 
        {url: '/softGcc/settings/carriere/indication', crudName: 'Indication'}, 
        {url: '/softGcc/settings/carriere/classeLegale', crudName: 'Classe legale'}, 
        {url: '/softGcc/settings/carriere/bulletin', crudName: 'Bulletin'}, 
        {url: '/softGcc/settings/carriere/methodePaiement', crudName: 'Methode de paiement'},                 
        {url: '/softGcc/settings/carriere/poste', crudName: 'Poste'},     
        {url: '/softGcc/settings/carriere/categorieProfessionnelle', crudName: 'Categorie professionnelle'},                 
        {url: '/softGcc/settings/carriere/categorieSocioProfessionnelle', crudName: 'Categorie socio-professionnelle'},                 
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
                <h2 className="card-title">Paramètre des carrières</h2>                
            </div>

            <div className="row">
                {listSettings.map((item, id) => (
                    <div key={id} className="col-lg-3 grid-margin stretch-card">
                        <div onClick={() => (handleCrudPage(item))} className="card" style={{backgroundColor: '#0062ff'}}>
                            <div className="card-body"> 
                                <h5 className="card-title">
                                    <span>{item.crudName}</span> 
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
