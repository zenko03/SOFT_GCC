import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { urlApi } from '../../helpers/utils';
import PageHeader from '../../components/PageHeader';
import SkillsHistory from '../../components/salarySkills/SkillsHistory';
import SkillSalaryChart from '../../components/salarySkills/SkillSalaryChart';
import SalaryDescription from '../../components/salarySkills/salaryDescription';
import CardSkills from '../../components/salarySkills/cardSkills';
import Loader from '../../helpers/Loader';
import Template from '../Template';

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
        <p style={color='red'}>{error}</p>
      </Template>
    );
  }

  // Si c'est un tableau, on accède au premier élément (l'index 0)
  const employee = employeeDescription[0];

  return (
    <Template>
      <PageHeader module={module} action={action} url={url} />
      <SalaryDescription dataEmployeeDescription={employee} />

      <h4 className="card-title text-primary">Compétences</h4>
      <CardSkills dataEmployeeDescription={employee} idEmployee={idEmployee} />

      <h4 className="card-title text-primary">Graphes des compétences</h4>
      <SkillSalaryChart employeeId={idEmployee} />
    </Template>
  );
}

export default SalaryProfilePage;
