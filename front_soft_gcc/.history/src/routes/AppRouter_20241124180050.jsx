import React from 'react';
import { Route, Routes } from 'react-router-dom';
import Template from '../pages/Template';
import LoginPage from '../pages/LoginPage';
import SalaryList from '../pages/Evaluations/Notations/SalaryList';
import Notation from '../pages/Evaluations/Notations/Notation';
import ListSkillSalaryPage from '../pages/salarySkills/ListSkillSalaryPage';
import SalaryProfilePage from '../pages/salarySkills/SalaryProfilePage';
import SalaryListPlanning from '../pages/Evaluations/planning/SalaryListPlanning';
import EvalHistory from '../pages/Evaluations/History/EvalHistory.jsx';


function AppRouter() {
  return (
    <Routes>
      <Route path="/" element={<Template />} />
      <Route path="/competences" element={<ListSkillSalaryPage />} />
      <Route path="/competences/profil/:idEmployee" element={<SalaryProfilePage />} />
      <Route path="/login" element={<LoginPage />} />
      {/* EVALUATIONS */}
      <Route path="/salary-list" element={<SalaryList />} />
      <Route path="/notation" element={<Notation />} />
      <Route path="/planning" element={<SalaryListPlanning />} />
      <Route path="/history" element={<EvalHistory />} />




    </Routes>
  );
}

export default AppRouter;
