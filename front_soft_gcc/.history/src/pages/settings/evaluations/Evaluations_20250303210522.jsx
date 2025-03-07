import Template from "../../Template";

function Evaluations(){
    return(
        <Template>
          
            <div className='row'>
                <h2 className="card-title">Paramètre des carrières</h2>                
            </div>

            <div className="row">
                    <div  className="col-lg-3 grid-margin stretch-card">
                        <div onClick={() => (handleCrudPage(item))} className="card" style={{backgroundColor: '#0062ff'}}>
                            <div className="card-body"> 
                                <h5 className="card-title">
                                    <span>{item.crudName}</span> 
                                </h5>
                            </div>
                        </div>
                    </div>
            
            </div>        
        </Template>
    );
}
export default Evaluations;