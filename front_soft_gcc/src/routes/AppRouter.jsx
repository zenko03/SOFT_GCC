import React from 'react';
import { Route, Routes } from 'react-router-dom';
import Template from '../pages/Template';
import LoginPage from '../pages/LoginPage';
import ListSkillSalaryPage from '../pages/salarySkills/ListSkillSalaryPage';
import SalaryProfilePage from '../pages/salarySkills/SalaryProfilePage';

function AppRouter() {
  return (
    <Routes>
      <Route path="/" element={<Template />} />
      <Route path="/competences" element={<ListSkillSalaryPage />} />
      <Route path="/competences/profil/:idEmployee" element={<SalaryProfilePage />} />
      <Route path="/login" element={<LoginPage />} />
    </Routes>
  );
}

export default AppRouter;
