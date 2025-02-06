import React, { useState, useEffect } from "react";
import Template from "../../Template";
import PageHeader from "../../../components/PageHeader";
import Loader from "../../../helpers/Loader";
import { Button } from "react-bootstrap";
import axios from "axios";
import { urlApi } from "../../../helpers/utils";

function DepartmentCrudPage() {
    const module = "Plan de carrière";
    const action = "Création";
    const url = "/carriere";

    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [data, setData] = useState([]);
    const [formData, setFormData] = useState({ name: "", photo: null });

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setIsLoading(true);
        setError(null);
        try {
            const response = await axios.get(urlApi("/Department"));
            setData(response.data || []);
        } catch (err) {
            setError(`Erreur lors de la récupération des données : ${err.message}`);
        } finally {
            setIsLoading(false);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prevData) => ({ ...prevData, [name]: value }));
    };

    const handleFileChange = (e) => {
        setFormData((prevData) => ({ ...prevData, photo: e.target.files[0] }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);

        const form = new FormData();
        form.append("name", formData.name);
        if (formData.photo) {
            form.append("photo", formData.photo);
        }

        try {
            await axios.post(urlApi("/Department"), form);
            fetchData();
            setFormData({ name: "", photo: null });
        } catch (error) {
            setError(`Erreur lors de l'insertion : ${error.response?.data || error.message}`);
        } finally {
            setIsLoading(false);
        }
    };

    const handleDeleteConfirmed = async (departmentId) => {
        setIsLoading(true);
        setError(null);
        try {
            await axios.delete(urlApi(`/Department/${departmentId}`));
            fetchData();
        } catch (error) {
            setError(`Erreur lors de la suppression : ${error.message}`);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Template>
            <PageHeader module={module} action={action} url={url} />
            <h4>ENTITÉ DÉPARTEMENT</h4>
            {isLoading && <Loader />}
            {error && <div className="alert alert-danger">{error}</div>}
            <form className="forms-sample" onSubmit={handleSubmit}>
                <div className="row">            
                    <div className="col-md-6 grid-margin stretch-card">
                        <div className="card">
                            <div className="card-body">
                                <h5 className="card-title subtitle">Formulaire d'ajout</h5>
                                <div className="form-group">
                                    <label htmlFor="name">Nom du département</label>
                                    <input type="text" name="name" value={formData.name} onChange={handleChange} className="form-control" id="name" required />
                                </div>
                                <div className="form-group">
                                    <label>Photo du département</label>
                                    <input type="file" accept="image/*" onChange={handleFileChange} className="form-control" />
                                </div>
                                <div className="button-save-profil">
                                    <button type="submit" className="btn btn-success btn-fw" disabled={isLoading}>Créer</button>
                                    <button type="reset" className="btn btn-light btn-fw" onClick={() => setFormData({ name: "", photo: null })}>Annuler</button>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="col-md-6 grid-margin stretch-card">
                        <div className="card">
                            <div className="card-body">
                                <h5 className="card-title subtitle">Liste des départements</h5>
                                <table className="table table-hover table-bordered">
                                    <thead className="bg-primary text-white">
                                        <tr>
                                            <th>#</th>
                                            <th>Photo</th>
                                            <th>Nom</th>
                                            <th>Action</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {data.map((dept) => (
                                            <tr key={dept.departmentId}>
                                                <td className="text-center">{dept.departmentId}</td>
                                                <td>
                                                    {dept.photo ? (
                                                        <img src={urlApi(`/Department/photo/${dept.departmentId}`)} alt={'Departement '+dept.name} style={{ borderRadius: "5px", width: '70px', height: '70px' }} />
                                                    ) : (
                                                        "Pas de photo"
                                                    )}
                                                </td>
                                                <td>{dept.name}</td>
                                                <td>
                                                    <Button
                                                        onClick={() => handleDeleteConfirmed(dept.departmentId)}
                                                        className="btn btn-danger btn-sm"
                                                        style={{backgroundColor: 'white'}}
                                                    >
                                                        <i className="mdi mdi-delete icon-delete" style={{ fontSize: "20px" }}></i>
                                                    </Button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>                
            </form>
        </Template>
    );
}

export default DepartmentCrudPage;
