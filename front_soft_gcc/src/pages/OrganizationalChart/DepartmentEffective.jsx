import React, { useState, useEffect, useCallback } from 'react';
import PageHeader from '../../components/PageHeader';
import Template from '../Template';
import { useNavigate } from 'react-router-dom';
import { urlApi } from '../../helpers/utils';
import axios from "axios";
import Loader from '../../helpers/Loader';
import '../../styles/orgChart.css';
import defaultImg from '../../assets/images/default.jpg';
import ModalImportEmployee from '../../components/organizationalChart/ModalImportEmployee';

// Map des images des départements
const departmentImages = {
    default: defaultImg,
};

// Fonction pour obtenir le chemin de l'image
const getDepartmentImage = (departmentName) => {
    return departmentImages[departmentName.toLowerCase()] || departmentImages.default;
};


// Page pour les nombres des employés par département
function DepartmentEffective() {
    const module = 'Effectif';
    const action = 'employee par departement';
    const url = '/Effectif';
    const navigate = useNavigate();

    // Initialisation des states
    const [numberEmployeeByDepartment, setNumberEmployeeByDepartment] = useState([]); 
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null); 

    // Navigation pour ajout
    const handleClickOrg = () => {
        navigate('/softGcc/organigramme');
    };

    // Navigation pour details
    const handleClickDetails = (departmentId) => {
        navigate(`/softGcc/effectif/details/${departmentId}`);
    };

    // Récupération des données à l'aide de l'API
    const fetchData = useCallback(async () => {
        setLoading(true);
        try {
            const numberEmployeeByDepartmentResponse = await axios.get(urlApi('/Org/effectifDepartement'));
            setNumberEmployeeByDepartment(numberEmployeeByDepartmentResponse.data);
        } catch (error) {
            setError(`Erreur lors de la récupération des données : ${error.message}`);
        } finally {
            setLoading(false);
        }
    }, []);

    // Effet pour déclencher les fetch
    useEffect(() => {
        fetchData();
    }, [fetchData]);

    return (
        <Template>
            {loading && <Loader />} {/* Affichez le loader lorsque `loading` est true */}
            {error && <div className="alert alert-danger">{error}</div>} {/* Affichez les erreurs */}
            <PageHeader module={module} action={action} url={url} />

            <div className="row mb-3">
                <div className="col-lg-10 skill-header">
                    <i className="mdi mdi-account-group skill-icon"></i>
                    <h4 className="skill-title">Effectif par département</h4>
                </div>
                <div className="col-lg-2">
                    <div className="action-buttons text-left my-1">
                        <button type="button" onClick={handleClickOrg} className="btn btn-success">
                            <i className="mdi mdi-sitemap button-logo"></i>
                            Voir organigramme
                        </button>
                    </div>
                </div>
            </div>
            <div className="row">
                {numberEmployeeByDepartment.map((item) => (
                    <div onClick={() => (handleClickDetails(item.departmentId))} key={item.departmentId} className="col-lg-3 col-md-6 col-sm-12 grid-margin stretch-card">
                        <div className="card department-card">
                            {item.departmentPhoto ? (
                                <img src={urlApi(`/Department/photo/${item.departmentId}`)} 
                                alt="Photo" 
                                className="department-image"/>
                            ) : (
                                <img
                                src={getDepartmentImage(item.departmentName)}
                                alt={item.departmentName}
                                className="department-image"
                            />
                            )}
                            <div className="card-body text-center">
                                <h5 className="department-name">{item.departmentName.toUpperCase()}</h5>
                                <p className="employee-count">{item.nEmployee} employés</p>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </Template>
    );
}

export default DepartmentEffective;
