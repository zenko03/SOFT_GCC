import React from 'react';
import { Route, Routes } from 'react-router-dom';
import Template from '../pages/Template';
import LoginPage from '../pages/LoginPage';

function AppRouter() {
  return (
    <Routes>
      <Route path="/" element={<Template />} />
      <Route path="/login" element={<LoginPage />} />
    </Routes>
  );
}

export default AppRouter;
