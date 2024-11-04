import React from 'react';
import { Route, Routes } from 'react-router-dom';
import Template from '../pages/Template';
import LoginPage from '../pages/LoginPage';
import Body from '../components/Body';
import SalaryList from '../pages/Evaluations/Notations/SalaryList';
import Notation from '../pages/Evaluations/Notations/Notation';
import ListSkillSalaryPage from '../pages/salarySkills/ListSkillSalaryPage';
import SalaryProfilePage from '../pages/salarySkills/SalaryProfilePage';

function AppRouter() {
  return (
    <Routes>
      <Route path="/" element={<Body />} />
      <Route path="/" element={<Template />} />
      <Route path="/competences" element={<ListSkillSalaryPage />} />
      <Route path="/competences/profil/:idEmployee" element={<SalaryProfilePage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/salary-list" element={<SalaryList />} />
      <Route path="/notation" element={<Notation />} />


    </Routes>
  );
}

export default AppRouter;
