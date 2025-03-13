import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import { 
  Card, TextField, Button, Typography, Box, CircularProgress, 
  Alert, Paper, Container, Grid, Divider, FormHelperText 
} from '@mui/material';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import { motion } from 'framer-motion';

const EvaluationLogin = () => {
  const [tempLogin, setTempLogin] = useState('');
  const [tempPassword, setTempPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showExpirationWarning, setShowExpirationWarning] = useState(false);
  const navigate = useNavigate();

  // Vérifier si l'utilisateur est déjà connecté
  useEffect(() => {
    const token = localStorage.getItem('evaluationToken');
    const evaluationId = localStorage.getItem('evaluationId');
    
    if (token && evaluationId) {
      // Vérifier si le token est toujours valide
      axios.get(`https://localhost:7082/api/evaluation/validate-token`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      .then(response => {
        if (response.data.valid) {
          navigate('/employee-evaluation');
        } else {
          // Token expiré, supprimer du localStorage
          localStorage.removeItem('evaluationToken');
          localStorage.removeItem('evaluationId');
        }
      })
      .catch(err => {
        localStorage.removeItem('evaluationToken');
        localStorage.removeItem('evaluationId');
        console.error('Token validation error:', err);
      });
    }
  }, [navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Récupérer l'adresse IP pour le suivi de sécurité
      const ipResponse = await axios.get('https://api.ipify.org?format=json');
      const ipAddress = ipResponse.data.ip;

      const response = await axios.post('https://localhost:7082/api/EvaluationLogin/login', {
        tempLogin,
        tempPassword,
        ipAddress
      });

      if (response.data.success) {
        // Stocker le token et l'ID d'évaluation
        localStorage.setItem('evaluationToken', response.data.token);
        localStorage.setItem('evaluationId', response.data.evaluationId);
        
        toast.success('Connexion réussie! Redirection vers votre évaluation...');
        navigate('/employee-evaluation');
      } 
    } catch (err) {
      console.error('Login error:', err);
      
      if (err.response) {
        // Gestion des différents types d'erreurs
        switch (err.response.status) {
          case 401:
            setError('Identifiants invalides. Veuillez vérifier votre login et mot de passe.');
            break;
          case 403:
            setError(err.response.data.message || 'Votre évaluation n\'est pas encore disponible.');
            setShowExpirationWarning(true);
            break;
          case 404:
            setError('Évaluation non trouvée. Veuillez contacter votre administrateur.');
            break;
          default:
            setError('Une erreur est survenue lors de la connexion.');
        }
      } else {
        setError('Problème de connexion au serveur. Veuillez réessayer plus tard.');
      }
    } finally {
      setLoading(false);
    }
   };

  return (
    <Container component="main" maxWidth="xs">
      <Paper elevation={3} style={{ padding: '20px' }}>
        <Box display="flex" flexDirection="column" alignItems="center">
          <LockOutlinedIcon fontSize="large" />
          <Typography component="h1" variant="h5">
            Connexion à l'évaluation
          </Typography>
          <form onSubmit={handleSubmit} style={{ width: '100%', marginTop: '8px' }}>
            <TextField
              variant="outlined"
              margin="normal"
              required
              fullWidth
              label="Login temporaire"
              value={tempLogin}
              onChange={(e) => setTempLogin(e.target.value)}
            />
            <TextField
              variant="outlined"
              margin="normal"
              required
              fullWidth
              label="Mot de passe temporaire"
              type="password"
              value={tempPassword}
              onChange={(e) => setTempPassword(e.target.value)}
            />
            {error && <Alert severity="error">{error}</Alert>}
            {showExpirationWarning && (
              <Alert severity="warning">
                Attention : Votre évaluation pourrait être expirée ou non disponible.
              </Alert>
            )}
            <Button
              type="submit"
              fullWidth
              variant="contained"
              color="primary"
              disabled={loading}
              style={{ marginTop: '16px' }}
            >
              {loading ? <CircularProgress size={24} /> : 'Se connecter'}
            </Button>
          </form>
        </Box>
      </Paper>
    </Container>
  );
};

export default EvaluationLogin;