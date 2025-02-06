import React, { useState, useEffect, useCallback } from 'react';
import ReactPaginate from "react-paginate";
import "./history.css"; // Import du style personnalisé
import Template from "../Template";
import PageHeader from "../../components/PageHeader";
import axios from 'axios';
import { urlApi } from '../../helpers/utils';
import Loader from '../../helpers/Loader';
import DateDisplayWithTime from '../../helpers/DateDisplayWithTime';

const HistoryPage = () => {
  const [currentPage, setCurrentPage] = useState(0);
  const itemsPerPage = 10;

  const module = "Historiques";
  const action = "Liste";
  const url = "/Historiques";

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [activityLogs, setActivityLogs] = useState([]);

  const fetchActivityLogs = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await axios.get(urlApi("/activityLog")); // Vérifiez l'URL exacte.
      setActivityLogs(response.data);
    } catch (err) {
      setError("Erreur lors de la récupération des données.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchActivityLogs();
  }, [fetchActivityLogs]);

  const handlePageClick = ({ selected }) => {
    setCurrentPage(selected);
  };

  const offset = currentPage * itemsPerPage;
  const currentItems = activityLogs.slice(offset, offset + itemsPerPage);
  const pageCount = Math.ceil(activityLogs.length / itemsPerPage);

  return (
    <Template>
      {loading && <Loader />}
      {error && <div className="error-message">{error}</div>}

      <PageHeader module={module} action={action} url={url} />

      <div className="row">
        <div className="col-lg-6">
          <h4 className="card-title text-primary">Historique des Activités</h4>
        </div>
      </div>

      <div className="row">
        <div className="col-lg-12 grid-margin stretch-card">
          <div className="card shadow-sm rounded-lg">
            <div className="card-body">
              <h5 className="card-title subtitle text-secondary mb-4">Liste des Historiques</h5>
              <div className="table-responsive">
                {activityLogs.length > 0 ? (
                  <>
                    <table className="table table-hover table-bordered">
                      <thead className="bg-primary text-white">
                        <tr>
                          <th>#</th>
                          <th>Description</th>
                          <th>Date et Heure</th>
                        </tr>
                      </thead>
                      <tbody>
                        {currentItems.map((activity, index) => (
                          <tr key={activity.id}>
                            <td className="text-center">{offset + index + 1}</td>
                            <td>
                              <span className="font-medium">{activity.description}</span>
                            </td>
                            <td className="text-gray-500"><DateDisplayWithTime isoDate={activity.timestamp} /></td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    <ReactPaginate
                      previousLabel={"← Précédent"}
                      nextLabel={"Suivant →"}
                      pageCount={pageCount}
                      onPageChange={handlePageClick}
                      containerClassName={"pagination justify-content-center mt-4"}
                      previousLinkClassName={"btn btn-outline-primary"}
                      nextLinkClassName={"btn btn-outline-primary"}
                      disabledClassName={"btn-disabled"}
                      activeClassName={"active"}
                      pageLinkClassName={"page-link"}
                    />
                  </>
                ) : (
                  !loading && <div className="alert alert-warning">Aucun historique disponible.</div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </Template>
  );
};

export default HistoryPage;
