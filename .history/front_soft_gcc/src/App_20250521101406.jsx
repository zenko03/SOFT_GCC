import { BrowserRouter as Router } from 'react-router-dom';
import AppRouter from './routes/AppRouter';
import { UserProvider } from './pages/Evaluations/EvaluationInterview/UserContext';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './styles/main.css';

function App() {
  return (
    <UserProvider>
      <Router>
        <AppRouter />
        <ToastContainer /> {/* Ajoutez ce composant */}
      </Router>
    </UserProvider>
  );
}

export default App;
