import React, { useState, useEffect, useCallback } from 'react';
import PageHeader from '../../components/PageHeader';
import Template from '../Template';
import { urlApi } from '../../helpers/utils';
import axios from "axios";
import Loader from '../../helpers/Loader';
import OrgChart from '../../components/organizationalChart/OrgChart';

// Page d'organigramme des employes
function EmployeeOrgChart() {
    const module = 'Organigramme';
    const action = 'employee';
    const url = '/Organigramme';

    // Initialisation des states
    const [orgData, setOrgData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null); 

    // Récupération des données à l'aide de l'API
    const fetchData = useCallback(async () => {
        setLoading(true);
        try {
            console.log("Fetching data...");
            const orgDataResponse = await axios.get(urlApi('/Org/organigramme'));
            setOrgData(orgDataResponse.data[0]);
        } catch (error) {
            setError(`Erreur lors de la récupération des données : ${error.message}`);
        } finally {
            setLoading(false);
        }
    }, []);

    // Effet pour déclencher le fetch
    useEffect(() => {
        fetchData();
    }, [fetchData]);
    
    return (
        <Template>          
            {loading && <Loader />} {/* Affichez le loader lorsque `loading` est true */}

            {error && <div className="alert alert-danger">{error}</div>} {/* Affichez l'erreur si elle existe */}

            <PageHeader module={module} action={action} url={url} />

            <div className="col-lg-10 skill-header">
                <i className="mdi mdi-sitemap skill-icon"></i>
                <h4 className="skill-title">Organigramme de l'entreprise</h4>
            </div>
            <div className="container-responsive">
                <div className="row">
                    <div className="col-lg-12 grid-margin stretch-card">
                        <div className="card">
                            <div className="card-body">
                                {orgData ? (
                                    <OrgChart data={orgData} />
                                ) : (
                                    <div>Aucune donnée disponible</div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>  
            </div>
        </Template>
    );
}

export default EmployeeOrgChart;
