import React from 'react';
import { Route, Routes } from 'react-router-dom';
import Template from '../pages/Template';
import LoginPage from '../pages/LoginPage';
import SalaryList from '../pages/Evaluations/Notations/SalaryList';
import Notation from '../pages/Evaluations/Notations/Notation';
import ListSkillSalaryPage from '../pages/salarySkills/ListSkillSalaryPage';
import SalaryProfilePage from '../pages/salarySkills/SalaryProfilePage';
import SalaryListPlanning from '../pages/Evaluations/planning/SalaryListPlanning';
import ListSalaryPage from '../pages/career/careerPlan/ListSalaryPage';
import CreationCareerPlan from '../pages/career/careerPlan/CreationCareerPlan';
import CareerProfilePage from '../pages/career/careerPlan/CareerProfilePage';
import EditAffectation from '../pages/career/careerPlan/EditAffectation';

function AppRouter() {
  return (
    <Routes>
      <Route path="/" element={<Template />} />
      {/*COMPETENCES */}
      <Route path="/competences" element={<ListSkillSalaryPage />} />
      <Route path="/competences/profil/:idEmployee" element={<SalaryProfilePage />} />
      <Route path="/login" element={<LoginPage />} />
      
      {/* EVALUATIONS */}
      <Route path="/salary-list" element={<SalaryList />} />
      <Route path="/notation" element={<Notation />} />
      <Route path="/planning" element={<SalaryListPlanning />} />

      {/*CARRIERE */}
      <Route path="/carriere" element={<ListSalaryPage />} />
      <Route path="/carriere/creation" element={<CreationCareerPlan />} />
      <Route path="/carriere/fiche" element={<CareerProfilePage />} />
      <Route path="/carriere/fiche/edit" element={<EditAffectation />} />

    </Routes>
  );
}

export default AppRouter;
