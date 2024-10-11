import React from 'react';

function PageHeader({ task }) {
  return (
    <div className="page-header">
        <nav aria-label="breadcrumb">
          <ol className="breadcrumb">
            <li className="breadcrumb-item">
              <a href="#!">Competences salaries</a>
            </li>
            <li className="breadcrumb-item active" aria-current="page">
              Liste
            </li>
          </ol>
        </nav>
    </div>
  );
}

export default PageHeader;
