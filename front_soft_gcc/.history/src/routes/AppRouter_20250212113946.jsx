import React from 'react';
import { Route, Routes } from 'react-router-dom';
import Template from '../pages/Template';
import SalaryList from '../pages/Evaluations/Notations/SalaryList';
import Notation from '../pages/Evaluations/Notations/Notation';
import ListSkillSalaryPage from '../pages/salarySkills/ListSkillSalaryPage';
import SalaryProfilePage from '../pages/salarySkills/SalaryProfilePage';
import SalaryListPlanning from '../pages/Evaluations/planning/SalaryListPlanning';
import ListSalaryPage from '../pages/career/careerPlan/ListCareerPage';
import CreationCareerPlan from '../pages/career/careerPlan/CreationCareerPlan';
import CareerProfilePage from '../pages/career/careerPlan/CareerProfilePage';
import EditAffectation from '../pages/career/careerPlan/EditAffectation';
import DetailAssignment from '../pages/career/careerPlan/DetailAssignment';
import EvalHistory from '../pages/Evaluations/History/EvalHistory';
import EvaluationInterviews from '../pages/Evaluations/EvaluationInterview/EvaluationInterviews';
import RetirementPage from '../pages/retirement/retirementPage';
import Login from '../pages/Authentification/Login';
import Register from '../pages/Authentification/Register';
import EvaluationInterviewHome from '../pages/Evaluations/EvaluationInterview/EvaluationInterviewHome';
import ProtectedRoute from '../pages/Authentification/ProtectedRoute';
import { useNavigate } from "react-router-dom";



function AppRouter() {
  return (
    <Routes>
      {/* Authentification */}
      <Route path="/Register" element={<Register />} />
      <Route path="/login" element={<Login />} />

      <Route element={<ProtectedRoute />}>
        {/*COMPETENCES */}
        <Route path="/competences" element={<ListSkillSalaryPage />} />
        <Route path="/competences/profil/:idEmployee" element={<SalaryProfilePage />} />

        {/* EVALUATIONS */}
        <Route path="/salary-list" element={<SalaryList />} />
        <Route path="/notation" element={<Notation />} />
        <Route path="/planning" element={<SalaryListPlanning />} />
        <Route path="/history" element={<EvalHistory />} />
        <Route path="/validation" element={<EvaluationInterviews />} />
        <Route path="/homeInterview" element={<EvaluationInterviewHome />} />






        {/*CARRIERE */}
        <Route path="/carriere" element={<ListSalaryPage />} />
        <Route path="/carriere/creation" element={<CreationCareerPlan />} />
        <Route path="/carriere/fiche/:registrationNumber" element={<CareerProfilePage />} />
        <Route path="/carriere/fiche/edit/:CareerPlanId" element={<EditAffectation />} />
        <Route path="/carriere/fiche/detail/:CareerPlanId" element={<DetailAssignment />} />

        {/*Gestion retraite */}
        <Route path="/retraite" element={<RetirementPage />} />
      </Route>
      <Route path="*" element={<Navigate to="/login" replace />} />



    </Routes>
  );
}

export default AppRouter;
