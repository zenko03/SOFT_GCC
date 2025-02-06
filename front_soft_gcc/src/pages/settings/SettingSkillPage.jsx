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
function SettingSkillPage() {
    const module = 'Parametre';
    const action = 'Competence';
    const url = '/Parametre';
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null); 

    const  [listSettings, setListSettings] = useState([
        {url: '/softGcc/settings/competence/niveau', crudName: 'Niveau'}, 
        {url: '/softGcc/settings/competence/departement', crudName: 'Departement'}, 
        {url: '/softGcc/settings/competence/domaine', crudName: 'Domaine'}, 
        {url: '/softGcc/settings/competence/language', crudName: 'Language'}, 
        {url: '/softGcc/settings/competence/ecole', crudName: 'Ecole'}, 
        {url: '/softGcc/settings/competence/competence', crudName: 'Competence'}, 
        {url: '/softGcc/settings/competence/filiere', crudName: 'Filiere'}
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
                <h2 className="card-title">Paramètre des compétences</h2>                
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

export default SettingSkillPage;
