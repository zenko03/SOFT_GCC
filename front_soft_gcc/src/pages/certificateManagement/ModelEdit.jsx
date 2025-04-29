import React, { useState } from "react";
import Template from "../Template";
import Loader from "../../helpers/Loader";
import PageHeader from "../../components/PageHeader";
import Select from "react-select";
import Icon from "@mdi/react";
import { mdiPlus, mdiDelete, mdiEye, mdiFormatListBulleted } from "@mdi/js";
import { Form, Button, Card, Container, Row, Col, Dropdown } from "react-bootstrap";

// Page de la liste des modèles d'attestation crée
const ModelEdit = () => {
    // URL en tête de page 
    const module = 'Modèle attestation';
    const action = 'Liste';
    const url = '/modèle'; 

    // Initialisation des variables d'états
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);
    const [selectedLanguages, setSelectedLanguages] = useState([]);
    const [logoPreview, setLogoPreview] = useState(null);
    const [signaturePreview, setSignaturePreview] = useState(null);

  const handleSubmit = (e) => {
    e.preventDefault();
    alert("Langues sélectionnées : " + selectedLanguages.map((lang) => lang.label).join(", "));
  };

  const [sections, setSections] = useState([
      { id: 1, title: "Introduction", content: "Bienvenue {{Nom}}, aujourd’hui nous sommes le {{Date}}." },
    ]);
    const [variables] = useState(["Nom", "Prenom", "Date_embauche", "Poste", "Société", "Ancienneté"]);
    const [showPreview, setShowPreview] = useState(false);
  
    // Ajouter une nouvelle section
    const addSection = () => {
      setSections([...sections, { id: sections.length + 1, content: "" }]);
    };
  
    // Supprimer une section
    const removeSection = (id) => {
      setSections(sections.filter((section) => section.id !== id));
    };
  
    // Mettre à jour une section
    const updateSection = (id, key, value) => {
      setSections(
        sections.map((section) =>
          section.id === id ? { ...section, [key]: value } : section
        )
      );
    };
  
    // Insérer un champ dynamique dans le texte
    const insertVariable = (id, variable) => {
      setSections(
        sections.map((section) =>
          section.id === id
            ? { ...section, content: section.content + ` {{${variable}}}` }
            : section
        )
      );
    };
  
    const handleLogoChange = (e) => {
      const file = e.target.files[0];
      if (file) {
        setLogoPreview(URL.createObjectURL(file));
      }
    };
    
    const handleSignatureChange = (e) => {
      const file = e.target.files[0];
      if (file) {
        setSignaturePreview(URL.createObjectURL(file));
      }
    };

    const removeLogo = () => {
      setLogoPreview(null);
    };
    
    const removeSignature = () => {
      setSignaturePreview(null);
    };
    
    // Générer un aperçu avec les variables remplies
    /*const generatePreview = (content) => {
      return content.replace(/\{\{(.*?)\}\}/g, (_, key) => formData[key] || `{{${key}}}`);
    };*/

  return (
    <Template>
        {loading && <Loader />}
        <PageHeader module={module} action={action} url={url} />
        {error && <div className="alert alert-danger">{error}</div>}

        <div className="row header-title">
            <div className="col-lg-10 skill-header">
                <i className="mdi mdi-map-marker-path skill-icon"></i>
                <h4 className="skill-title">CREATION D'UN MODELE D'ATTESTATION</h4>
            </div>
        </div>

        <form className="forms-sample">
            <div className="row">            
                <div className="col-md-6 grid-margin stretch-card">
                    <div className="card">
                        <div className="card-body">
                            <div className="form-group">
                                <label htmlFor="exampleInputEmail1">Nom du modèle</label>
                                <input type="text" name="modelName" className="form-control" id="exampleInputEmail1"/>
                            </div>
                            <div className="form-group">
                              <label htmlFor="logoUpload">Ajouter un logo</label>
                              <input 
                                type="file" 
                                name="logo" 
                                className="form-control" 
                                id="logoUpload"
                                onChange={handleLogoChange} 
                              />
                              {logoPreview && (
                                <div className="mt-2">
                                  <img src={logoPreview} alt="Logo" style={{ width: '150px', objectFit: 'contain' }} />
                                  <Button variant="danger" size="sm" onClick={removeLogo} className="mt-2">
                                    Supprimer le logo
                                  </Button>
                                </div>
                              )}
                            </div>
                            <div className="form-group">
                              <label htmlFor="signatureUpload">Ajouter une signature</label>
                              <input 
                                type="file" 
                                name="signature" 
                                className="form-control" 
                                id="signatureUpload"
                                onChange={handleSignatureChange} 
                              />
                              {signaturePreview && (
                                <div className="mt-2">
                                  <img src={signaturePreview} alt="Signature" style={{ width: '150px', objectFit: 'contain' }} />
                                  <Button variant="danger" size="sm" onClick={removeSignature} className="mt-2">
                                    Supprimer la signature
                                  </Button>
                                </div>
                              )}
                            </div>

                            <div className="button-save-profil">
                                <button type="button" className="btn btn-success btn-fw">
                                    <i className="mdi mdi-content-save-edit" style={{paddingRight: '5px'}}></i>Enregistrer
                                </button>
                                <button type="button" className="btn btn-info btn-fw">
                                    <i className="mdi mdi-file-eye" style={{paddingRight: '5px'}}></i>Aperçu
                                </button>
                                <button type="button" className="btn btn-primary btn-fw">
                                    <i className="mdi mdi-file-export" style={{paddingRight: '5px'}}></i>Export pdf
                                </button>
                                <button type="button" className="btn btn-light btn-fw">
                                    <i className="mdi mdi-arrow-left-circle" style={{paddingRight: '5px'}}></i>
                                    Retour
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="col-md-6 grid-margin stretch-card">
                  <Card className="mb-3 shadow-sm p-3">
                    <Row>
                    {sections.map((section) => (
                      <>
                        <Col md={6}>
                          <Form.Group  key={section.id}>
                            <Form.Label>Contenu {section.id}</Form.Label>
                            <Form.Control
                              as="textarea"
                              rows={2}
                              value={section.content}
                              onChange={(e) => updateSection(section.id, "content", e.target.value)}
                            />
                          </Form.Group>

                          </Col>
                          <Col md={2} className="d-flex align-items-end gap-2">
                            <Dropdown onSelect={(variable) => insertVariable(section.id, variable)}>
                              <Dropdown.Toggle variant="secondary">
                                <Icon path={mdiFormatListBulleted} size={1} className="me-2" />
                                Ajouter champ
                              </Dropdown.Toggle>
                              <Dropdown.Menu>
                                {variables.map((variable) => (
                                  <Dropdown.Item key={variable} eventKey={variable}>
                                    {variable}
                                  </Dropdown.Item>
                                ))}
                              </Dropdown.Menu>
                            </Dropdown>
                            <Button variant="danger" onClick={() => removeSection(section.id)}>
                              <Icon path={mdiDelete} size={1} />
                            </Button>
                          </Col>
                      </>
                      
                      ))}
Nous, Société , attestons par la présente que Monsieur Joss Elito travaille avec un contrat
à durée indéterminée, au sein de notre établissement en qualité de :
• Développeur depuis le le 8 mars 2025 à ce jour
Monsieur Joss Elito n'est actuellement ni démissionnaire ni en procédure de licenciement.
En foi de quoi, la présente attestation lui est délivrée pour servir et valoir ce que de droit.

                     
                       {/* Boutons d'action */}
                       <div className="mt-3 d-flex gap-2">
                        <Button variant="success" onClick={addSection}>
                          <Icon path={mdiPlus} size={1} className="me-2" />
                          Ajouter une section
                        </Button>
                
                        <Button variant="info" onClick={() => setShowPreview(true)}>
                          <Icon path={mdiEye} size={1} className="me-2" />
                          Voir l'aperçu
                        </Button>
                      </div>
                    </Row>
                  </Card>
                </div>
            </div>
            <div className="container mt-4">                     
                      {/* Aperçu du contenu */}
                      {showPreview && (
                        <Card className="mt-4 p-3 shadow-sm">
                          {logoPreview && (
                            <div className="mb-3 text-start">
                              <img src={logoPreview} alt="Logo" style={{ width: '150px', objectFit: 'contain' }} />
                            </div>
                          )}

                          <h2 className="text-center fw-bold">Attestation de travail</h2>

                          {sections.map((section) => (
                            <div key={section.id} className="mb-3">
                              <p>{section.content}</p>
                            </div>
                          ))}
                          <div className="mt-5 text-end">
                            <p>Antananarivo,</p>
                            <p>La Directrice Administrative et Financière</p>
                          </div>
                          <div className="mt-5 text-start">
                            <p><strong>Motif : Admnistratif</strong></p>
                          </div>
                          {signaturePreview && (
                            <div className="mt-5 text-end">
                              <img src={signaturePreview} alt="Signature" style={{ width: '150px', objectFit: 'contain' }} />
                              <p><strong>RAMAMONJISOA Voahangy Lalao</strong></p>
                            </div>
                          )}
                        </Card>
                      )}
            </div>
        </form>
    </Template>
  );
};

export default ModelEdit;
