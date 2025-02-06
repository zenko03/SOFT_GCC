import React, { useState, useEffect, useCallback } from 'react';
import PageHeader from '../../components/PageHeader';
import Template from '../Template';
import { urlApi } from '../../helpers/utils';
import axios from "axios";
import Loader from '../../helpers/Loader';
import '../../styles/orgChart.css';
import pic1 from '/src/assets/images/faces-clipart/pic-1.png';
import '../../styles/skillsStyle.css';
import { useParams } from "react-router-dom";

// Page pour les nombres des employés par département
function DetailDepartment() {
    const module = 'Effectif';
    const action = 'details';
    const url = '/Details';

    // Initialisation des states
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const { DepartmentId } = useParams();
    const [employeeList, setEmployeeList] = useState([]);
    const [department, setDepartment] = useState(null);

    // Appel des API
    const fetchData = useCallback(async () => {
        if (!DepartmentId) {
            setError("ID du département introuvable.");
            return;
        }

        setLoading(true);
        setError(null); // Réinitialiser l'erreur avant un nouvel appel

        try {
            const [employeeListResponse, departmentResponse] = await Promise.all([
                axios.get(urlApi(`/Org/detailDepartement/${DepartmentId}`)),
                axios.get(urlApi(`/Department/${DepartmentId}`))
            ]);

            setEmployeeList(employeeListResponse.data || []);
            setDepartment(departmentResponse.data || {});
        } catch (error) {
            setError(`Erreur lors de la récupération des données : ${error.message}`);
        } finally {
            setLoading(false);
        }
    }, [DepartmentId]);

    // Effet pour déclencher les fetch
    useEffect(() => {
        fetchData();
    }, [fetchData]);

    return (
        <Template>
            {loading && <Loader />} {/* Affichez le loader lorsque `loading` est true */}
            {error && <div className="alert alert-danger">{error}</div>} {/* Affichez les erreurs */}

            {department && (
                <>
                    <PageHeader module={module} action={action} url={url} />

                    <div className="row mb-3">
                        <div className="col-lg-8">
                            <h2 className="card-title">
                                Département : {department.name || "Inconnu"}
                            </h2>
                        </div>
                    </div>
                    <div className="row">
                        <div className="col-lg-12 grid-margin stretch-card">
                            <div className="card">
                                <div className="card-body">
                                    <h5 className="card-title subtitle">Liste des employés</h5>
                                    <table className="table table-competences">
                                        <thead>
                                            <tr>
                                                <th>Photo</th>
                                                <th>Matricule</th>
                                                <th>Nom complet</th>
                                                <th>Poste</th>
                                                <th>Naissance</th>
                                                <th>Ancienneté</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {employeeList.length > 0 ? (
                                                employeeList.map((item, index) => (
                                                    <tr key={index}>
                                                        <td>
                                                            <img src={pic1} alt="Profil" />
                                                        </td>
                                                        <td>{item.registrationNumber}</td>
                                                        <td>{`${item.name} ${item.firstName}`}</td>
                                                        <td>{item.positionName}</td>
                                                        <td>{new Date(item.birthday).toLocaleDateString()}</td>
                                                        <td style={{color: '#44ce42'}}>{item.seniority} ans</td>
                                                    </tr>
                                                ))
                                            ) : (
                                                <tr>
                                                    <td colSpan="6" className="text-center">
                                                        Aucun employé trouvé.
                                                    </td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    </div>
                </>
            )}
        </Template>
    );
}

export default DetailDepartment;
