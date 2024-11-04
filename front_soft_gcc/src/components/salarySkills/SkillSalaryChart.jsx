import React, { useEffect, useRef } from 'react';
import { Chart } from 'chart.js/auto';

// Gerer le contenu des graphes de competences
function SkillSalaryChart() {
  const canvasRef = useRef(null);
  const chartInstanceRef = useRef(null);  // Référence pour stocker l'instance du graphique

  useEffect(() => {
    const ctx = canvasRef.current.getContext('2d');
    
    // Si un graphique existe déjà, on le détruit avant d'en créer un nouveau
    if (chartInstanceRef.current) {
      chartInstanceRef.current.destroy();
    }

    // Créer une nouvelle instance de Chart.js
    chartInstanceRef.current = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: ['Java', '.Net', 'C#', 'Marketing digital', 'Communication', 'Reseaux & Systemes'],
        datasets: [{
          label: 'Competences',
          data: [90, 85, 80, 40, 30, 45],
          backgroundColor: [
            'rgba(255, 99, 132, 0.2)',
            'rgba(54, 162, 235, 0.2)',
            'rgba(255, 206, 86, 0.2)',
            'rgba(75, 192, 192, 0.2)',
            'rgba(153, 102, 255, 0.2)',
            'rgba(255, 159, 64, 0.2)'
          ],
          borderColor: [
            'rgba(255, 99, 132, 1)',
            'rgba(54, 162, 235, 1)',
            'rgba(255, 206, 86, 1)',
            'rgba(75, 192, 192, 1)',
            'rgba(153, 102, 255, 1)',
            'rgba(255, 159, 64, 1)'
          ],
          borderWidth: 1
        }]
      },
      options: {
        scales: {
          y: {
            beginAtZero: true
          }
        }
      }
    });

    // Cleanup : détruire l'instance du graphique quand le composant est démonté
    return () => {
      if (chartInstanceRef.current) {
        chartInstanceRef.current.destroy();
      }
    };
  }, []);  // Le tableau vide [] signifie que l'effet ne se produit qu'une fois après le montage

  return (
    <div className="row">
      <div className="col-lg-12 grid-margin stretch-card">
        <div className="card">
          <div className="card-body">
              <ul>
                  <li>
                      <div className='help-graph'>
                          <div className='color-graph' style={{ backgroundColor: 'rgba(255, 99, 132, 0.2)', border: '1px solid rgba(255, 99, 132, 1)'}} ></div>
                          <div className='descri-graph'>
                              Non valider
                          </div>
                      </div>
                  </li>
                  <li>
                      <div className='help-graph'>
                          <div className='color-graph' style={{ backgroundColor: 'rgba(255, 206, 86, 0.2)', border: '1px solid rgba(255, 206, 86, 1)'}}></div>
                          <div className='descri-graph'>
                              Valider par evaluation
                          </div>
                      </div>
                  </li>
                  <li>
                      <div className='help-graph'>
                          <div className='color-graph' style={{ backgroundColor: 'rgba(75, 192, 192, 0.2)', border: '1px solid rgba(75, 192, 192, 1)'}}></div>
                          <div className='descri-graph'>
                              Confirmer
                          </div>
                      </div>
                  </li>
              </ul>
            <canvas ref={canvasRef} style={{ height: '230px' }}></canvas>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SkillSalaryChart;
