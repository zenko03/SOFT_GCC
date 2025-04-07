import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { 
  Container, Typography, Box, Paper, Button, Stepper, 
  Step, StepLabel, Grid, Radio, RadioGroup, FormControlLabel, 
  TextField, CircularProgress, Alert, Card, CardContent, 
  AppBar, Toolbar, LinearProgress, FormGroup, Checkbox
} from '@mui/material';
import { 
  FaArrowRight, FaArrowLeft, FaPaperPlane, 
  FaSpinner, FaStar, FaBriefcase, FaBuilding, 
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
      setStartTime(new Date());
      const timer = setInterval(() => {
        if (startTime) {
          const currentTime = new Date();
          const timeDiff = Math.floor((currentTime - startTime) / 1000);
          setTimeSpent(prev => ({
            ...prev,
            [evaluationData.questions[activeStep].questionId]: timeDiff
          }));
        }
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [activeStep, evaluationData, startTime]);

  // Calcul de la progression
  useEffect(() => {
    if (evaluationData && evaluationData.questions) {
      const totalQuestions = evaluationData.questions.length;
      const answeredQuestions = Object.keys(answers).length;
      setProgress((answeredQuestions / totalQuestions) * 100);
    }
  }, [answers, evaluationData]);

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
        
        // Initialiser les réponses avec des valeurs par défaut selon le type de question
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
      .map(([_, value]) => value);
    
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
    switch (question.responseType) {
      case 'SCORE':
        return (
          <RadioGroup
            value={answers[question.questionId] || 0}
            onChange={(e) => handleAnswerChange(question.questionId, parseInt(e.target.value), 'SCORE')}
          >
            {[1, 2, 3, 4, 5].map((score) => (
              <FormControlLabel 
                key={score} 
                value={score} 
                control={<Radio />} 
                label={
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    {score === 1 && <FaStar />}
                    {score === 2 && <><FaStar /><FaStar /></>}
                    {score === 3 && <><FaStar /><FaStar /><FaStar /></>}
                    {score === 4 && <><FaStar /><FaStar /><FaStar /><FaStar /></>}
                    {score === 5 && <><FaStar /><FaStar /><FaStar /><FaStar /><FaStar /></>}
                  </Box>
                } 
              />
            ))}
          </RadioGroup>
        );
      case 'QCM':
        return (
          <FormGroup>
            {question.options.map((option, index) => (
              <FormControlLabel
                key={index}
                control={
                  <Checkbox
                    checked={answers[question.questionId]?.includes(option) || false}
                    onChange={() => handleAnswerChange(question.questionId, option, 'QCM')}
                  />
                }
                label={option}
              />
            ))}
          </FormGroup>
        );
      case 'TEXT':
        return (
          <TextField
            fullWidth
            multiline
            rows={4}
            value={answers[question.questionId] || ''}
            onChange={(e) => handleAnswerChange(question.questionId, e.target.value, 'TEXT')}
            variant="outlined"
          />
        );
      default:
        return null;
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
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" sx={{ flexGrow: 1 }}>
            Évaluation en Cours
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', mr: 2 }}>
            <FaClock style={{ marginRight: '8px' }} />
            <Typography variant="body1">
              {timeSpent[evaluationData?.questions[activeStep]?.questionId] || 0}s
            </Typography>
          </Box>
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
                <Typography variant="h6">{evaluationData.questions[activeStep].text}</Typography>
              </Grid>
              <Grid item xs={12}>
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