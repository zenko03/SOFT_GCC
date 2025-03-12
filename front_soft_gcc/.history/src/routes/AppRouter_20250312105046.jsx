import React from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
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
import EvaluationInterviews from '../pages/Evaluations/EvaluationInterview/EvaluationInterviews'; // Gardez cette ligne
import RetirementPage from '../pages/retirement/RetirementPage';
import FollowedWishEvolution from '../pages/wishEvolution/FollowedWishEvolution';
import DetailsWishEvolution from '../pages/wishEvolution/DetailsWishEvolution';
import AddWishEvolution from '../pages/wishEvolution/addWishEvolution';
import EditWishEvolution from '../pages/wishEvolution/EditWishEvolution';
import Login from '../pages/Authentification/Login';
import Register from '../pages/Authentification/Register';
import DashboardPage from '../pages/dashboardStatistics/DashboardPage';
import EmployeeOrgChart from '../pages/OrganizationalChart/EmployeeOrgChart';
import DepartmentEffective from '../pages/OrganizationalChart/DepartmentEffective';
import DetailDepartment from '../pages/OrganizationalChart/DetailsDepartment';
import CsvUploader from '../pages/OrganizationalChart/CsvUploader';
import HistoryPage from '../pages/salarySkills/HistoryPage';
import SettingSkillPage from '../pages/settings/SettingSkillPage';
import SettingCareerPage from '../pages/settings/SettingsCareerPage';
import CrudPage from '../pages/settings/CrudPage';
import DegreeCrudPage from '../pages/settings/skills/DegreeCrudPage';
import DepartmentCrudPage from '../pages/settings/skills/DepartmentCrudPage';
import DomainCrudPage from '../pages/settings/skills/DomainCrudPage';
import LanguageCrudPage from '../pages/settings/skills/LanguageCrudPage';
import SchoolCrudPage from '../pages/settings/skills/SchoolCrudPage';
import SkillCrudPage from '../pages/settings/skills/SkillCrudPage';
import StudyPathCrudPage from '../pages/settings/skills/StudyPathCrudPage';
import AssignmentTypeCrudPage from '../pages/settings/career/AssignmentTypeCrudPage';
import CertificateTypeCrudPage from '../pages/settings/career/CertificateTypeCrudPage';
import EchelonCrudPage from '../pages/settings/career/EchelonCrudPage';
import EmployeeTypeCrudPage from '../pages/settings/career/EmployeeTypeCrudPage';
import EstablishmentCrudPage from '../pages/settings/career/EstablishmentCrudPage';
import FonctionCrudPage from '../pages/settings/career/FonctionCrudPage';
import IndicationCrudPage from '../pages/settings/career/IndicationCrudPage';
import LegalClassCrudPage from '../pages/settings/career/LegalClassCrudPage';
import NewsLetterTemplateCrudPage from '../pages/settings/career/NewsLetterTemplateCrudPage';
import PaymentMethodCrudPage from '../pages/settings/career/PaymentMethodCrudPage';
import PositionCrudPage from '../pages/settings/career/PositionCrudPage';
import ProfessionalCategoryCrudPage from '../pages/settings/career/ProfessionalCategoryCrudPage';
import SocioCategoryProfessionalCrudPage from '../pages/settings/career/SocioCategoryProfessionalCrudPage';
import UploadImage from '../pages/settings/UploadImage';
import CreateEmployeePage from '../pages/settings/employeeManagement/CreateEmployeePage';
import ListEmployeePage from '../pages/settings/employeeManagement/ListEmployeePage';
import EvaluationInterviewHome from '../pages/Evaluations/EvaluationInterview/EvaluationInterviewHome';
import ProtectedRoute from '../pages/Authentification/ProtectedRoute';
import { useNavigate } from "react-router-dom";
import Evaluations from '../pages/settings/evaluations/Evaluations';
import QuestionEvaluation from '../pages/settings/evaluations/Questionnaires/QuestionEvaluation';
import FormationSuggestions from '../pages/settings/evaluations/FormationSuggestion/FormationSuggestions';
import EvaluationLogin from '../pages/Evaluations/SalaryEval/EvaluationLogin';

