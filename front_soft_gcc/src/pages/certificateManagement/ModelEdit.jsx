import axios from 'axios';
import React, { useState, useRef } from "react";
import Icon from "@mdi/react";
import {
  mdiPlus,
  mdiDelete,
  mdiEye,
  mdiFormatListBulleted,
  mdiInformationOutline,
  mdiOfficeBuilding,
  mdiFileDocumentEdit,
  mdiEmailFastOutline,
  mdiFileExportOutline,
  mdiArrowLeft
} from "@mdi/js";
import {
  Form,
  Button,
  Card,
  Container,
  Row,
  Col,
  Dropdown,
  Alert,
} from "react-bootstrap";
import html2pdf from "html2pdf.js";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import { motion, AnimatePresence } from "framer-motion";
import DateDisplayNoTime from "../../helpers/DateDisplayNoTime";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { QRCodeSVG } from "qrcode.react";
import { urlApi } from '../../helpers/utils';
import { faCertificate } from '@fortawesome/free-solid-svg-icons';

// Formattage de date
const formatDateFr = (isoDate) => {
  if (!isoDate) return "";
  const parsed = new Date(isoDate);
  if (isNaN(parsed.getTime())) return "Date invalide";
  return format(parsed, "dd MMMM yyyy", { locale: fr });
};


