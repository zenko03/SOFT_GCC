import React from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import AppRouter from './routes/AppRouter';
import { UserProvider } from './pages/Evaluations/EvaluationInterview/UserContext'; // Importez le contexte utilisateur
import './styles/main.css';

function App() {
  return (
    <UserProvider>
      <Router>
        <AppRouter />
      </Router>
    </UserProvider>
  );
}

export default App;
