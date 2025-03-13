import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { 
  Container, Typography, Box, Paper, Button, Stepper, 
  Step, StepLabel, Grid, Radio, RadioGroup, FormControlLabel, 
  FormControl, FormLabel, TextField, CircularProgress, Alert, 
  Divider, Card, CardContent, Chip
} from '@mui/material';
import { 
  FaUser, FaCalendarAlt, FaClipboardList, FaCheck, 
  FaArrowRight, FaArrowLeft, FaSave, FaPaperPlane, 
  FaExclamationTriangle, FaSpinner, FaStar, FaStarHalfAlt, 
  FaRegStar, FaBriefcase, FaBuilding, FaIdCard
} from 'react-icons/fa';
import { toast } from 'react-toastify';

const EvaluationPage = () => {
  const navigate = useNavigate();
  const [activeStep, setActiveStep] = useState(0);
  const [evaluationData, setEvaluationData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [answers, setAnswers] = useState({});
  const [overallFeedback, setOverallFeedback] = useState('');
  const [strengths, setStrengths] = useState('');
  const [weaknesses, setWeaknesses] = useState('');

  // Récupérer les données d'évaluation au chargement
  useEffect(() => {
    const token = localStorage.getItem('evaluationToken');
    const evaluationId = localStorage.getItem('evaluationId');

    if (!token || !evaluationId) {
      navigate('/evaluation-login');
      return;
    }

    const fetchEvaluation = async () => {
      try {
        const response = await axios.get(`https://localhost:7082/api/evaluation/${evaluationId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        setEvaluationData(response.data);
        
        // Initialiser les réponses avec des valeurs par défaut
        const initialAnswers = {};
        if (response.data.questions) {
          response.data.questions.forEach(question => {
            initialAnswers[question.questionId] = 0;
          });
        }
        setAnswers(initialAnswers);
        
      } catch (err) {
        console.error('Error fetching evaluation data:', err);
        setError('Impossible de charger les données d\'évaluation.');
      } finally {
        setLoading(false);
      }
    };

    fetchEvaluation();
  }, [navigate]);

  const handleNext = () => {
    // Vérifier si une réponse a été sélectionnée pour la question actuelle
    const currentQuestionId = evaluationData.questions[activeStep].questionId;
    if (answers[currentQuestionId] === 0) {
      toast.warning('Veuillez sélectionner une note pour cette question.');
      return;
    }
    
    setActiveStep((prevStep) => prevStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevStep) => prevStep - 1);
  };

  const handleAnswerChange = (questionId, value) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: parseInt(value)
    }));
  };

  const calculateAverageScore = () => {
    const scores = Object. keys(answers).map(questionId => answers[questionId]);
    return scores.length ? (scores.reduce((acc, curr) => acc + curr, 0) / scores.length).toFixed(2) : 0;
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    setError('');
    
    const token = localStorage.getItem('evaluationToken');
    const evaluationId = localStorage.getItem('evaluationId');
    
    if (!token || !evaluationId) {
      navigate('/evaluation-login');
      return;
    }
    
    try {
      const formattedAnswers = Object.keys(answers).map(questionId => ({
        questionId: parseInt(questionId),
        score: answers[questionId],
      }));
      
      const averageScore = calculateAverageScore();

      const response = await axios.post(`https://localhost:7082/api/evaluation/${evaluationId}/submit`, {
        answers: formattedAnswers,
        overallFeedback,
        strengths,
        weaknesses,
        averageScore
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data.success) {
        toast.success('Évaluation soumise avec succès!');
        navigate('/home');
      } else {
        setError('Erreur lors de la soumission de l\'évaluation. Veuillez réessayer.');
      }
    } catch (err) {
      console.error('Error submitting evaluation:', err);
      setError('Une erreur est survenue lors de la soumission.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <Container>
        <CircularProgress />
      </Container>
    );
  }

  if (error) {
    return (
      <Container>
        <Alert severity="error">{error}</Alert>
      </Container>
    );
  }

  return (
    <Container component="main" maxWidth="md">
      <Paper elevation={3} style={{ padding: '20px' }}>
        <Typography variant="h4" gutterBottom>
          Évaluation : {evaluationData.title}
        </Typography>
        <Card variant="outlined" style={{ marginBottom: '20px' }}>
          <CardContent>
            <Typography variant="h6"><FaIdCard /> Nom : {evaluationData.employeeName}</Typography>
            <Typography variant="h6"><FaBriefcase /> Poste : {evaluationData.position}</Typography>
            <Typography variant="h6"><FaBuilding /> Département : {evaluationData.department}</Typography>
          </CardContent>
        </Card>
        <Stepper activeStep={activeStep}>
          {evaluationData.questions.map((question, index) => (
            <Step key={index}>
              <StepLabel>{`Question ${index + 1}`}</StepLabel>
            </Step>
          ))}
        </Stepper>
        <Box mt={2}>
          {activeStep < evaluationData.questions.length ? (
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <Typography variant="h6">{evaluationData.questions[activeStep].text}</Typography>
              </Grid>
              <Grid item xs={12}>
                <FormControl component="fieldset">
                  <FormLabel component="legend">Choisissez une note</FormLabel>
                  <RadioGroup
                    value={answers[evaluationData.questions[activeStep].questionId] || 0}
                    onChange={(e) => handleAnswerChange(evaluationData.questions[activeStep].questionId, e.target.value)}
                  >
                    {[1, 2, 3, 4, 5].map((score) => (
                      <FormControlLabel key={score} value={score} control={<Radio />} label={score} />
                    ))}
                  </RadioGroup>
                </FormControl>
              </Grid>
            </Grid>
          ) : (
            <Box>
              <TextField
                label="Commentaires généraux"
                variant="outlined"
                fullWidth
                multiline
                rows={4}
                value={overallFeedback}
                onChange={(e) => setOverallFeedback(e.target.value)}
              />
              <TextField
                label="Forces"
                variant="outlined"
                fullWidth
                multiline
                rows={2}
                value={strengths}
                onChange={(e) => setStrengths(e.target.value)}
              />
              <TextField
                label="Faiblesses"
                variant="outlined"
                fullWidth
                multiline
                rows={2}
                value={weaknesses}
                onChange={(e) => setWeaknesses(e.target.value)}
              />
            </Box>
          )}
        </Box>
        <Box mt={2}>
          <Button
            variant="contained"
            color="primary"
            onClick={activeStep < evaluationData.questions.length - 1 ? handleNext : handleSubmit}
            disabled={submitting}
            startIcon={submitting ? <FaSpinner className="spinner" /> : activeStep < evaluationData.questions.length - 1 ? <FaArrowRight /> : <FaPaperPlane />}
          >
            {activeStep < evaluationData.questions.length - 1 ? 'Suivant' : 'Soumettre'}
          </Button>
          {activeStep > 0 && (
            <Button variant="outlined" onClick={handleBack} startIcon={<FaArrowLeft />} style={{ marginLeft: '16px' }}>
              Précédent
            </Button>
          )}
        </Box>
      </Paper>
    </Container>
  );
};

export default EvaluationPage;