const ModelEdit = ({ dataEmployee }) => {
  const [logoPreview, setLogoPreview] = useState(null);
  const [signaturePreview, setSignaturePreview] = useState(null);
  const [file, setFile] = useState(null);
  const [sections, setSections] = useState([
    {
      id: 1,
      title: "Introduction",
      content:
        "Nous, Société {{Société}}, attestons par la présente que {{Civilité}} {{Nom}} {{Prenom}} travaille avec un contrat à durée indéterminée, au sein de notre établissement en qualité de {{Poste}} dépuis le {{Date_embauche}} {{Civilité}} {{Nom}} {{Prenom}} n'est actuellement ni démissionnaire ni en procédure de licenciement. En foi de quoi, la présente attestation lui est délivrée pour servir et valoir ce que de droit.",
    },
  ]);
  const [variables] = useState([
    "Nom",
    "Prenom",
    "Date_embauche",
    "Poste",
    "Société",
    "Ancienneté",
  ]);
  const [showPreview, setShowPreview] = useState(false);

  const [companyInfo, setCompanyInfo] = useState({
    nom: "",
    adresse: "",
    telephone: "",
    email: "",
    site: "",
    reseaux: "",
  });

  const [aboutModel, setAboutModel] = useState({
    reference: "",
    place: "",
    signatoryPosition: "",
    reason: "",
    signatoryName: "",
    date: ""
  });

  const previewRef = useRef(); // Référence pour l'export PDF

  const attestationId = "ATT-" + new Date().getTime(); // Simulé
  const qrValue = `https://monentreprise.com/verify?id=${attestationId}`; // lien de vérification

  const addSection = () => {
    setSections([...sections, { id: sections.length + 1, content: "" }]);
  };

  const removeSection = (id) => {
    setSections(sections.filter((section) => section.id !== id));
  };

  const updateSection = (id, key, value) => {
    setSections(
      sections.map((section) =>
        section.id === id ? { ...section, [key]: value } : section
      )
    );
  };

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
    if (file) setLogoPreview(URL.createObjectURL(file));
  };

  const removeLogo = () => setLogoPreview(null);

  const handleExportPDF = () => {
    if (!showPreview) {
      setShowPreview(true);
      // attendre que le DOM soit prêt avant l’export
      console.log("loading");
      setTimeout(() => exportPDF(), 500);
    } else {
            console.log("loading 14");
      exportPDF();
                  console.log("sara be");
    }
  };

  const exportPDF = () => {
    if (previewRef.current) {
      const opt = {
        margin: 0.5,
        filename: "attestation.pdf",
        image: { type: "jpeg", quality: 0.98 },
        html2canvas: { scale: 2 },
        jsPDF: { unit: "in", format: "a4", orientation: "portrait" },
      };

      html2pdf()
        .set(opt)
        .from(previewRef.current)
        .outputPdf('blob')
        .then((blob) => {
          const file = new File([blob], "attestation.pdf", {
            type: "application/pdf",
          });
          handleUpload(file);
        });
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setAboutModel((prevData) => ({
        ...prevData,
        [name]: value === "" ? null : value,
    }));
  };

  const replaceVariables = (text) => {
    if (!dataEmployee) return text;
  
    const mapping = {
      Nom: dataEmployee.name || "",
      Prenom: dataEmployee.firstName || "",
      Date_embauche: formatDateFr(dataEmployee.hiringDate),
      Poste: dataEmployee.positionName || "",
      Société: companyInfo.nom || "",
      Ancienneté: dataEmployee.anciennete || "",
      Civilité: dataEmployee.civiliteName || "",
    };
  
    return text.replace(/{{(.*?)}}/g, (_, key) => mapping[key.trim()] || "");
  };

  // Upload pdf de l'attestation de travail
  const handleUpload = async (file) => {
    if (!file || !dataEmployee?.id) return;

    const formData = new FormData();
    formData.append('file', file);
    formData.append('registrationNumber', dataEmployee.registrationNumber);
    formData.append('certificateYprId', 1);
    formData.append('reference', 'REF');

    try {
      await axios.post(urlApi('Certificate/Save'), formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      alert('PDF exporté et enregistré avec succès.');
    } catch (err) {
      console.error(err);
      alert('Erreur lors de l’upload du PDF.');
    }
  };
  
  return (
      <Container fluid>
        <h4 className="mb-4 fw-bold">Géneration du document d'attestation</h4>
        <Form>
          <Row>
            <Col md={6}>
              {/* Bloc gauche */}
              <Card className="mb-4 shadow-sm">
                <Card.Body>
                  <h5 className="fw-semibold mb-3">
                    <Icon path={mdiFileDocumentEdit} size={1} className="me-2" />
                    À propos du modèle
                  </h5>
                  <Form.Group className="mb-3">
                    <Form.Label>Réference</Form.Label>
                    <Form.Control type="text" name="reference" value={aboutModel.reference} onChange={handleChange} />
                  </Form.Group>
                  <Form.Group className="mb-3">
                    <Form.Label>Fait à</Form.Label>
                    <Form.Control type="text" name="place" placeholder="Antananarivo" value={aboutModel.place} onChange={handleChange} />
                  </Form.Group>
                  <Form.Group className="mb-3">
                    <Form.Label>Le</Form.Label>
                    <Form.Control type="date" name="date" placeholder="date de soumission" value={aboutModel.date} onChange={handleChange} />
                  </Form.Group>
                  <Form.Group className="mb-3">
                    <Form.Label>Par</Form.Label>
                    <Form.Control type="text" name="signatoryPosition" placeholder="Le Directeur géneral" value={aboutModel.signatoryPosition} onChange={handleChange} />
                  </Form.Group>
                  <Form.Group className="mb-3">
                    <Form.Label>Motif</Form.Label>
                    <Form.Control type="text" name="reason" placeholder="Administratif" value={aboutModel.reason} onChange={handleChange} />
                  </Form.Group>
                  <Form.Group className="mb-3">
                    <Form.Label>Ajouter un logo</Form.Label>
                    <Form.Control type="file" onChange={handleLogoChange} />
                    {logoPreview && (
                      <div className="mt-2">
                        <img
                          src={logoPreview}
                          alt="Logo"
                          style={{ width: "150px", objectFit: "contain" }}
                        />
                        <Button
                          variant="outline-danger"
                          size="sm"
                          onClick={removeLogo}
                          className="mt-2"
                        >
                          Supprimer
                        </Button>
                      </div>
                    )}
                  </Form.Group>

                  <Form.Group className="mb-3">
                    <Form.Label>Le signataire</Form.Label>
                    <Form.Control type="text" name="signatoryName" placeholder="Nom complet" value={aboutModel.signatoryName} onChange={handleChange} />
                  </Form.Group>
                </Card.Body>
              </Card>

              <Card className="mb-4 shadow-sm">
                <Card.Body>
                  <h5 className="fw-semibold mb-3">
                    <Icon path={mdiOfficeBuilding} size={1} className="me-2" />
                    Informations sur l'entreprise délivrant
                  </h5>

                  {[
                    { label: "Nom de l'entreprise", key: "nom" },
                    { label: "Adresse", key: "adresse" },
                    { label: "Téléphone", key: "telephone" },
                    { label: "Email", key: "email" },
                    { label: "Site web", key: "site" },
                    { label: "Réseaux sociaux", key: "reseaux" },
                  ].map(({ label, key }, index) => (
                    <Form.Group className="mb-3" key={index}>
                      <Form.Label>{label}</Form.Label>
                      <Form.Control
                        type="text"
                        placeholder={label}
                        value={companyInfo[key]}
                        onChange={(e) =>
                          setCompanyInfo({
                            ...companyInfo,
                            [key]: e.target.value,
                          })
                        }
                      />
                    </Form.Group>
                  ))}
                </Card.Body>
              </Card>

              <Card className="mb-4 shadow-sm">
                <Card.Body>
                  <h5 className="fw-semibold mb-3">
                    <Icon path={mdiInformationOutline} size={1} className="me-2" />
                    Contenu dynamique
                  </h5>

                  {sections.map((section) => (
                    <Card className="mb-3" key={section.id}>
                      <Card.Body>
                        <Row className="align-items-start">
                          <Col md={10}>
                            <Form.Group>
                              <Form.Label>Contenu {section.id}</Form.Label>
                              <ReactQuill
                                theme="snow"
                                value={section.content}
                                onChange={(value) =>
                                  updateSection(section.id, "content", value)
                                }
                                modules={{
                                  toolbar: [
                                    [{ header: [1, 2, false] }],
                                    ["bold", "italic", "underline"],
                                    ["link"],
                                    [{ list: "ordered" }, { list: "bullet" }],
                                    ["clean"],
                                  ],
                                }}
                                className="bg-white"
                              />
                            </Form.Group>
                          </Col>
                          <Col
                            md={2}
                            className="d-flex flex-column gap-2 justify-content-end"
                          >
                            <Dropdown
                              onSelect={(variable) =>
                                insertVariable(section.id, variable)
                              }
                            >
                              <Dropdown.Toggle
                                variant="outline-primary"
                                size="sm"
                              >
                                <Icon
                                  path={mdiFormatListBulleted}
                                  size={0.8}
                                  className="me-1"
                                />{" "}
                                Champ
                              </Dropdown.Toggle>
                              <Dropdown.Menu>
                                {variables.map((v) => (
                                  <Dropdown.Item key={v} eventKey={v}>
                                    {v}
                                  </Dropdown.Item>
                                ))}
                              </Dropdown.Menu>
                            </Dropdown>
                            <Button
                              variant="outline-danger"
                              size="sm"
                              onClick={() => removeSection(section.id)}
                            >
                              <Icon path={mdiDelete} size={0.8} />
                            </Button>
                          </Col>
                        </Row>
                      </Card.Body>
                    </Card>
                  ))}

                  <div className="d-flex gap-2 mt-3">
                    <Button variant="success" onClick={addSection}>
                      <Icon path={mdiPlus} size={1} className="me-2" /> Ajouter
                      une section
                    </Button>
                    <Button
                      variant="info"
                      onClick={() => setShowPreview(true)}
                    >
                      <Icon path={mdiEye} size={1} className="me-2" /> Voir
                      l'aperçu
                    </Button>
                  </div>
                </Card.Body>
              </Card>

              <div className="d-flex flex-wrap gap-2">
                <Button variant="success">
                  <Icon path={mdiEmailFastOutline} size={1} className="me-2" />
                  Envoyer par email
                </Button>
                <Button variant="primary" onClick={handleExportPDF}>
                  <Icon path={mdiFileExportOutline} size={1} className="me-2" />
                  Export PDF
                </Button>
                <Button variant="light">
                  <Icon path={mdiArrowLeft} size={1} className="me-2" />
                  Retour
                </Button>
              </div>
            </Col>

            {/* Aperçu PDF */}
            <Col md={6}>
              <AnimatePresence>
                {showPreview && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 20 }}
                    transition={{ duration: 0.4 }}
                  >
                    <Card className="p-4 shadow-sm mt-4" ref={previewRef}>
                      {logoPreview && (
                        <div className="mb-3 text-start">
                          <img
                            src={logoPreview}
                            alt="Logo"
                            style={{ width: "150px", objectFit: "contain" }}
                          />
                        </div>
                      )}

                      <p className="text-center fw-bold" style={{fontSize: '30px'}}>
                        <b>ATTESTATION DE TRAVAIL</b>
                      </p>
                      <p className="text-center">
                        <strong style={{textDecoration: 'underline'}}>Ref </strong>: {aboutModel.reference}
                      </p>
                      {sections.map((section) => (
                        <div
                          key={section.id}
                          className="mb-3"
                          dangerouslySetInnerHTML={{
                            __html: replaceVariables(section.content),
                          }}
                        />
                      ))}

                      <Row>
                        <Col md={6}>
                          <div className="mt-4 text-start">
                            <p>
                              <strong style={{textDecoration: 'underline'}}>Motif </strong>: <strong>{aboutModel.reason}</strong>
                            </p>
                          </div>
                          <div className="text-md-end mt-4">
                            <QRCodeSVG value={qrValue} size={100} />
                          </div>
                        </Col>
                        <Col md={6} className="text-md-end">
                          <div className="mt-5 text-end">
                            <p>Fait à <strong>{aboutModel.place}</strong>, le <strong><DateDisplayNoTime isoDate={aboutModel.date} /></strong></p>
                            <p><strong>{aboutModel.signatoryPosition}</strong></p>
                          </div>
                          <div className="mt-5 text-end" style={{paddingTop: '50px'}}>
                            <p>
                              <strong>{aboutModel.signatoryName}</strong>
                            </p>
                          </div>
                        </Col>
                      </Row>                      
                      

                      <footer className="pt-5 text-muted small">
                        <Row style={{background: '#e6e9ed', padding: '50px'}}>
                          <Col md={6}>
                            <p className="mb-1">
                              <strong>Adresse :</strong>{" "}
                              {companyInfo.adresse || "..."}
                            </p>
                            <p className="mb-1">
                              <strong>Téléphone :</strong>{" "}
                              {companyInfo.telephone || "..."}
                            </p>
                            <p className="mb-1">
                              <strong>Email :</strong>{" "}
                              {companyInfo.email || "..."}
                            </p>
                          </Col>
                          <Col md={6} className="text-md-end">
                            <p className="mb-1">
                              <strong>Site web :</strong>{" "}
                              {companyInfo.site || "..."}
                            </p>
                            <p className="mb-1">
                              <strong>Réseaux sociaux :</strong>{" "}
                              {companyInfo.reseaux || "..."}
                            </p>
                          </Col>
                        </Row>
                      </footer>
                    </Card>
                  </motion.div>
                )}
              </AnimatePresence>
            </Col>
          </Row>
        </Form>
      </Container>
  );
};

export default ModelEdit;
