import React from 'react';

import FormattedDate from '../../helpers/FormattedDate';
import DateDisplayWithTime from '../../helpers/DateDisplayWithTime';
import pic1 from '/src/assets/images/male-default.webp';
import { urlApi } from '../../helpers/utils';

// Gerer le contenu de la description d'un salarie
function SalaryDescription({ dataEmployeeDescription }) {
  return (
    <div className="row">
        <div className="col-lg-7 grid-margin stretch-card">
          <div className="card">
            <div className="card-body">
              <div className='col-md-5 image-profil'>
                {dataEmployeeDescription.photo ? (
                  <img src={urlApi(`/Employee/photo/${dataEmployeeDescription.employeeId}`)} 
                  alt={'Employe '+dataEmployeeDescription.registrationNumber} width={180} 
                  style={{ borderRadius: '10px'}} />
                ) : (
                  <img
                    src={pic1}
                    alt={dataEmployeeDescription.registrationNumber}
                    width={180}
                  />
                )}
              </div>
              <div className='col-md-6 decription'>
                <p>Employe : <span className='value-profil' style={{fontWeight: 'bolder'}}>{dataEmployeeDescription.firstName+" "+dataEmployeeDescription.name}</span></p>
                <p>Matricule : <span className='value-profil' style={{fontWeight: 'bolder'}}>{dataEmployeeDescription.registrationNumber}</span></p>
                <p>Date naissance : <span className='value-profil' style={{fontWeight: 'bolder'}}><FormattedDate date={dataEmployeeDescription.birthday} /></span></p>
                <p>Date d'embauche : <span className='value-profil' style={{fontWeight: 'bolder'}}><FormattedDate date={dataEmployeeDescription.hiringDate} /></span></p>
                <p>Derniere mise a jour : <span className='value-profil' style={{fontWeight: 'bolder'}}><DateDisplayWithTime isoDate={dataEmployeeDescription.updatedDate}/></span></p>
              </div>
            </div>
          </div>
        </div>
    </div>
  );
}

export default SalaryDescription;
