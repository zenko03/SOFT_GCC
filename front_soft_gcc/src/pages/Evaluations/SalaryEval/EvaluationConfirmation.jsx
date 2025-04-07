import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Paper,
  Typography,
  Button,
  Box
} from '@mui/material';
import { motion } from 'framer-motion';
import {
  FaCheckCircle,
  FaArrowLeft
} from 'react-icons/fa';

const EvaluationConfirmation = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Vérifier si l'utilisateur a accès à cette page
    const token = localStorage.getItem('evaluationToken');
    if (!token) {
      navigate('/EvaluationLogin');
    }
  }, [navigate]);

  const handleBackToLogin = () => {
    navigate('/EvaluationLogin');
  };

  return (
    <Container maxWidth="sm">
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}
      >
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Paper
            elevation={3}
            sx={{
              p: 4,
              textAlign: 'center',
              borderRadius: 2,
              backgroundColor: '#ffffff'
            }}
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
            >
              <FaCheckCircle
                size={80}
                color="#4CAF50"
                style={{ marginBottom: '1rem' }}
              />
            </motion.div>

            <Typography
              variant="h4"
              component="h1"
              gutterBottom
              sx={{ color: '#2c3e50', fontWeight: 'bold' }}
            >
              Évaluation Soumise avec Succès !
            </Typography>

            <Typography
              variant="body1"
              sx={{ color: '#7f8c8d', mb: 3 }}
            >
              Merci d&apos;avoir participé à cette évaluation. Vos réponses ont été enregistrées avec succès.
            </Typography>

            <Box sx={{ mt: 4 }}>
              <Button
                variant="contained"
                color="primary"
                startIcon={<FaArrowLeft />}
                onClick={handleBackToLogin}
                sx={{ mr: 2 }}
              >
                Retour à la page de connexion
              </Button>
            </Box>
          </Paper>
        </motion.div>
      </Box>
    </Container>
  );
};

export default EvaluationConfirmation; 