function AppRouter() {
  return (
    <Routes>
      {/* Authentification */}
      <Route path="/Register" element={<Register />} />
      <Route path="/login" element={<Login />} />

      {/*COMPETENCES */}
      <Route path="/competences" element={<ListSkillSalaryPage />} />
      <Route path="/competences/profil/:idEmployee" element={<SalaryProfilePage />} />
      
      {/* EVALUATIONS */}
      <Route path="/salary-list" element={<SalaryList />} />
      <Route path="/notation" element={<Notation />} />
      <Route path="/planning" element={<SalaryListPlanning />} />
      <Route path="/history" element={<EvalHistory />} />
      <Route path="/validation" element={<EvaluationInterviews />} />

      {/*CARRIERE */}
      <Route path="/carriere" element={<ListSalaryPage />} />
      <Route path="/carriere/creation" element={<CreationCareerPlan />} />
      <Route path="/carriere/fiche/:registrationNumber" element={<CareerProfilePage />} />
      <Route path="/carriere/fiche/edit/:CareerPlanId" element={<EditAffectation />} />
      <Route path="/carriere/fiche/detail/:CareerPlanId" element={<DetailAssignment />} />
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
        <Route path="/EvaluationSettings" element={<Evaluations />} />

        <Route path="/EvaluationQuestionSettings" element={<QuestionEvaluation />} />
        <Route path="/EvaluationFormationSettings" element={<FormationSuggestions />} />

        <Route path="/EvaluationLogin" element={<EvaluationLogin />} />





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

      {/*Souhait evolution */}
      <Route path="/softGcc/souhaitEvolution/ajouter" element={<AddWishEvolution />} />
      <Route path="/softGcc/souhaitEvolution/suivi" element={<FollowedWishEvolution />} />
      <Route path="/softGcc/souhaitEvolution/details/:WishEvolutionId" element={<DetailsWishEvolution />} />
      <Route path="/softGcc/souhaitEvolution/edit/:WishEvolutionId" element={<EditWishEvolution />} />

      {/*Tableau de bord et statistique */}
      <Route path="/softGcc/tableauBord" element={<DashboardPage />} />

      {/*Organigramme */}
      <Route path="/softGcc/effectif" element={<DepartmentEffective />} />
      <Route path="/softGcc/organigramme" element={<EmployeeOrgChart />} />
      <Route path="/softGcc/effectif/details/:DepartmentId" element={<DetailDepartment />} />
      <Route path="/softGcc/effectif/importEmploye" element={<CsvUploader />} />

      {/*Historiques d'activites */}
      <Route path="/softGcc/activityHistory" element={<HistoryPage />} />

      {/*Parametre des entites */}
      <Route path="/softGcc/settings/competence" element={<SettingSkillPage />} />
      <Route path="/softGcc/settings/carriere" element={<SettingCareerPage />} />
      <Route path="/softGcc/settings/competence/Crud" element={<CrudPage />} />
      <Route path="/softGcc/settings/competence/niveau" element={<DegreeCrudPage />} />
      <Route path="/softGcc/settings/competence/departement" element={<DepartmentCrudPage />} />
      <Route path="/softGcc/settings/competence/domaine" element={<DomainCrudPage />} />
      <Route path="/softGcc/settings/competence/language" element={<LanguageCrudPage />} />
      <Route path="/softGcc/settings/competence/ecole" element={<SchoolCrudPage />} />
      <Route path="/softGcc/settings/competence/competence" element={<SkillCrudPage />} />
      <Route path="/softGcc/settings/competence/filiere" element={<StudyPathCrudPage />} />
      <Route path="/softGcc/settings/carriere/typeAffectation" element={<AssignmentTypeCrudPage />} />
      <Route path="/softGcc/settings/carriere/typeCertificat" element={<CertificateTypeCrudPage />} />
      <Route path="/softGcc/settings/carriere/echelon" element={<EchelonCrudPage />} />
      <Route path="/softGcc/settings/carriere/typeEmploye" element={<EmployeeTypeCrudPage />} />
      <Route path="/softGcc/settings/carriere/etablissement" element={<EstablishmentCrudPage />} />
      <Route path="/softGcc/settings/carriere/fonction" element={<FonctionCrudPage />} />
      <Route path="/softGcc/settings/carriere/indication" element={<IndicationCrudPage />} />
      <Route path="/softGcc/settings/carriere/classeLegale" element={<LegalClassCrudPage />} />
      <Route path="/softGcc/settings/carriere/bulletin" element={<NewsLetterTemplateCrudPage />} />
      <Route path="/softGcc/settings/carriere/methodePaiement" element={<PaymentMethodCrudPage />} />
      <Route path="/softGcc/settings/carriere/poste" element={<PositionCrudPage />} />
      <Route path="/softGcc/settings/carriere/categorieProfessionnelle" element={<ProfessionalCategoryCrudPage />} />
      <Route path="/softGcc/settings/carriere/categorieSocioProfessionnelle" element={<SocioCategoryProfessionalCrudPage />} />
      <Route path="/softGcc/settings/employeeManagement/create" element={<CreateEmployeePage />} />
      <Route path="/softGcc/settings/employeeManagement/liste" element={<ListEmployeePage />} />
    </Routes>
  );
}

export default AppRouter;