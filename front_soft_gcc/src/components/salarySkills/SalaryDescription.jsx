import React from 'react';

import FormattedDate from '../../helpers/FormattedDate';

// Gerer le contenu de la description d'un salarie
function SalaryDescription({ dataEmployeeDescription }) {
  return (
    <div className="row">
        <div className="col-lg-6 grid-margin stretch-card">
          <div className="card">
            <div className="card-body">
              <div className='col-md-5 image-profil'>
                <img src="/src/assets/images/faces/face1.jpg" alt="image" width={150} />
              </div>
              <div className='col-md-6 decription'>
                <p>Employe : <span className='value-profil'>{dataEmployeeDescription.firstName+" "+dataEmployeeDescription.name}</span></p>
                <p>Matricule : <span className='value-profil'>{dataEmployeeDescription.registrationNumber}</span></p>
                <p>Derniere mise a jour : <span className='value-profil'>19 juin 2024</span></p>
                <p>Date naissance : <span className='value-profil'><FormattedDate date={dataEmployeeDescription.birthday} /></span></p>
              </div>
            </div>
          </div>
        </div>
    </div>
  );
}

export default SalaryDescription;
