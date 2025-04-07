import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { 
  Container, Typography, Box, Paper, Button, Stepper, 
  Step, StepLabel, Grid, Radio, RadioGroup, FormControlLabel, 
  TextField, CircularProgress, Alert, Card, CardContent, 
  AppBar, Toolbar, LinearProgress
} from '@mui/material';
import { 
  FaArrowRight, FaArrowLeft, FaPaperPlane, 
  FaSpinner, FaBriefcase, FaBuilding, 
  FaIdCard, FaSignOutAlt, FaClock, FaCheckCircle, 
  FaTimesCircle
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
  const [timeSpent, setTimeSpent] = useState({});
  const [startTime, setStartTime] = useState(null);
  const [progress, setProgress] = useState(0);
  const [questionOptions, setQuestionOptions] = useState({});
  const [timeRemaining, setTimeRemaining] = useState(null);
  const [autoSaveInterval, setAutoSaveInterval] = useState(null);

  // Fonction de déconnexion
  const handleLogout = () => {
    localStorage.removeItem('evaluationToken');
    localStorage.removeItem('evaluationId');
    toast.info('Vous avez été déconnecté.');
    navigate('/EvaluationLogin');
  };

  // Gestion du temps
  useEffect(() => {
    if (evaluationData && activeStep < evaluationData.questions.length) {
      const timerStartTime = new Date();
      setStartTime(timerStartTime);
      
      const timer = setInterval(() => {
        const currentTime = new Date();
        const timeDiff = Math.floor((currentTime - timerStartTime) / 1000);
        setTimeSpent(prev => ({
          ...prev,
          [evaluationData.questions[activeStep].questionId]: timeDiff
        }));
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [activeStep, evaluationData]);

  // Calcul de la progression
  useEffect(() => {
    if (evaluationData && evaluationData.questions) {
      const totalQuestions = evaluationData.questions.length;
      const answeredQuestions = Object.keys(answers).length;
      setProgress((answeredQuestions / totalQuestions) * 100);
    }
  }, [answers, evaluationData]);

  // Ajouter la fonction pour récupérer les options des questions
  const fetchQuestionOptions = async (evaluationId) => {
    try {
      const response = await axios.get(`https://localhost:7082/api/evaluation/${evaluationId}/options`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('evaluationToken')}` }
      });
      setQuestionOptions(response.data);
    } catch (error) {
      console.error('Erreur lors de la récupération des options:', error);
    }
  };

  // Ajouter la fonction pour la sauvegarde automatique
  const setupAutoSave = (evaluationId) => {
    const interval = setInterval(async () => {
      try {
        await axios.post(`https://localhost:7082/api/evaluation/${evaluationId}/save-progress`, {
          answers,
          timeSpent,
          currentStep: activeStep
        }, {
          headers: { Authorization: `Bearer ${localStorage.getItem('evaluationToken')}` }
        });
      } catch (error) {
        console.error('Erreur lors de la sauvegarde automatique:', error);
      }
    }, 30000); // Sauvegarde toutes les 30 secondes

    setAutoSaveInterval(interval);
  };

  // Modifier le useEffect pour récupérer les options et le temps restant
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
        
        // Récupérer les options des questions
        await fetchQuestionOptions(evaluationId);
        
        // Récupérer le temps restant
        const timeResponse = await axios.get(`https://localhost:7082/api/evaluation/${evaluationId}/time-remaining`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setTimeRemaining(timeResponse.data);

        // Initialiser les réponses
        const initialAnswers = {};
        if (response.data.questions && response.data.questions.length > 0) {
          response.data.questions.forEach(question => {
            switch (question.responseType) {
              case 'SCORE':
                initialAnswers[question.questionId] = 0;
                break;
              case 'QCM':
                initialAnswers[question.questionId] = [];
                break;
              case 'TEXT':
                initialAnswers[question.questionId] = '';
                break;
              default:
                initialAnswers[question.questionId] = 0;
            }
          });
          setAnswers(initialAnswers);
        }

        // Configurer la sauvegarde automatique
        setupAutoSave(evaluationId);
        
      } catch (err) {
        console.error('Error fetching evaluation data:', err);
        setError('Impossible de charger les données d\'évaluation.');
      } finally {
        setLoading(false);
      }
    };

    fetchEvaluation();

    // Nettoyer l'intervalle de sauvegarde automatique
    return () => {
      if (autoSaveInterval) {
        clearInterval(autoSaveInterval);
      }
    };
  }, [navigate]);

  const handleNext = () => {
    if (evaluationData.questions && evaluationData.questions.length > 0) {
      const currentQuestion = evaluationData.questions[activeStep];
      const currentAnswer = answers[currentQuestion.questionId];

      // Validation selon le type de question
      switch (currentQuestion.responseType) {
        case 'SCORE':
          if (currentAnswer === 0) {
            toast.warning('Veuillez sélectionner une note pour cette question.');
            return;
          }
          break;
        case 'QCM':
          if (!currentAnswer || currentAnswer.length === 0) {
            toast.warning('Veuillez sélectionner au moins une réponse.');
            return;
          }
          break;
        case 'TEXT':
          if (!currentAnswer || currentAnswer.trim() === '') {
            toast.warning('Veuillez répondre à la question.');
            return;
          }
          break;
      }
    }
    
    setActiveStep((prevStep) => prevStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevStep) => prevStep - 1);
  };

  const handleAnswerChange = (questionId, value, type) => {
    setAnswers(prev => {
      if (type === 'QCM') {
        const currentAnswers = prev[questionId] || [];
        const newAnswers = currentAnswers.includes(value)
          ? currentAnswers.filter(v => v !== value)
          : [...currentAnswers, value];
        return { ...prev, [questionId]: newAnswers };
      }
      return { ...prev, [questionId]: value };
    });
  };

  const calculateAverageScore = () => {
    const scores = Object.entries(answers)
      .filter(([questionId]) => {
        const question = evaluationData.questions.find(q => q.questionId === parseInt(questionId));
        return question && question.responseType === 'SCORE';
      })
      .map(([, value]) => value);
    
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
      const responses = Object.entries(answers).map(([questionId, value]) => {
        const question = evaluationData.questions.find(q => q.questionId === parseInt(questionId));
        return {
          questionId: parseInt(questionId),
          responseType: question.responseType,
          responseValue: JSON.stringify(value),
          timeSpent: timeSpent[questionId] || 0,
          startTime: startTime,
          endTime: new Date()
        };
      });
      
      const averageScore = calculateAverageScore();

      const response = await axios.post(`https://localhost:7082/api/evaluation/${evaluationId}/submit`, {
        responses,
        overallFeedback,
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

  const renderQuestionInput = (question) => {
    const currentAnswer = answers[question.questionId] || '';

    switch (question.responseType) {
      case 'QCM':
        return (
          <RadioGroup
            value={currentAnswer}
            onChange={(e) => handleAnswerChange(question.questionId, e.target.value)}
          >
            {questionOptions[question.questionId]?.map((option) => (
              <FormControlLabel
                key={option.optionId}
                value={option.optionId.toString()}
                control={<Radio />}
                label={option.optionText}
              />
            ))}
          </RadioGroup>
        );
      case 'TEXT':
        return (
          <TextField
            fullWidth
            multiline
            rows={4}
            variant="outlined"
            value={currentAnswer}
            onChange={(e) => handleAnswerChange(question.questionId, e.target.value)}
            placeholder="Veuillez répondre à la question..."
          />
        );
      default:
        return (
          <TextField
            fullWidth
            multiline
            rows={4}
            variant="outlined"
            value={currentAnswer}
            onChange={(e) => handleAnswerChange(question.questionId, e.target.value)}
            placeholder="Veuillez répondre à la question..."
          />
        );
    }
  };

  // Ajouter un composant pour afficher le temps restant
  const TimeRemainingDisplay = () => {
    if (!timeRemaining) return null;

    const hours = Math.floor(timeRemaining / 3600);
    const minutes = Math.floor((timeRemaining % 3600) / 60);
    const seconds = timeRemaining % 60;

    return (
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <FaClock />
        <Typography variant="body1">
          Temps restant : {hours}h {minutes}m {seconds}s
        </Typography>
      </Box>
    );
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
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" sx={{ flexGrow: 1 }}>
            Évaluation en Cours
          </Typography>
          <TimeRemainingDisplay />
          <Button color="inherit" onClick={handleLogout} startIcon={<FaSignOutAlt />}>
            Déconnexion
          </Button>
        </Toolbar>
      </AppBar>

      <Paper elevation={3} style={{ padding: '20px', marginTop: '20px' }}>
        <LinearProgress variant="determinate" value={progress} sx={{ mb: 3 }} />
        
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

        <Stepper activeStep={activeStep} alternativeLabel>
          {evaluationData.questions.map((question, index) => (
            <Step key={index}>
              <StepLabel>
                {answers[question.questionId] ? <FaCheckCircle color="green" /> : <FaTimesCircle color="red" />}
                {`Question ${index + 1}`}
              </StepLabel>
            </Step>
          ))}
        </Stepper>

        <Box mt={2}>
          {activeStep < evaluationData.questions.length ? (
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <Typography variant="h6" gutterBottom>
                  {evaluationData.questions[activeStep].text}
                </Typography>
                {renderQuestionInput(evaluationData.questions[activeStep])}
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
            </Box>
          )}
        </Box>

        <Box mt={2} sx={{ display: 'flex', justifyContent: 'space-between' }}>
          <Button
            variant="outlined"
            onClick={handleBack}
            startIcon={<FaArrowLeft />}
            disabled={activeStep === 0}
          >
            Précédent
          </Button>
          <Button
            variant="contained"
            color="primary"
            onClick={activeStep < evaluationData.questions.length - 1 ? handleNext : handleSubmit}
            disabled={submitting}
            startIcon={submitting ? <FaSpinner className="spinner" /> : activeStep < evaluationData.questions.length - 1 ? <FaArrowRight /> : <FaPaperPlane />}
          >
            {activeStep < evaluationData.questions.length - 1 ? 'Suivant' : 'Soumettre'}
          </Button>
        </Box>
      </Paper>
    </Container>
  );
};

export default EvaluationPage;