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

// Fonction debounce pour éviter les appels excessifs
function debounce(func, delay) {
    let timeout;
    return (...args) => {
      clearTimeout(timeout);
      timeout = setTimeout(() => func(...args), delay);
    };
  }

// Page de suivi des souhaits d'évolution
function DashboardPage() {
    const module = 'Statistiques';
    const action = 'Analyse';
    const url = '/Statistiques';
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null); 
    const [employeeTotal, setEmployeeTotal] = useState(null); 
    const [wishEvolutionTotal, setWishEvolutionTotal] = useState(null); 
    const [departments, setDepartments] = useState([]); 
    const [skills, setSkills] = useState([]); 
    const [careers, setCareers] = useState([]); 
    const [datasSkills, setDatasSkills] = useState([]);
    const [datasCareer, setDatasCareer] = useState([]);

    // États pour les filtres
    const [filterSkills, setFilterSkills] = useState({
        departmentId: 2,
        state: 10
    });

    const [filterCareers, setFilterCareers] = useState({
        departmentId: 1,
    });

    // Gestion des filtres pour les competences
    const handleFilterSkillsChange = (e) => {
        const { name, value } = e.target;
        setFilterSkills((prevFilters) => ({ ...prevFilters, [name]: value }));
    };

    // Gestion des filtres pour les carrieres
    const handleFilterCareersChange = (e) => {
        const { name, value } = e.target;
        setFilterCareers((prevFilters) => ({ ...prevFilters, [name]: value }));
    };

    // Fetch des données avec filtres
    const fetchFilteredData = useCallback(
        async (appliedFilterSkills, appliedFilterCareers) => {
        setLoading(true);
        setError(null);

        try {
            const queryParamSkills = new URLSearchParams({
            ...appliedFilterSkills
            }).toString();

            const queryParamCareers = new URLSearchParams({
                ...appliedFilterCareers
            }).toString();
            
            const [skillsResponse, careersResponse] = await Promise.all([
                axios.get(urlApi(`/Dashboard/employeeSkillByDepartment?${queryParamSkills}`)),
                axios.get(urlApi(`/Dashboard/employeeCareerByDepartment?${queryParamCareers}`))
            ]);

            setSkills(skillsResponse.data || []);
            setCareers(careersResponse.data || []);
            setError(null);

        } catch (err) {
            setSkills([]);
            setCareers([]);
            setError('Erreur lors de la récuperation des données : ' + err.message);
        } finally {
            setLoading(false);
        }
        },
        []
    );
    
    // Récupération des données à l'aide de l'API
    const fetchData = useCallback(async () => {
        setLoading(true);
        try {
            const [rapportResponse, departmentListResponse] = await Promise.all([
                axios.get(urlApi('/Dashboard/employeeNumberTotal')),
                axios.get(urlApi('/Department'))
            ]);

            setEmployeeTotal(rapportResponse.data.employeeTotal || 0);
            setWishEvolutionTotal(rapportResponse.data.wishEvolutionTotal || 0);
            setDepartments(departmentListResponse.data || []);
        } catch (error) {
            setError(`Erreur lors de la récupération des données : ${error.message}`);
        } finally {
            setLoading(false);
        }
    }, []);

    // Débouncer les appels
    const debouncedFetchData = useCallback(debounce(fetchFilteredData, 1000), [
        fetchFilteredData,
    ]);

