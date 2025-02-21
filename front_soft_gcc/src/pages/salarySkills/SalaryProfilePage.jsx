import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { urlApi } from '../../helpers/utils';
import PageHeader from '../../components/PageHeader';
import SkillSalaryChart from '../../components/salarySkills/SkillSalaryChart';
import SalaryDescription from '../../components/salarySkills/salaryDescription';
import CardSkills from '../../components/salarySkills/cardSkills';
import Loader from '../../helpers/Loader';
import Template from '../Template';
import '../../styles/skillsStyle.css';

// Gestion d'affichage du page salaryProfile (profile des competences salaries)
function SalaryProfilePage({ task }) {
  // Gestion d'affichage d'url dans l'entete du page
  const module = "Compétences";
  const action = "Profil";
  const url = "/competences";

  // Gestion des states
  const { idEmployee } = useParams();
  const [employeeDescription, setEmployeeDescription] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null); 

  // Récupération des données à l'aide de l'API
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true); 
      try {
        const response = await fetch(urlApi(`/EmployeeSkills/description/${idEmployee}`));
        const data = await response.json();
        setEmployeeDescription(data);
      } catch (error) {
        setError(`Erreur lors de la récupération des données de description des employés : ${error.message}`);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [idEmployee]);

  // Afficher le loader pendant le chargement
  if (loading) {
    return(
      <Template>
        <PageHeader module={module} action={action} url={url} />
        <Loader />
      </Template>
    );
  }

  // Vérifier si les données sont bien reçues
  if (!employeeDescription || employeeDescription.length === 0) {
    return(
      <Template>
        <PageHeader module={module} action={action} url={url} />
        <div style={{ color: 'red' }}>Aucune donnée trouvée. {error}</div>
      </Template>
    );  }

  if (error) {
    return(
      <Template>
        <PageHeader module={module} action={action} url={url} />
          {error && <div className="alert alert-danger">{error}</div>}
        </Template>
    );
  }

  // Si c'est un tableau, on accède au premier élément (l'index 0)
  const employee = employeeDescription[0];

  return (
    <Template>
      <PageHeader module={module} action={action} url={url} />
      <div className="title-container">
        <h4 className="title"> 
          <i className="mdi mdi-note-text"></i> 
          <span>Description</span>
        </h4>
      </div>
      <SalaryDescription dataEmployeeDescription={employee} />

      <div className="card-header title-container">
        <h4 className="title"> 
          <i className="mdi mdi-school"></i> 
          <span>Compétences</span>
        </h4>
      </div>
      <CardSkills dataEmployeeDescription={employee} idEmployee={idEmployee} />

      <div className="card-header title-container">
        <h4 className="title"> 
          <i className="mdi mdi-chart-bar"></i> 
          <span>Graphes des compétences</span>
        </h4>
      </div>
      <SkillSalaryChart employeeId={idEmployee} />
    </Template>
  );
}

export default SalaryProfilePage;
