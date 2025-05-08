import React from 'react';
import ModelEdit from '../../pages/certificateManagement/ModelEdit';
import AttestationHistory from '../../pages/certificateManagement/AttestationHistory';

function Certificate({dataEmployee}) {

  return (
    <div>
      <AttestationHistory employeeId={4} />
      <ModelEdit dataEmployee={dataEmployee} />
    </div>
  );
}

export default Certificate;
