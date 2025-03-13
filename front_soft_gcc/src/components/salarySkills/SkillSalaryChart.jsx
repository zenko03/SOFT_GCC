import React, { useState, useEffect, useCallback } from 'react';
import '../../styles/skillsStyle.css';
import '../../styles/pagination.css';
import BarChart from '../../components/BarChart';
import { urlApi } from '../../helpers/utils';
import axios from "axios";
import LoaderComponent from '../../helpers/LoaderComponent';

function debounce(func, delay) {
  let timeout;
  return (...args) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), delay);
  };
}

function SkillSalaryChart({ employeeId }) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null); 
  const [datasLevelSkills, setDatasLevelSkills] = useState([]);

  const [filter, setFilter] = useState({
    employeeId: employeeId,
    state: 10
  });

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilter((prevFilters) => ({ ...prevFilters, [name]: value }));
  };

  const fetchFilteredData = useCallback(async (appliedFilter) => {
    setLoading(true);
    setError(null);
    try {
      const queryParams = new URLSearchParams({ ...appliedFilter }).toString();
      const response = await axios.get(urlApi(`/EmployeeSkills/skillLevel?${queryParams}`));
      setDatasLevelSkills(response.data || []);
    } catch (err) {
      setDatasLevelSkills([]);
      setError('Erreur lors de la récupération des données : ' + err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  const debouncedFetchData = useCallback(debounce(fetchFilteredData, 1000), [fetchFilteredData]);

  useEffect(() => {
    debouncedFetchData(filter);
  }, [filter, debouncedFetchData]);

  const preparedDatas = datasLevelSkills.map(item => ({
    label: item.skillName,
    value: item.level,
    color: item.state === 1 ? 'rgba(255, 99, 132, 0.7)' : item.state === 5 ? 'rgba(255, 206, 86, 0.7)' : 'rgba(75, 192, 192, 0.7)',
    borderColor: item.state === 1 ? 'rgba(255, 99, 132, 1)' : item.state === 5 ? 'rgba(255, 206, 86, 1)' : 'rgba(75, 192, 192, 1)'
  }));

  const statusSkills = [
    { label: 'Non validé', backgroundColor: 'rgba(255, 99, 132, 0.2)', borderColor: 'rgba(255, 99, 132, 1)' },
    { label: 'Validé par évaluation', backgroundColor: 'rgba(255, 206, 86, 0.2)', borderColor: 'rgba(255, 206, 86, 1)' },
    { label: 'Confirmé', backgroundColor: 'rgba(75, 192, 192, 0.2)', borderColor: 'rgba(75, 192, 192, 1)' }
  ];

  const renderStatusSkills = () => {
    return statusSkills.map((status, index) => (
      <div key={index} style={{ display: 'flex', alignItems: 'center', marginBottom: '5px' }}>
        <div 
          style={{
            backgroundColor: status.backgroundColor,
            border: `1px solid ${status.borderColor}`,
            width: '20px',
            height: '20px',
            marginRight: '10px'
          }}
        />
        <span>{status.label}</span>
      </div>
    ));
  };

  return (
    <div className="row">
      {loading && <LoaderComponent />}
      <div className="col-lg-12 grid-margin stretch-card">
        <div className="card">
          <div className="card-body">
            <p className="card-description text-left">Niveaux des compétences obtenues</p>
            <div className="form-group row">
              <div className="col-sm-3">
                <select 
                  name="state" 
                  value={filter.state} 
                  onChange={handleFilterChange} 
                  className="form-control"
                >
                  <option value="">Sélectionner un état</option>
                  <option value="1">Non validé</option>
                  <option value="5">Validé par évaluation</option>
                  <option value="10">Confirmé</option>
                </select>
              </div>
            </div>
            <BarChart datas={preparedDatas} states={renderStatusSkills()} labelLetter="Compétences" />
          </div>
        </div>
      </div>
    </div>
  );
}

export default SkillSalaryChart;
