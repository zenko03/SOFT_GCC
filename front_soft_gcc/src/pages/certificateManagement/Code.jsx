import React, { useState } from "react";
import { Modal, Button, Form, Table, Card, Container } from "react-bootstrap";
import { FaPlus, FaTimes, FaCheck } from "react-icons/fa";

const TemplateManager = () => {
  const [templates, setTemplates] = useState([
    { id: 1, name: "Attestation Standard", language: "Français", preview: "Attestation pour {{Nom}} embauché le {{Date Embauche}}." },
    { id: 2, name: "Attestation Détail", language: "Anglais", preview: "Certificate for {{Name}}, hired on {{Hire Date}}." },
  ]);
  const [showModal, setShowModal] = useState(false);
  const [newTemplate, setNewTemplate] = useState({ name: "", content: "", language: "Français" });

  const handleCreateTemplate = () => {
    setTemplates([...templates, { id: templates.length + 1, ...newTemplate }]);
    setNewTemplate({ name: "", content: "", language: "Français" });
    setShowModal(false);
  };

  return (
    <Container className="mt-4">
      <Card className="p-4 shadow-sm border-0">
        <h2 className="mb-4 text-center">📌 Modèles d’attestations</h2>
        <div className="text-end mb-3">
          <Button variant="success" onClick={() => setShowModal(true)}>
            <FaPlus /> Créer un modèle
          </Button>
        </div>
        
        {/* Liste des modèles */}
        <Table striped bordered hover responsive className="mt-3">
          <thead className="table-dark">
            <tr>
              <th>Nom du modèle</th>
              <th>Langue</th>
              <th>Aperçu</th>
            </tr>
          </thead>
          <tbody>
            {templates.map((template) => (
              <tr key={template.id}>
                <td>{template.name}</td>
                <td>{template.language}</td>
                <td>{template.preview}</td>
              </tr>
            ))}
          </tbody>
        </Table>
      </Card>
      
      {/* Modal de création de modèle */}
      <Modal show={showModal} onHide={() => setShowModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Créer un modèle</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Nom du modèle</Form.Label>
              <Form.Control
                type="text"
                placeholder="Nom du modèle"
                value={newTemplate.name}
                onChange={(e) => setNewTemplate({ ...newTemplate, name: e.target.value })}
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Contenu du modèle</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                placeholder="Contenu avec {{Nom}}, {{Date Embauche}}..."
                value={newTemplate.content}
                onChange={(e) => setNewTemplate({ ...newTemplate, content: e.target.value })}
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Langue</Form.Label>
              <Form.Select
                value={newTemplate.language}
                onChange={(e) => setNewTemplate({ ...newTemplate, language: e.target.value })}
              >
                <option value="Français">Français</option>
                <option value="Anglais">Anglais</option>
                <option value="Espagnol">Espagnol</option>
              </Form.Select>
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>
            <FaTimes /> Annuler
          </Button>
          <Button variant="success" onClick={handleCreateTemplate}>
            <FaCheck /> Enregistrer
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default TemplateManager;
