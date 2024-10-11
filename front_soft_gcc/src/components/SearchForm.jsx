import React from 'react';

function SearchForm({ task }) {
  return (
    <form class="forms-sample">
        <div class="form-group row">
            <div class="col-sm-4">
                <input type="text" class="form-control" id="exampleInputUsername2" placeholder="Nom, prenom ou matricule" />
            </div>
            <div class="col-sm-5">
                <button type="submit" class="btn btn-primary">Rechercher</button>
            </div>
        </div>
    </form>
  );
}

export default SearchForm;
