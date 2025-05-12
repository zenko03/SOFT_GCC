import { useState, useEffect } from 'react';
import { useNavigate } from "react-router-dom";
import axios from 'axios';
import Template from "../../Template";
import { useUser } from "../../../pages/Evaluations/EvaluationInterview/UserContext";
import PermissionService from "../../../services/PermissionService";
import { 
  Box, Typography, Card, CardContent, 
  TextField, Button, Grid, Slider, 
  Table, TableBody, TableCell, TableContainer, 
  TableHead, TableRow, Paper, Alert, CircularProgress,
  IconButton, Divider, Chip
} from '@mui/material';
import { FaClock, FaSave, FaEdit, FaArrowLeft } from 'react-icons/fa';
import { toast } from 'react-toastify';

const AdminSettings = () => {
  const navigate = useNavigate();
  const { hasPermission } = useUser();
  
  // États pour les données et le chargement
  const [loading, setLoading] = useState(true);
  const [evaluations, setEvaluations] = useState([]);
  const [selectedEvaluation, setSelectedEvaluation] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [timeConfigs, setTimeConfigs] = useState({});
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Vérifier l'accès
  useEffect(() => {
    const canAccess = PermissionService.hasFunctionalPermission(hasPermission, 'EVAL_SETTINGS');
    if (!canAccess) {
      toast.error("Vous n'avez pas les permissions nécessaires pour accéder à cette page");
      navigate('/evaluations');
    } else {
      fetchEvaluations();
    }
  }, [hasPermission, navigate]);

  // Récupérer la liste des évaluations
  const fetchEvaluations = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('https://localhost:7082/api/evaluation/templates', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setEvaluations(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Erreur lors du chargement des évaluations:', error);
      setError('Impossible de charger la liste des évaluations. Veuillez réessayer.');
      setLoading(false);
    }
  };

  // Récupérer les questions d'une évaluation spécifique
  const fetchEvaluationQuestions = async (evaluationId) => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`https://localhost:7082/api/evaluation/${evaluationId}/questions`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      // Formater les données des questions
      const questionsData = response.data;
      setQuestions(questionsData);
      
      // Initialiser les configurations de temps
      const configs = {};
      questionsData.forEach(question => {
        configs[question.questionId] = question.maxTimeInMinutes || 15;
      });
      setTimeConfigs(configs);
      
      setLoading(false);
    } catch (error) {
      console.error('Erreur lors du chargement des questions:', error);
      setError('Impossible de charger les questions. Veuillez réessayer.');
      setLoading(false);
    }
  };

  // Gérer la sélection d'une évaluation
  const handleEvaluationSelect = (evaluation) => {
    setSelectedEvaluation(evaluation);
    fetchEvaluationQuestions(evaluation.id);
    setError('');
    setSuccessMessage('');
  };

  // Gérer la modification du temps pour une question
  const handleTimeChange = (questionId, newValue) => {
    setTimeConfigs({
      ...timeConfigs,
      [questionId]: newValue
    });
  };

  // Sauvegarder les configurations de temps
  const saveTimeConfigurations = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      
      // Préparer les données à envoyer
      const questionsWithTime = questions.map(question => ({
        questionId: question.questionId,
        maxTimeInMinutes: timeConfigs[question.questionId] || 15
      }));
      
      // Appel API pour mettre à jour les temps
      const response = await axios.post(
        `https://localhost:7082/api/evaluation/questions/update-time`, 
        questionsWithTime, 
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      if (response.data.success) {
        setSuccessMessage('Les configurations de temps ont été enregistrées avec succès.');
        toast.success('Configurations de temps sauvegardées');
      } else {
        setError('Une erreur est survenue lors de la sauvegarde.');
        toast.error('Échec de la sauvegarde des configurations');
      }
      setLoading(false);
    } catch (error) {
      console.error('Erreur lors de la sauvegarde des configurations:', error);
      setError('Impossible de sauvegarder les configurations. Veuillez réessayer.');
      toast.error('Échec de la sauvegarde des configurations');
      setLoading(false);
    }
  };

  // Réinitialiser les temps à la valeur par défaut (15 minutes)
  const resetToDefaultTimes = () => {
    const defaultConfigs = {};
    questions.forEach(question => {
      defaultConfigs[question.questionId] = 15;
    });
    setTimeConfigs(defaultConfigs);
    toast.info('Toutes les questions ont été réinitialisées à 15 minutes');
  };

  // Gérer le retour à la liste des évaluations
  const handleBackToList = () => {
    setSelectedEvaluation(null);
    setQuestions([]);
    setTimeConfigs({});
    setError('');
    setSuccessMessage('');
  };

  if (loading && !selectedEvaluation) {
    return (
      <Template>
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
          <CircularProgress />
        </Box>
      </Template>
    );
  }

  return (
    <Template>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h5" component="h1" gutterBottom>
          Administration des Évaluations
        </Typography>
        <Typography variant="body1" gutterBottom>
          Configurez les paramètres avancés des évaluations, notamment le temps alloué par question.
        </Typography>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {successMessage && (
        <Alert severity="success" sx={{ mb: 3 }}>
          {successMessage}
        </Alert>
      )}

      {!selectedEvaluation ? (
        // Liste des évaluations
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Sélectionnez une évaluation à configurer
            </Typography>
            
            {evaluations.length === 0 ? (
              <Typography variant="body2" color="text.secondary">
                Aucune évaluation disponible.
              </Typography>
            ) : (
              <TableContainer component={Paper}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Titre</TableCell>
                      <TableCell>Description</TableCell>
                      <TableCell>Nombre de questions</TableCell>
                      <TableCell>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {evaluations.map((evaluation) => (
                      <TableRow key={evaluation.id}>
                        <TableCell>{evaluation.title}</TableCell>
                        <TableCell>
                          {evaluation.description && evaluation.description.length > 50 
                            ? `${evaluation.description.substring(0, 50)}...` 
                            : evaluation.description}
                        </TableCell>
                        <TableCell>{evaluation.questionCount || 'N/A'}</TableCell>
                        <TableCell>
                          <Button
                            variant="outlined"
                            startIcon={<FaEdit />}
                            onClick={() => handleEvaluationSelect(evaluation)}
                          >
                            Configurer
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </CardContent>
        </Card>
      ) : (
        // Configuration du temps par question pour l'évaluation sélectionnée
        <>
          <Box sx={{ mb: 3, display: 'flex', alignItems: 'center' }}>
            <IconButton onClick={handleBackToList} title="Retour à la liste" sx={{ mr: 2 }}>
              <FaArrowLeft />
            </IconButton>
            <Typography variant="h6">
              Configuration du temps - {selectedEvaluation.title}
            </Typography>
          </Box>
          
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <FaClock style={{ marginRight: '8px', color: '#f57c00' }} />
                <Typography variant="h6" color="primary">
                  Temps par question
                </Typography>
              </Box>
              
              <Typography variant="body2" color="text.secondary" paragraph>
                Définissez le temps maximum (en minutes) que les candidats auront pour répondre à chaque question.
              </Typography>
              
              <Box sx={{ mb: 2, display: 'flex', justifyContent: 'flex-end' }}>
                <Button 
                  variant="outlined" 
                  color="secondary" 
                  onClick={resetToDefaultTimes}
                  sx={{ mr: 2 }}
                >
                  Réinitialiser à 15 minutes
                </Button>
                <Button 
                  variant="contained" 
                  color="primary" 
                  startIcon={<FaSave />}
                  onClick={saveTimeConfigurations}
                  disabled={loading}
                >
                  {loading ? 'Sauvegarde en cours...' : 'Sauvegarder les modifications'}
                </Button>
              </Box>
              
              <Divider sx={{ my: 3 }} />
              
              {loading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
                  <CircularProgress />
                </Box>
              ) : (
                <TableContainer component={Paper} sx={{ mt: 2 }}>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell width="5%">#</TableCell>
                        <TableCell width="40%">Question</TableCell>
                        <TableCell width="15%">Type</TableCell>
                        <TableCell width="40%">Temps (minutes)</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {questions.map((question, index) => (
                        <TableRow key={question.questionId}>
                          <TableCell>{index + 1}</TableCell>
                          <TableCell>
                            {question.text && question.text.length > 100 
                              ? `${question.text.substring(0, 100)}...` 
                              : question.text}
                          </TableCell>
                          <TableCell>
                            <Chip 
                              label={question.responseType} 
                              color={question.responseType === 'QCM' ? 'primary' : 'secondary'} 
                              size="small"
                            />
                          </TableCell>
                          <TableCell>
                            <Grid container spacing={2} alignItems="center">
                              <Grid item xs={8}>
                                <Slider
                                  value={timeConfigs[question.questionId] || 15}
                                  min={1}
                                  max={60}
                                  step={1}
                                  marks={[
                                    { value: 1, label: '1m' },
                                    { value: 15, label: '15m' },
                                    { value: 30, label: '30m' },
                                    { value: 60, label: '60m' },
                                  ]}
                                  valueLabelDisplay="auto"
                                  onChange={(e, newValue) => handleTimeChange(question.questionId, newValue)}
                                />
                              </Grid>
                              <Grid item xs={4}>
                                <TextField
                                  label="Minutes"
                                  type="number"
                                  InputProps={{ inputProps: { min: 1, max: 60 } }}
                                  value={timeConfigs[question.questionId] || 15}
                                  onChange={(e) => {
                                    const value = Math.min(Math.max(parseInt(e.target.value) || 1, 1), 60);
                                    handleTimeChange(question.questionId, value);
                                  }}
                                  fullWidth
                                  size="small"
                                />
                              </Grid>
                            </Grid>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              )}
            </CardContent>
          </Card>
          
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 3 }}>
            <Button 
              variant="contained" 
              color="primary" 
              startIcon={<FaSave />}
              onClick={saveTimeConfigurations}
              disabled={loading}
              size="large"
            >
              {loading ? 'Sauvegarde en cours...' : 'Sauvegarder les configurations'}
            </Button>
          </Box>
        </>
      )}
    </Template>
  );
};

export default AdminSettings; 