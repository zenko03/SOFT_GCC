import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-hot-toast';

const Step3 = ({ evaluationId, employeeId, currentUser }) => {
  const navigate = useNavigate();
  const [competencies, setCompetencies] = useState({});
  const [competencyComments, setCompetencyComments] = useState({});

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const formData = {
        evaluationId: evaluationId,
        employeeId: employeeId,
        positionId: evaluationId,
        evaluationDate: new Date().toISOString(),
        evaluatorId: currentUser.id,
        status: 'completed',
        scores: Object.entries(competencies).map(([competencyId, score]) => ({
          competencyId,
          score,
          comments: competencyComments[competencyId] || ''
        }))
      };

      const response = await axios.post('/api/evaluations', formData);
      if (response.status === 201) {
        toast.success('Évaluation enregistrée avec succès');
        navigate('/evaluations');
      }
    } catch (error) {
      console.error('Erreur lors de l\'enregistrement de l\'évaluation:', error);
      toast.error('Erreur lors de l\'enregistrement de l\'évaluation');
    }
  };

  return (
    <div>
      {/* Form submission code */}
    </div>
  );
};

export default Step3; 