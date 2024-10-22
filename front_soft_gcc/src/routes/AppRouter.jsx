import React from 'react';
import { Route, Routes } from 'react-router-dom';
import Template from '../pages/Template';
import LoginPage from '../pages/LoginPage';
import Body from '../components/Body';
import SalaryList from '../pages/Evaluations/Notations/SalaryList';
import Notation from '../pages/Evaluations/Notations/Notation';
import SalaryListPlanning from '../pages/Evaluations/planning/SalaryListPlanning';


function AppRouter() {
  return (
    <Routes>
      <Route path="/" element={<Body />} />
      <Route path="/login" element={<LoginPage />} />
      {/* EVALUATIONS */}
      <Route path="/salary-list" element={<SalaryList />} />
      <Route path="/notation" element={<Notation />} />
      <Route path="/planning" element={<SalaryListPlanning />} />



    </Routes>
  );
}

export default AppRouter;