/// Effet pour déclencher les fetch
    // Pour les donnees initial
    useEffect(() => {
        fetchData();
    }, [fetchData]);

    // Pour les donnees filtres
    useEffect(() => {
        debouncedFetchData(filterSkills, filterCareers);
    }, [filterSkills, filterCareers, debouncedFetchData]);

    // Pour les donnees affiches dans les graphes
    useEffect(() => {
        setDatasSkills(skills.map(skill => ({
            label: skill.skillName,
            value: skill.nEmployee,
            color: skill.state === 1 ? 'rgba(255, 99, 132, 0.7)' : skill.state === 5 ? 'rgba(255, 206, 86, 0.7)' : 'rgba(75, 192, 192, 0.7)',
            borderColor: skill.state === 1 ? 'rgba(255, 99, 132, 1)' : skill.state === 5 ? 'rgba(255, 206, 86, 1)' : 'rgba(75, 192, 192, 1)'
        })));

        setDatasCareer(careers.map(career => ({
            label: career.positionName,
            value: career.nEmployee,
            color: 'rgba(75, 192, 192, 0.7)',
            borderColor: 'rgba(75, 192, 192, 1)'
        })));
    }, [skills, careers]);
    

    const renderStatus = (statuses) => {
        return statuses.map((status, index) => (
            <li key={index}>
                <div className='help-graph'>
                    <div className='color-graph' style={{ backgroundColor: status.backgroundColor, border: `1px solid ${status.borderColor}` }}></div>
                    <div className='descri-graph'>{status.label}</div>
                </div>
            </li>
        ));
    };

    const statusCareer = [];

    const statusSkills = [
        { label: 'Non validé', backgroundColor: 'rgba(255, 99, 132, 0.2)', borderColor: 'rgba(255, 99, 132, 1)' },
        { label: 'Validé par évaluation', backgroundColor: 'rgba(255, 206, 86, 0.2)', borderColor: 'rgba(255, 206, 86, 1)' },
        { label: 'Confirmé', backgroundColor: 'rgba(75, 192, 192, 0.2)', borderColor: 'rgba(75, 192, 192, 1)' }
    ];

    /*const statusCareer = [
        { label: 'En attente', backgroundColor: 'rgba(255, 99, 132, 0.2)', borderColor: 'rgba(255, 99, 132, 1)' },
        { label: 'En cours', backgroundColor: 'rgba(255, 206, 86, 0.2)', borderColor: 'rgba(255, 206, 86, 1)' },
        { label: 'Terminé', backgroundColor: 'rgba(75, 192, 192, 0.2)', borderColor: 'rgba(75, 192, 192, 1)' }
    ];*/

    return (
        <Template>
            {loading && <Loader />} {/* Affichez le loader lorsque `loading` est true */}
          
            <PageHeader module={module} action={action} url={url} />
            <div className="row header-title">
                <div className="col-lg-10 skill-header">
                    <i className="mdi mdi-view-grid skill-icon"></i>
                    <h4 className="skill-title">Taleau de bord</h4>
                </div>
            </div>

            <div className="row">
                <div className="col-lg-3 col-md-6">
                    <div className="card stats-card">
                        <div className="card-body text-center">
                            <i className="mdi mdi-account-group stats-icon"></i>
                            <h5 className="card-title">
                                <span className="stats-number">{employeeTotal}</span>
                                <br />
                                Employés
                            </h5>
                        </div>
                    </div>
                </div>

                <div className="col-lg-3 col-md-6">
                    <div className="card stats-card">
                        <div className="card-body text-center">
                            <i className="mdi mdi-trending-up stats-icon"></i>
                            <h5 className="card-title">
                                <span className="stats-number">{wishEvolutionTotal}</span>
                                <br />
                                Souhaits d'évolution
                            </h5>
                        </div>
                    </div>
                </div>
            </div>

            <div className="col-lg-12 skill-header">
                <i className="mdi mdi-school skill-icon"></i>
                <h4 className="skill-title">COMPÉTENCES</h4>
            </div>
            <div className="row">
                <div className="col-lg-12 grid-margin stretch-card">
                    <div className="card">
                        <div className="card-body">
                            <div className="skill-header subtitle">
                                <i className="mdi mdi-chart-bar icon-sub"></i>
                                <h4 className="sub">Graphe</h4>
                            </div>
                            <p className="card-description text-left">Nombre des employés par compétences dans un département</p>
                            <div className="form-group row">
                                <div className="col-sm-3">
                                    <select
                                        name="departmentId"
                                        className="form-control"
                                        value={filterSkills.departmentId}
                                        onChange={handleFilterSkillsChange}
                                    >
                                        <option selected value="">Sélectionner un département</option>
                                        {departments?.map((item) => (
                                            <option key={item.departmentId} value={item.departmentId}>
                                                {item.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div className="col-sm-3">
                                    <select 
                                        name="state" 
                                        value={filterSkills.state} 
                                        onChange={handleFilterSkillsChange} 
                                        className="form-control"
                                    >
                                        <option value="">Sélectionner un état</option>
                                        <option value="1">Non validé</option>
                                        <option value="5">Validé par évaluation</option>
                                        <option value="10">Confirmé</option>
                                    </select>
                                </div>
                            </div>
                            <BarChart datas = {datasSkills} states = {renderStatus(statusSkills)} labelLetter = {'Compétences'} />

                            <div className="skill-header subtitle">
                                <i className="mdi mdi-format-list-bulleted icon-sub"></i>
                                <h6 className="sub">Liste</h6>
                            </div>
                            <table className="table table-competences">
                                <thead>
                                <tr>
                                    <th>#</th>
                                    <th>Departement</th>
                                    <th>Compétence</th>
                                    <th>Employé</th>
                                </tr>
                                </thead>
                                <tbody>
                                    {skills?.map((item) => (
                                        <tr>
                                            <td>{item.skillId}</td>
                                            <td>{item.departmentName}</td>
                                            <td>{item.skillName}</td>
                                            <td>{item.nEmployee}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>  

            <div className="col-lg-12 skill-header">
                <i className="mdi mdi-map-marker-path skill-icon"></i>
                <h4 className="skill-title">CARRIÈRES</h4>
            </div>
            <div className="row">
                <div className="col-lg-12 grid-margin stretch-card">
                    <div className="card">
                        <div className="card-body">
                            <div className="skill-header subtitle">
                                <i className="mdi mdi-chart-bar icon-sub"></i>
                                <h4 className="sub">Graphe</h4>
                            </div>
                            <p className="card-description text-left">Rapport nombre total des employés dans des postes de carrières par département</p>
                            <div className="form-group row">
                                <div className="col-sm-3">
                                    <select
                                        name="departmentId"
                                        className="form-control"
                                        value={filterCareers.departmentId}
                                        onChange={handleFilterCareersChange}
                                    >
                                        <option selected value="">Sélectionner un département</option>
                                        {departments?.map((item) => (
                                            <option key={item.departmentId} value={item.departmentId}>
                                                {item.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                            <BarChart datas = {datasCareer} states = {renderStatus(statusCareer)} labelLetter={'Poste de carrière'} />

                            <div className="skill-header subtitle">
                                <i className="mdi mdi-format-list-bulleted icon-sub"></i>
                                <h6 className="sub">Liste</h6>
                            </div>
                            <table className="table table-competences">
                                <thead>
                                <tr>
                                    <th>#</th>
                                    <th>Departement</th>
                                    <th>Poste</th>
                                    <th>Employé</th>
                                </tr>
                                </thead>
                                <tbody>
                                    {careers?.map((item) => (
                                        <tr>
                                            <td>{item.positionId}</td>
                                            <td>{item.departmentName}</td>
                                            <td>{item.positionName}</td>
                                            <td>{item.nEmployee}</td>
                                        </tr> 
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>       
        </Template>
      );
}

export default DashboardPage;
