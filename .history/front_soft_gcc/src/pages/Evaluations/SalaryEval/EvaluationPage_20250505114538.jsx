import { useState, useEffect } from 'react';
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
  const [autoSaveInterval, setAutoSaveInterval] = useState(null);
  const [questionTimers, setQuestionTimers] = useState({});
  const [questionTimeRemaining, setQuestionTimeRemaining] = useState({});

  // Fonction pour vérifier si le token est expiré
  const isTokenExpired = (token) => {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const expirationTime = payload.exp * 1000; // Convertir en millisecondes
      return Date.now() >= expirationTime;
    } catch (error) {
      console.error('Erreur lors de la vérification de l\'expiration du token:', error);
      return true; // En cas d'erreur, considérer le token comme expiré
    }
  };

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
    if (evaluationData && evaluationData.questions && evaluationData.questions.length > 0) {
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

  // Fonction pour extraire l'ID de l'utilisateur du token JWT
  const getUserIdFromToken = (token) => {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.sub; // L'ID de l'utilisateur est stocké dans la propriété 'sub' du token
    } catch (error) {
      console.error('Erreur lors de l\'extraction de l\'ID utilisateur du token:', error);
      return null;
    }
  };

  // Ajouter la fonction pour la sauvegarde automatique
  // Amélioration de la fonction setupAutoSave
  const setupAutoSave = (evaluationId) => {
    const interval = setInterval(async () => {
      try {
        const token = localStorage.getItem('evaluationToken');
        const userId = getUserIdFromToken(token);

        if (!userId) {
          console.error('Impossible de récupérer l\'ID de l\'utilisateur');
          return;
        }

        const totalQuestions = evaluationData && evaluationData.questions ? evaluationData.questions.length : 0;
        const answeredQuestions = Object.keys(answers).filter(key => answers[key] !== undefined && answers[key] !== '').length;
        const progressPercentage = totalQuestions > 0 ? (answeredQuestions / totalQuestions) * 100 : 0;

        await axios.post(`https://localhost:7082/api/evaluation/${evaluationId}/save-progress`, {
          userId: parseInt(userId),
          totalQuestions,
          answeredQuestions,
          progressPercentage
        }, {
          headers: { Authorization: `Bearer ${token}` }
        });
      } catch (error) {
        console.error('Erreur lors de la sauvegarde automatique:', error);
        toast.error('Erreur lors de la sauvegarde automatique de la progression.');
      }
    }, 30000); // Sauvegarde toutes les 30 secondes

    setAutoSaveInterval(interval);
  };

  // Ajouter cette fonction pour initialiser le timer d'une question
  const initializeQuestionTimer = (questionId, maxTimeInMinutes) => {
    const timeInSeconds = maxTimeInMinutes * 60;
    setQuestionTimers(prev => ({
      ...prev,
      [questionId]: timeInSeconds
    }));
    setQuestionTimeRemaining(prev => ({
      ...prev,
      [questionId]: timeInSeconds
    }));
  };

  // Modifier le useEffect pour gérer le timer par question
  useEffect(() => {
    if (evaluationData && evaluationData.questions && activeStep < evaluationData.questions.length) {
      const currentQuestion = evaluationData.questions[activeStep];
      const timerStartTime = new Date();
      setStartTime(timerStartTime);

      // Initialiser le timer pour la question courante si ce n'est pas déjà fait
      if (!questionTimers[currentQuestion.questionId]) {
        initializeQuestionTimer(currentQuestion.questionId, currentQuestion.maxTimeInMinutes || 30);
      }

      const timer = setInterval(() => {
        const currentTime = new Date();
        const timeDiff = Math.floor((currentTime - timerStartTime) / 1000);

        // Mettre à jour le temps passé
        setTimeSpent(prev => ({
          ...prev,
          [currentQuestion.questionId]: timeDiff
        }));

        // Mettre à jour le temps restant
        setQuestionTimeRemaining(prev => {
          const remaining = prev[currentQuestion.questionId] - 1;
          if (remaining <= 0) {
            // Si le temps est écoulé, passer à la question suivante
            handleNext();
            return prev;
          }
          return {
            ...prev,
            [currentQuestion.questionId]: remaining
          };
        });
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [activeStep, evaluationData]);

  // Modifier le useEffect pour vérifier l'expiration du token
  useEffect(() => {
    const token = localStorage.getItem('evaluationToken');
    const evaluationId = localStorage.getItem('evaluationId');

    if (!token || !evaluationId) {
      navigate('/evaluation-login');
      return;
    }

    // Vérifier si le token est expiré
    if (isTokenExpired(token)) {
      localStorage.removeItem('evaluationToken');
      localStorage.removeItem('evaluationId');
      toast.error('Votre session a expiré. Veuillez vous reconnecter.');
      navigate('/evaluation-login');
      return;
    }

    // Vérifier périodiquement l'expiration du token
    const tokenCheckInterval = setInterval(() => {
      const currentToken = localStorage.getItem('evaluationToken');
      if (!currentToken || isTokenExpired(currentToken)) {
        localStorage.removeItem('evaluationToken');
        localStorage.removeItem('evaluationId');
        toast.error('Votre session a expiré. Veuillez vous reconnecter.');
        navigate('/evaluation-login');
      }
    }, 60000); // Vérifier toutes les minutes

    const fetchEvaluation = async () => {
      try {
        const response = await axios.get(`https://localhost:7082/api/evaluation/${evaluationId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        setEvaluationData(response.data);
        
        // Récupérer les options des questions
        await fetchQuestionOptions(evaluationId);

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

      } catch (error) {
        console.error('Erreur lors de la récupération de l\'évaluation:', error);
        toast.error('Une erreur est survenue lors du chargement de l\'évaluation');
      } finally {
        setLoading(false);
      }
    };

    fetchEvaluation();

    // Nettoyer l'intervalle lors du démontage du composant
    return () => {
      if (autoSaveInterval) {
        clearInterval(autoSaveInterval);
      }
      clearInterval(tokenCheckInterval);
    };
  }, [navigate]);

  const handleNext = () => {
    if (evaluationData && evaluationData.questions && evaluationData.questions.length > 0) {
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
      // Log des données avant envoi
      const responses = Object.entries(answers).map(([questionId, value]) => {
        const question = evaluationData.questions.find(q => q.questionId === parseInt(questionId));
        return {
        questionId: parseInt(questionId),
          responseType: question.responseType,
          responseValue: JSON.stringify(value),
          timeSpent: timeSpent[questionId] || 0,
          startTime: new Date().toISOString(), // Utiliser la date actuelle
          endTime: new Date().toISOString()    // Utiliser la date actuelle
        };
      });
      
      const averageScore = calculateAverageScore();
      const payload = {
        responses,
        overallFeedback,
        averageScore
      };

      console.log("Payload being sent:", JSON.stringify(payload));

      const response = await axios.post(`https://localhost:7082/api/evaluation/${evaluationId}/submit`, payload, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data.success) {
        toast.success('Évaluation soumise avec succès!');
        // Supprimer le token et l'ID d'évaluation du localStorage
        localStorage.removeItem('evaluationToken');
        localStorage.removeItem('evaluationId');
        navigate('/evaluation-confirmation');
      } else {
        setError('Erreur lors de la soumission de l\'évaluation. Veuillez réessayer.');
      }
    } catch (err) {
      console.error('Error submitting evaluation:', err);

      // Afficher des informations détaillées sur l'erreur
      if (err.response) {
        console.error('Server response:', err.response.data);
        setError(`Erreur du serveur: ${JSON.stringify(err.response.data)}`);
      } else {
      setError('Une erreur est survenue lors de la soumission.');
      }
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

  // Modifier le composant TimeRemainingDisplay pour afficher le temps restant par question
  const TimeRemainingDisplay = () => {
    if (!evaluationData || !evaluationData.questions[activeStep]) return null;

    const currentQuestion = evaluationData.questions[activeStep];
    const remaining = questionTimeRemaining[currentQuestion.questionId];

    if (!remaining) return null;

    const minutes = Math.floor(remaining / 60);
    const seconds = remaining % 60;

    return (
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <FaClock />
        <Typography variant="body1">
          Temps restant pour cette question : {minutes}m {seconds}s
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