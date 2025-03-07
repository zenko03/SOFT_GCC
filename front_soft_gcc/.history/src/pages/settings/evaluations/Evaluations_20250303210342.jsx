import Template from "../../Template";

function Evaluations(){
    return(
        <Template>
            <h4>ENTITÉ TYPE D'AFFECTATION</h4>
            <form className="forms-sample" >
                <div className="row">            
                    <div className="col-md-6 grid-margin stretch-card">
                        <div className="card">
                            <div className="card-body">
                                <h5 className="card-title subtitle">Formulaire d'ajout</h5>
                                <div className="form-group">
                                    <label htmlFor="name">Désignation</label>
                                    {/* <input type="text" name="assignmentTypeName" value={formData.assignmentTypeName} onChange={handleChange} className="form-control" id="name" required /> */}
                                </div>
                                <div className="button-save-profil">
                                    <button type="submit" className="btn btn-success btn-fw" >Créer</button>
                                    <button type="reset" className="btn btn-light btn-fw" >Annuler</button>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="col-md-6 grid-margin stretch-card">
                        <div className="card">
                            <div className="card-body">
                                <h5 className="card-title subtitle">Liste enregistrée</h5>
                                <table className="table table-hover table-bordered">
                                    <thead className="bg-primary text-white">
                                        <tr>
                                            <th>#</th>
                                            <th>Désignation</th>
                                            <th>Action</th>
                                        </tr>
                                    </thead>
                                    {/* <tbody>
                                        {data.map((item, id) => (
                                            <tr key={item.assignmentTypeId}>
                                                <td className="text-center">{item.assignmentTypeId}</td>
                                                <td>{item.assignmentTypeName}</td>
                                                <td>
                                                    <Button
                                                        onClick={() => handleDeleteConfirmed(item.assignmentTypeId)}
                                                        className="btn btn-danger btn-sm"
                                                        style={{backgroundColor: 'white'}}
                                                    >
                                                        <i className="mdi mdi-delete icon-delete" 
                                                        style={{fontSize: '20px'}}></i>
                                                    </Button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody> */}
                                </table>
                            </div>
                        </div>
                    </div>
                </div>                
            </form>
        </Template>
    );
}
export default Evaluations;