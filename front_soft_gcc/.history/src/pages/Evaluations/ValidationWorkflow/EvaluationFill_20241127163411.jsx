import React, { useState } from 'react';

const EvaluationFill = () => {
    const [evaluationData, setEvaluationData] = useState({
        objectives: '',
        skills: '',
        progress: '',
        recommendations: '',
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setEvaluationData({ ...evaluationData, [name]: value });
    };

    return (
        <div className="card">
            <div className="card-body">
                <h5>Remplissage de la Fiche d'Évaluation</h5>
                <textarea
                    name="objectives"
                    placeholder="Objectifs atteints"
                    className="form-control my-3"
                    value={evaluationData.objectives}
                    onChange={handleChange}
                ></textarea>
                <textarea
                    name="skills"
                    placeholder="Compétences observées"
                    className="form-control my-3"
                    value={evaluationData.skills}
                    onChange={handleChange}
                ></textarea>
                <textarea
                    name="progress"
                    placeholder="Axes de progrès"
                    className="form-control my-3"
                    value={evaluationData.progress}
                    onChange={handleChange}
                ></textarea>
                <textarea
                    name="recommendations"
                    placeholder="Recommandations"
                    className="form-control my-3"
                    value={evaluationData.recommendations}
                    onChange={handleChange}
                ></textarea>
                <button className="btn btn-primary">Enregistrer</button>
            </div>
        </div>
    );
};

export default EvaluationFill;
