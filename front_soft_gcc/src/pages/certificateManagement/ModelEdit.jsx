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

    const options = [
        { value: "{nom}", label: "Nom" },
        { value: "{prenom}", label: "Prenom" },
        { value: "{date_embauche}", label: "Date embauche" },
        { value: "{position}", label: "Poste" },
        { value: "{anciennete}", label: "Ancienneté" },
      ];

      const [selectedLanguages, setSelectedLanguages] = useState([]);

  const handleSubmit = (e) => {
    e.preventDefault();
    alert("Langues sélectionnées : " + selectedLanguages.map((lang) => lang.label).join(", "));
  };

  const [sections, setSections] = useState([
      { id: 1, title: "Introduction", content: "Bienvenue {{Nom}}, aujourd’hui nous sommes le {{Date}}." },
    ]);
    const [variables] = useState(["Nom", "Date", "Poste", "Société"]);
    const [formData, setFormData] = useState({ Nom: "Jean Dupont", Date: "02/04/2025", Poste: "Développeur", Société: "TechCorp" });
    const [showPreview, setShowPreview] = useState(false);
  
    // Ajouter une nouvelle section
    const addSection = () => {
      setSections([...sections, { id: sections.length + 1, title: "", content: "" }]);
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
  
    // Générer un aperçu avec les variables remplies
    const generatePreview = (content) => {
      return content.replace(/\{\{(.*?)\}\}/g, (_, key) => formData[key] || `{{${key}}}`);
    };

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
                                <label htmlFor="exampleInputEmail1">Contenu dynamique du modèle</label>
                                <Select
                                    options={options}
                                    isMulti
                                    className="basic-multi-select"
                                    classNamePrefix="select"
                                    placeholder="Choisissez des langues..."
                                    value={selectedLanguages}
                                    onChange={setSelectedLanguages}
                                />
                            </div>
                            <div className="form-group">
                                <label htmlFor="exampleInputEmail1">Ajouter un logo</label>
                                <input type="file" name="logo" className="form-control" id="exampleInputEmail1"/>
                            </div>
                            <div className="form-group">
                                <label htmlFor="exampleInputEmail1">Insértion de la signature personnalisée</label>
                                <input type="file" name="sgnature" className="form-control" id="exampleInputEmail1"/>
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
            </div>
                
                <div className="container mt-4">
                      <h2>📌 Gestion de contenu dynamique</h2>
                
                      {sections.map((section) => (
                        <Card key={section.id} className="mb-3 shadow-sm p-3">
                          <Row>
                            <Col md={4}>
                              <Form.Group>
                                <Form.Label>Titre</Form.Label>
                                <Form.Control
                                  type="text"
                                  value={section.title}
                                  onChange={(e) => updateSection(section.id, "title", e.target.value)}
                                />
                              </Form.Group>
                            </Col>
                            <Col md={6}>
                              <Form.Group>
                                <Form.Label>Contenu</Form.Label>
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
                          </Row>
                        </Card>
                      ))}
                
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
                
                      {/* Aperçu du contenu */}
                      {showPreview && (
                        <Card className="mt-4 p-3 shadow-sm">
                          <h4>Aperçu du document</h4>
                          {sections.map((section) => (
                            <div key={section.id} className="mb-3">
                              <h5>{section.title || "Titre vide"}</h5>
                              <p>{generatePreview(section.content)}</p>
                            </div>
                          ))}
                        </Card>
                      )}
                    </div>

        </form>
    </Template>
  );
};

export default ModelEdit;
