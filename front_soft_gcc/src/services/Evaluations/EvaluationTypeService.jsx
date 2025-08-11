import api from '../../helpers/api';

const EvaluationTypeService = {
    getEvaluationTypes: () => {
        return api.get('/EvaluationType');
    },

    getEvaluationType: (id) => {
        return api.get(`/EvaluationType/${id}`);
    },

    createEvaluationType: (evaluationType) => {
        return api.post('/EvaluationType', evaluationType);
    },

    updateEvaluationType: (id, evaluationType) => {
        return api.put(`/EvaluationType/${id}`, evaluationType);
    },

    deleteEvaluationType: (id) => {
        return api.delete(`/EvaluationType/${id}`);
    }
};

export default EvaluationTypeService; 