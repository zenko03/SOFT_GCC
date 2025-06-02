import { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import PropTypes from 'prop-types';

const EvaluationFill = ({ interview, employeeId, extractedData }) => {
  const [employeeInfo, setEmployeeInfo] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState({
    // Informations générales sur l'entretien
    general: {
      date: new Date().toISOString().split('T')[0],
      location: '',
      context: '',
    },
    // Bilan de la période précédente
    previousPeriod: {
      achievements: '',
      challenges: '',
      previousObjectivesAchieved: '',
      feedback: '',
    },
    // Évaluation des compétences
    skills: [],
    // Objectifs pour la prochaine période
    objectives: [{
      description: '',
      dueDate: '',
      indicator: '',
    }],
    // Plan de développement
    developmentPlan: {
      trainingNeeds: '',
      careerAspiration: '',
      notes: '',
    },
    // Notes globales
    globalNotes: '',
    // Note globale
    overallRating: 0,
  });
  const [competenceCategories, setCompetenceCategories] = useState([]);
  const [activeTab, setActiveTab] = useState('general');

  // Charger les informations de l'employé
  useEffect(() => {
    const fetchEmployeeInfo = async () => {
      try {
        setIsLoading(true);
        const response = await axios.get(`https://localhost:7082/api/Employee/${employeeId}`);
        
        if (response.data) {
          setEmployeeInfo(response.data);
        }
      } catch (error) {
        console.error("Erreur lors de la récupération des informations de l'employé:", error);
        toast.error("Impossible de récupérer les informations de l'employé.");
      } finally {
        setIsLoading(false);
      }
    };

    if (employeeId) {
      fetchEmployeeInfo();
    }
  }, [employeeId]);

  // Charger les compétences associées au poste de l'employé
  useEffect(() => {
    const fetchCompetences = async () => {
      if (!employeeInfo.positionId) return;
      
      try {
        setIsLoading(true);
        
        const response = await axios.get(`https://localhost:7082/api/Skill/position/${employeeInfo.positionId}`);
        
        if (response.data) {
          // Organiser les compétences par catégorie
          const categories = {};
          
          response.data.forEach(skill => {
            const category = skill.category || 'Autres';
            
            if (!categories[category]) {
              categories[category] = [];
            }
            
            categories[category].push({
              skillId: skill.skillId,
              name: skill.name,
              description: skill.description,
              rating: 0,
              comment: ''
            });
          });
          
          setCompetenceCategories(Object.entries(categories).map(([name, skills]) => ({
            name,
            skills
          })));
          
          // Mettre à jour formData.skills avec la liste complète
          setFormData(prev => ({
            ...prev,
            skills: response.data.map(skill => ({
              skillId: skill.skillId,
              name: skill.name,
              category: skill.category || 'Autres',
              rating: 0,
              comment: ''
            }))
          }));
        }
      } catch (error) {
        console.error("Erreur lors de la récupération des compétences:", error);
        toast.error("Impossible de récupérer les compétences pour ce poste.");
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchCompetences();
  }, [employeeInfo]);

  // Préremplir le formulaire avec les données extraites du PDF si disponibles
  useEffect(() => {
    if (extractedData) {
      const newFormData = { ...formData };
      
      // Remplir les notes globales si disponibles
      if (extractedData.notes) {
        newFormData.globalNotes = extractedData.notes;
      }
      
      // Remplir la note globale si disponible
      if (extractedData.average) {
        newFormData.overallRating = extractedData.average;
      }
      
      // Tenter de faire correspondre les compétences avec les questions extraites
      if (extractedData.questions && extractedData.questions.length > 0 && formData.skills.length > 0) {
        // Pour chaque question extraite, chercher une compétence correspondante
        extractedData.questions.forEach(question => {
          formData.skills.forEach((skill, index) => {
            // Vérifier la correspondance par nom de compétence
            if (question.competenceName && 
                skill.name.toLowerCase().includes(question.competenceName.toLowerCase()) || 
                question.questionText.toLowerCase().includes(skill.name.toLowerCase())) {
              
              newFormData.skills[index].rating = question.rating || 0;
              newFormData.skills[index].comment = question.comment || '';
            }
          });
        });
      }
      
      setFormData(newFormData);
      
      toast.info("Les données extraites ont été appliquées au formulaire.");
    }
  }, [extractedData, formData.skills]);
  
  // Gestionnaire de changement pour les champs imbriqués
  const handleNestedChange = (section, field, value) => {
    setFormData(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value
      }
    }));
  };
  
  // Gestionnaire de changement pour les compétences
  const handleSkillChange = (index, field, value) => {
    const newSkills = [...formData.skills];
    newSkills[index][field] = value;
    
    setFormData(prev => ({
      ...prev,
      skills: newSkills
    }));
  };
  
  // Ajouter un objectif
  const handleAddObjective = () => {
    setFormData(prev => ({
      ...prev,
      objectives: [
        ...prev.objectives,
        { description: '', dueDate: '', indicator: '' }
      ]
    }));
  };
  
  // Supprimer un objectif
  const handleRemoveObjective = (index) => {
    const newObjectives = [...formData.objectives];
    newObjectives.splice(index, 1);
    
    setFormData(prev => ({
      ...prev,
      objectives: newObjectives
    }));
  };
  
  // Mettre à jour un objectif
  const handleObjectiveChange = (index, field, value) => {
    const newObjectives = [...formData.objectives];
    newObjectives[index][field] = value;
    
    setFormData(prev => ({
      ...prev,
      objectives: newObjectives
    }));
  };
  
  // Calculer la moyenne des compétences
  const calculateAverageRating = () => {
    const ratings = formData.skills
      .map(skill => skill.rating)
      .filter(rating => rating > 0);
    
    if (ratings.length === 0) return 0;
    
    const sum = ratings.reduce((total, rating) => total + rating, 0);
    return (sum / ratings.length).toFixed(1);
  };
  
  // Sauvegarder le formulaire
  const handleSave = async () => {
    try {
      setIsSaving(true);
      
      // Calculer la note moyenne
      const averageRating = calculateAverageRating();
      
      // Préparer les données à envoyer
      const payload = {
        evaluationId: interview.evaluationId,
        employeeId: employeeId,
        interviewDate: formData.general.date,
        notes: JSON.stringify({
          general: formData.general,
          previousPeriod: formData.previousPeriod,
          skills: formData.skills,
          objectives: formData.objectives,
          developmentPlan: formData.developmentPlan,
          globalNotes: formData.globalNotes
        }),
        average: averageRating
      };
      
      await axios.post(
        'https://localhost:7082/api/EvaluationQuestion/evaluation/save-responses',
        payload
      );
      
      toast.success("Données d'entretien sauvegardées avec succès");
    } catch (error) {
      console.error("Erreur lors de la sauvegarde de l'entretien:", error);
      toast.error("Erreur lors de la sauvegarde de l'entretien");
    } finally {
      setIsSaving(false);
    }
  };
  
  // Fonction pour changer d'onglet
  const changeTab = (tabName) => {
    setActiveTab(tabName);
  };
  
  if (isLoading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '400px' }}>
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Chargement...</span>
        </div>
        <span className="ms-2">Chargement des données...</span>
      </div>
    );
  }
  
  return (
    <div className="evaluation-fill-container">
      <div className="card shadow-sm">
        <div className="card-header bg-light">
          <div className="d-flex justify-content-between align-items-center">
            <h5 className="mb-0 d-flex align-items-center">
              <i className="mdi mdi-clipboard-text-outline text-primary me-2" style={{ fontSize: '1.5rem' }}></i>
              Entretien d&apos;évaluation
            </h5>
            <div className="badge bg-primary">
              Note globale: {calculateAverageRating()}/5
            </div>
          </div>
          
          {/* Informations de l'employé */}
          {employeeInfo && (
            <div className="mt-3 p-3 border rounded bg-white">
              <div className="row">
                <div className="col-md-4">
                  <p className="mb-1 text-muted">Employé</p>
                  <p className="mb-0 fw-bold">{employeeInfo.firstName} {employeeInfo.lastName}</p>
                </div>
                <div className="col-md-3">
                  <p className="mb-1 text-muted">Poste</p>
                  <p className="mb-0">{employeeInfo.position || "Non spécifié"}</p>
                </div>
                <div className="col-md-3">
                  <p className="mb-1 text-muted">Département</p>
                  <p className="mb-0">{employeeInfo.department || "Non spécifié"}</p>
                </div>
                <div className="col-md-2">
                  <p className="mb-1 text-muted">En poste depuis</p>
                  <p className="mb-0">{employeeInfo.joinDate ? new Date(employeeInfo.joinDate).toLocaleDateString() : "Non spécifié"}</p>
                </div>
              </div>
            </div>
          )}
        </div>
        
        <div className="card-body">
          {/* Navigation par onglets */}
          <ul className="nav nav-tabs mb-4">
            <li className="nav-item">
              <button 
                className={`nav-link ${activeTab === 'general' ? 'active' : ''}`}
                onClick={() => changeTab('general')}
              >
                Général
              </button>
            </li>
            <li className="nav-item">
              <button 
                className={`nav-link ${activeTab === 'previous' ? 'active' : ''}`}
                onClick={() => changeTab('previous')}
              >
                Bilan précédent
              </button>
            </li>
            <li className="nav-item">
              <button 
                className={`nav-link ${activeTab === 'skills' ? 'active' : ''}`}
                onClick={() => changeTab('skills')}
              >
                Compétences
              </button>
            </li>
            <li className="nav-item">
              <button 
                className={`nav-link ${activeTab === 'objectives' ? 'active' : ''}`}
                onClick={() => changeTab('objectives')}
              >
                Objectifs
              </button>
            </li>
            <li className="nav-item">
              <button 
                className={`nav-link ${activeTab === 'development' ? 'active' : ''}`}
                onClick={() => changeTab('development')}
              >
                Plan de développement
              </button>
            </li>
          </ul>
          
          {/* Contenu des onglets */}
          <div className="tab-content">
            {/* Onglet Général */}
            {activeTab === 'general' && (
              <div className="tab-pane fade show active">
                <div className="row mb-4">
                  <div className="col-md-4">
                    <div className="form-group">
                      <label className="form-label">Date de l&apos;entretien</label>
                      <input 
                        type="date" 
                        className="form-control" 
                        value={formData.general.date}
                        onChange={e => handleNestedChange('general', 'date', e.target.value)}
                      />
                    </div>
                  </div>
                  <div className="col-md-4">
                    <div className="form-group">
                      <label className="form-label">Lieu</label>
                      <input 
                        type="text" 
                        className="form-control" 
                        placeholder="Lieu de l'entretien"
                        value={formData.general.location}
                        onChange={e => handleNestedChange('general', 'location', e.target.value)}
                      />
                    </div>
                  </div>
                </div>
                
                <div className="form-group mb-4">
                  <label className="form-label">Contexte de l&apos;entretien</label>
                  <textarea 
                    className="form-control" 
                    rows="3"
                    placeholder="Décrivez le contexte de cet entretien d'évaluation..."
                    value={formData.general.context}
                    onChange={e => handleNestedChange('general', 'context', e.target.value)}
                  ></textarea>
                </div>
                
                <div className="form-group">
                  <label className="form-label">Notes générales</label>
                  <textarea 
                    className="form-control" 
                    rows="5"
                    placeholder="Notes générales concernant l'entretien..."
                    value={formData.globalNotes}
                    onChange={e => setFormData({...formData, globalNotes: e.target.value})}
                  ></textarea>
                </div>
              </div>
            )}
            
            {/* Onglet Bilan précédent */}
            {activeTab === 'previous' && (
              <div className="tab-pane fade show active">
                <div className="form-group mb-4">
                  <label className="form-label">Réalisations notables</label>
                  <textarea 
                    className="form-control" 
                    rows="3"
                    placeholder="Décrivez les réalisations notables de la période précédente..."
                    value={formData.previousPeriod.achievements}
                    onChange={e => handleNestedChange('previousPeriod', 'achievements', e.target.value)}
                  ></textarea>
                </div>
                
                <div className="form-group mb-4">
                  <label className="form-label">Défis rencontrés</label>
                  <textarea 
                    className="form-control" 
                    rows="3"
                    placeholder="Décrivez les défis rencontrés durant la période précédente..."
                    value={formData.previousPeriod.challenges}
                    onChange={e => handleNestedChange('previousPeriod', 'challenges', e.target.value)}
                  ></textarea>
                </div>
                
                <div className="form-group mb-4">
                  <label className="form-label">Objectifs précédents atteints</label>
                  <textarea 
                    className="form-control" 
                    rows="3"
                    placeholder="Indiquez les objectifs précédents qui ont été atteints..."
                    value={formData.previousPeriod.previousObjectivesAchieved}
                    onChange={e => handleNestedChange('previousPeriod', 'previousObjectivesAchieved', e.target.value)}
                  ></textarea>
                </div>
                
                <div className="form-group">
                  <label className="form-label">Feedback des parties prenantes</label>
                  <textarea 
                    className="form-control" 
                    rows="3"
                    placeholder="Résumez le feedback reçu des parties prenantes..."
                    value={formData.previousPeriod.feedback}
                    onChange={e => handleNestedChange('previousPeriod', 'feedback', e.target.value)}
                  ></textarea>
                </div>
              </div>
            )}
            
            {/* Onglet Compétences */}
            {activeTab === 'skills' && (
              <div className="tab-pane fade show active">
                {competenceCategories.length > 0 ? (
                  competenceCategories.map((category, categoryIndex) => (
                    <div key={categoryIndex} className="mb-4">
                      <h5 className="border-bottom pb-2 mb-3">{category.name}</h5>
                      
                      <div className="table-responsive">
                        <table className="table">
                          <thead>
                            <tr>
                              <th style={{width: '30%'}}>Compétence</th>
                              <th style={{width: '15%'}}>Évaluation</th>
                              <th style={{width: '55%'}}>Commentaire</th>
                            </tr>
                          </thead>
                          <tbody>
                            {category.skills.map((skill, skillIndex) => {
                              // Trouver l'index global de cette compétence dans formData.skills
                              const globalSkillIndex = formData.skills.findIndex(s => s.skillId === skill.skillId);
                              
                              return (
                                <tr key={skill.skillId}>
                                  <td>
                                    <div>
                                      <div className="fw-medium">{skill.name}</div>
                                      <small className="text-muted">{skill.description}</small>
                                    </div>
                                  </td>
                                  <td>
                                    <select 
                                      className="form-select"
                                      value={formData.skills[globalSkillIndex]?.rating || 0}
                                      onChange={e => handleSkillChange(globalSkillIndex, 'rating', parseInt(e.target.value))}
                                    >
                                      <option value="0">Non évalué</option>
                                      <option value="1">1 - Insuffisant</option>
                                      <option value="2">2 - À améliorer</option>
                                      <option value="3">3 - Satisfaisant</option>
                                      <option value="4">4 - Bon</option>
                                      <option value="5">5 - Excellent</option>
                                    </select>
                                  </td>
                                  <td>
                                    <textarea 
                                      className="form-control"
                                      rows="2"
                                      placeholder="Commentaire sur cette compétence..."
                                      value={formData.skills[globalSkillIndex]?.comment || ''}
                                      onChange={e => handleSkillChange(globalSkillIndex, 'comment', e.target.value)}
                                    ></textarea>
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="alert alert-warning">
                    <i className="mdi mdi-information-outline me-2"></i>
                    Aucune compétence n&apos;a été trouvée pour ce poste.
                  </div>
                )}
              </div>
            )}
            
            {/* Onglet Objectifs */}
            {activeTab === 'objectives' && (
              <div className="tab-pane fade show active">
                <p className="text-muted mb-3">
                  Définissez les objectifs pour la prochaine période d&apos;évaluation.
                </p>
                
                {formData.objectives.map((objective, index) => (
                  <div key={index} className="card mb-3 border">
                    <div className="card-body">
                      <div className="d-flex justify-content-between align-items-center mb-3">
                        <h6 className="mb-0">Objectif {index + 1}</h6>
                        <button 
                          type="button" 
                          className="btn btn-sm btn-outline-danger"
                          onClick={() => handleRemoveObjective(index)}
                        >
                          <i className="mdi mdi-trash-can-outline"></i>
                        </button>
                      </div>
                      
                      <div className="mb-3">
                        <label className="form-label">Description</label>
                        <textarea 
                          className="form-control"
                          rows="2"
                          placeholder="Décrivez l'objectif à atteindre..."
                          value={objective.description}
                          onChange={e => handleObjectiveChange(index, 'description', e.target.value)}
                        ></textarea>
                      </div>
                      
                      <div className="row">
                        <div className="col-md-6 mb-3">
                          <label className="form-label">Date d&apos;échéance</label>
                          <input 
                            type="date" 
                            className="form-control"
                            value={objective.dueDate}
                            onChange={e => handleObjectiveChange(index, 'dueDate', e.target.value)}
                          />
                        </div>
                        
                        <div className="col-md-6 mb-3">
                          <label className="form-label">Indicateur de réussite</label>
                          <input 
                            type="text" 
                            className="form-control"
                            placeholder="Comment mesurer la réussite?"
                            value={objective.indicator}
                            onChange={e => handleObjectiveChange(index, 'indicator', e.target.value)}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
                
                <div className="d-grid">
                  <button 
                    type="button" 
                    className="btn btn-outline-primary"
                    onClick={handleAddObjective}
                  >
                    <i className="mdi mdi-plus-circle me-2"></i>
                    Ajouter un objectif
                  </button>
                </div>
              </div>
            )}
            
            {/* Onglet Plan de développement */}
            {activeTab === 'development' && (
              <div className="tab-pane fade show active">
                <div className="form-group mb-4">
                  <label className="form-label">Besoins en formation</label>
                  <textarea 
                    className="form-control" 
                    rows="3"
                    placeholder="Identifiez les besoins en formation et développement..."
                    value={formData.developmentPlan.trainingNeeds}
                    onChange={e => handleNestedChange('developmentPlan', 'trainingNeeds', e.target.value)}
                  ></textarea>
                </div>
                
                <div className="form-group mb-4">
                  <label className="form-label">Aspirations de carrière</label>
                  <textarea 
                    className="form-control" 
                    rows="3"
                    placeholder="Notez les aspirations de carrière discutées..."
                    value={formData.developmentPlan.careerAspiration}
                    onChange={e => handleNestedChange('developmentPlan', 'careerAspiration', e.target.value)}
                  ></textarea>
                </div>
                
                <div className="form-group">
                  <label className="form-label">Notes additionnelles</label>
                  <textarea 
                    className="form-control" 
                    rows="3"
                    placeholder="Notes additionnelles concernant le plan de développement..."
                    value={formData.developmentPlan.notes}
                    onChange={e => handleNestedChange('developmentPlan', 'notes', e.target.value)}
                  ></textarea>
                </div>
              </div>
            )}
          </div>
          
          {/* Bouton de sauvegarde */}
          <div className="d-flex justify-content-end mt-4">
            <button 
              type="button" 
              className="btn btn-primary"
              onClick={handleSave}
              disabled={isSaving}
            >
              {isSaving ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2"></span>
                  Sauvegarde...
                </>
              ) : (
                <>
                  <i className="mdi mdi-content-save-outline me-2"></i>
                  Enregistrer l&apos;entretien
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

EvaluationFill.propTypes = {
  interview: PropTypes.object.isRequired,
  employeeId: PropTypes.number.isRequired,
  extractedData: PropTypes.object
};

export default EvaluationFill;
