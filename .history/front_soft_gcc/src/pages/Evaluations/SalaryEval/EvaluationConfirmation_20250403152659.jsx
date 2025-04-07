import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Container, Typography, Box, Paper, Button,
  CheckCircleIcon, HomeIcon
} from '@mui/material';
import { FaCheckCircle, FaHome } from 'react-icons/fa';
import { motion } from 'framer-motion';

const EvaluationConfirmation = () => {
  const navigate = useNavigate();

  return (
    <Container component="main" maxWidth="sm">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Paper elevation={3} sx={{ p: 4, mt: 8, textAlign: 'center' }}>
          <Box display="flex" justifyContent="center" mb={3}>
            <FaCheckCircle size={80} color="#4CAF50" />
          </Box>
          
          <Typography variant="h4" component="h1" gutterBottom>
            Évaluation Soumise avec Succès !
          </Typography>
          
          <Typography variant="body1" color="text.secondary" paragraph>
            Votre évaluation a été enregistrée avec succès. Nous vous remercions pour votre participation.
          </Typography>

          <Box mt={4}>
            <Button
              variant="contained"
              color="primary"
              startIcon={<FaHome />}
              onClick={() => navigate('/EvaluationLogin')}
              size="large"
            >
              Retour à la page de connexion
            </Button>
          </Box>
        </Paper>
      </motion.div>
    </Container>
  );
};

export default EvaluationConfirmation; 