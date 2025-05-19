import axios from 'axios';
import React, { useState, useRef, useEffect } from "react";
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
  mdiArrowLeft,
  mdiCheckCircle,
  mdiAlertCircle,
  mdiCancel
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
import Loader from '../../helpers/Loader';
import FormattedDate from '../../helpers/FormattedDate';

// Formattage de date
const formatDateFr = (isoDate) => {
  if (!isoDate) return "";
  const parsed = new Date(isoDate);
  if (isNaN(parsed.getTime())) return "Date invalide";
  return format(parsed, "dd MMMM yyyy", { locale: fr });
};

function genererNouvelleReference(attestations) {
  const dateDuJour = new Date();
  const annee = dateDuJour.getFullYear();
  const mois = String(dateDuJour.getMonth() + 1).padStart(2, '0');
  const jour = String(dateDuJour.getDate()).padStart(2, '0');
  const heures = String(dateDuJour.getHours()).padStart(2, '0');
  const minutes = String(dateDuJour.getMinutes()).padStart(2, '0');
  const secondes = String(dateDuJour.getSeconds()).padStart(2, '0');
  const dateStr = `${annee}${mois}${jour}-${heures}${minutes}${secondes}`;
  let prochainCompteur = '';
  if(attestations.length == 0) {
    prochainCompteur = `0RF01`;

  } else {
    prochainCompteur = `0RF0${attestations[attestations.length-1].id+1}`;
  }

  return `ATT-${dateStr}-${prochainCompteur}`;
}

const fileToBase64 = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      const base64 = reader.result.split(',')[1]; // Enlever "data:application/pdf;base64,"
      resolve(base64);
    };
    reader.onerror = (error) => reject(error);
  });
};

const sendAttestationEmail = async ({ recipientEmail, subject, body, file }) => {
  try {
    const base64Pdf = await fileToBase64(file); 
    const payload = {
      recipientEmail,
      subject,
      body,
      fileName: file.name,
      base64Pdf,
    };

    const response = await axios.post(urlApi('/Email/send-pdf'), payload);
    console.log('Email envoyé :', response.data);
    return response.data;
  } catch (error) {
    console.error('Erreur lors de l’envoi :', error);
    throw error;
  }
};

const ModelEdit = ({ dataEmployee }) => {
  const [logoPreview, setLogoPreview] = useState(null);
  const [signaturePreview, setSignaturePreview] = useState(null);
  const [isLoading, setIsLoading] = useState(false); 
  const [error, setError] = useState(false); 
  const [errorUpload, setErrorUpload] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [uploading, setUploading] = useState(false);

  // Variables d'état pour l'envoi par email
  const [email, setEmail] = useState('');
  const [file, setFile] = useState(null);
  const [sending, setSending] = useState(false);
  const [sendError, setSendError] = useState(null);
  const [sendSuccess, setSendSuccess] = useState(false);


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
    date: "",
    entreprise: 0,
    certificateType: 0,
    certificateTypeName: ""
  });

  const previewRef = useRef(); // Référence pour l'export PDF

  // Appel api pour les donnees du formulaire
  const [certificates, setCertificates] = useState([]); 
  const [employeeEstablishment, setEmployeeEstablishment] = useState({}); 
  const [certificateTypes, setCertificateTypes] = useState([]);

  // Chargement des donnees depuis l'api 
  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [allCertificatesResponse, employeeEstablishmentResponse, certificateTypesResponse] = await Promise.all([
        axios.get(urlApi(`/CareerPlan/Certificate/GetAll`)),
        axios.get(urlApi(`/Establishment/${dataEmployee.establishmentId}`)),
        axios.get(urlApi(`/CertificateType`))
      ]);

      setCertificates(allCertificatesResponse.data || []);
      setEmployeeEstablishment(employeeEstablishmentResponse.data);
      setCertificateTypes(certificateTypesResponse.data);

      const nouvelleRef = genererNouvelleReference(allCertificatesResponse.data);
      setAboutModel(prev => ({
        ...prev,
        reference: nouvelleRef
      }));
      setCompanyInfo({
        nom: employeeEstablishmentResponse.data.establishmentName || "",
        adresse: employeeEstablishmentResponse.data.address || "",
        telephone: employeeEstablishmentResponse.data.phoneNumber || "",
        email: employeeEstablishmentResponse.data.email || "",
        site: employeeEstablishmentResponse.data.website || "",
        reseaux: employeeEstablishmentResponse.data.socialMedia || ""
      });
      setError(false);
    } catch (error) {
      setError(`Erreur lors de la recuperation des donnees : ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [dataEmployee]);

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
          // Télécharger localement
          html2pdf().set(opt).from(previewRef.current).save();

          // Créer un fichier nommé
          const file = new File([blob], `Attestation_${aboutModel.reference}.pdf`, { type: "application/pdf" });

          // Uploader avec un nom correct
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

  // Fonction qui gère le changement dans la liste déroulante
  const handleSelectChange = async (event) => {
    const selectedId = event.target.value;
    handleChange(event); // si vous avez d'autres effets à gérer

    if (selectedId) {
      setIsLoading(true);
      try {
        const response = await fetch(urlApi(`/certificateType/${selectedId}`));
        const data = await response.json();

        // Ici vous mettez à jour l’état avec les données du certificat sélectionné
        setAboutModel((prev) => ({
          ...prev,
          certificateType: selectedId,
          certificateTypeName: data.certificateTypeName || [],
        }));
        console.log(response);
        console.log(data);
        console.log(aboutModel.certificateTypeName);
      } catch (error) {
        setError(`Erreur lors du chargement du type d'attestation : ${error.message}`);
        console.error("Erreur lors du chargement du type d'attestation :", error);
      } finally {
        setIsLoading(false);
      }
    }
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
    if (!file || !dataEmployee?.registrationNumber) return;

    const formData = new FormData();
    formData.append('file', file);
    formData.append('registrationNumber', dataEmployee.registrationNumber);
    formData.append('certificateTypeId', aboutModel.certificateType);
    formData.append('reference', aboutModel.reference);
    console.log(formData);
    setUploading(true);
    try {
      await axios.post(urlApi('/CareerPlan/Certificate/Save'), formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setUploadSuccess('PDF exporté et enregistré avec succès.');
      setErrorUpload(false);
      setSendError(null);
      setError(false);
    } catch (err) {
      if (err.response?.status === 409) {
        setErrorUpload("Erreur lors de l'upload du fichier pdf : référence déjà utilisée pour une autre attestation.")
      } else if (err.response?.status === 400) {
        setErrorUpload("Erreur lors de l'upload du fichier pdf : Fichier invalide.")
      } else {
        setErrorUpload("Erreur lors de l'enregistrement. Veuillez réessayer plus tard.");
      }
    } finally {
        setUploading(false);
    }
  };

  useEffect(() => {
    if (uploadSuccess) {
      const timer = setTimeout(() => {
        setUploadSuccess(false);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [uploadSuccess]);

  useEffect(() => {
    if (sendSuccess) {
      const timer = setTimeout(() => {
        setSendSuccess(false);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [sendSuccess]);

  const handleSend = async () => {
    setSending(true);
    setSendError(null);
    setSendSuccess(false);

    try {
      if (previewRef.current) {
        const opt = {
          margin: 0.5,
          filename: "attestation.pdf",
          image: { type: "jpeg", quality: 0.98 },
          html2canvas: { scale: 2 },
          jsPDF: { unit: "in", format: "a4", orientation: "portrait" },
        };

        // Attendre correctement la génération du PDF en tant que Blob
        const blob = await html2pdf()
          .set(opt)
          .from(previewRef.current)
          .outputPdf('blob');

        const generatedFile = new File([blob], `Attestation_${aboutModel.reference}.pdf`, {
          type: "application/pdf",
        });

        // Utiliser une valeur valide d’email ici (optionnel, tu peux mettre un champ si nécessaire)
        const recipient = email || 'chalmaninssa1962002@gmail.com';

        handleUpload(generatedFile);

        if(errorUpload) {
          setSendError("Échec de l’envoi email");
        } else {
           await sendAttestationEmail({
            recipientEmail: recipient,
            subject: 'Votre attestation de travail',
            body: '<p>Bonjour,<br/>Veuillez trouver ci-joint votre attestation de travail.</p>',
            file: generatedFile,
          });

          setSendSuccess(true);
          setSendError(null);
          setError(false);
        }
      }
    } catch (error) {
      if (err.response?.status === 409) {
        setErrorUpload("Erreur lors de l'upload du fichier pdf : référence déjà utilisée pour une autre attestation.")
      } else if (err.response?.status === 400) {
        setErrorUpload("Erreur lors de l'upload du fichier pdf : Fichier invalide.")
      } else {
        setErrorUpload("Erreur lors de l'enregistrement. Veuillez réessayer plus tard.");
      }
      console.error("Erreur lors de l'envoi de l'email :", error);
      setSendError("Échec de l’envoi. Veuillez vérifier l’adresse e-mail ou réessayer plus tard.");

    } finally {
      setSending(false);
    }
  };


  
  return (
      <Container fluid>
        <h4 className="mb-4 fw-bold">Géneration du document d'attestation</h4>
        <p>{aboutModel.date}</p>
        {isLoading && <Loader />}
        {error && <div className="alert alert-danger">{error}</div>}
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
                    <Form.Label>Type d'attestation</Form.Label>
                    <select name="certificateType" value={aboutModel.certificateType} onChange={handleSelectChange} className="form-control" id="exampleSelectGender">
                      <option value="">Sélectionner le type</option>
                        {certificateTypes && certificateTypes.map((item, id) => (
                          <option key={id} value={item.certificateTypeId}>
                            {item.certificateTypeName}
                          </option>
                        ))}
                    </select>                     
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
                          <Col md={2} className="d-flex flex-column align-items-stretch gap-2 justify-content-start pt-1">
                            <Dropdown onSelect={(variable) => insertVariable(section.id, variable)}>
                              <Dropdown.Toggle
                                variant="outline-primary"
                                size="sm"
                                className="rounded-3 shadow-sm d-flex align-items-center justify-content-center"
                              >
                                <Icon path={mdiFormatListBulleted} size={0.75} className="me-1" />
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
                              className="rounded-3 shadow-sm d-flex align-items-center justify-content-center"
                            >
                              <Icon path={mdiDelete} size={0.75} />
                            </Button>
                          </Col>
                        </Row>
                      </Card.Body>
                    </Card>
                  ))}
                  <div className="mt-4">
                    <Row className="g-3">
                      <Col xs={12} md="auto">
                        <Button variant="outline-success" onClick={addSection} className="w-100 shadow-sm rounded-3 px-4">
                          <Icon path={mdiPlus} size={0.9} className="me-2" />
                          Ajouter une section
                        </Button>
                      </Col>
                      <Col xs={12} md="auto">
                        <Button variant="info" onClick={() => setShowPreview(true)} className="w-100 text-white shadow-sm rounded-3 px-4">
                          <Icon path={mdiEye} size={0.9} className="me-2" />
                          Voir l’aperçu
                        </Button>
                      </Col>
                    </Row>
                  </div>

                </Card.Body>
              </Card>

              <div className="my-4">
                <Row className="g-3">
                  <Col xs={12} md="auto">
                    <Button variant="success" onClick={handleSend} disabled={sending} className="w-100 shadow-sm rounded-3 px-4">
                      <Icon path={mdiEmailFastOutline} size={0.9} className="me-2" />
                      {sending ? "Envoi en cours..." : "Envoyer par e-mail"}
                    </Button>
                  </Col>
                  <Col xs={12} md="auto">
                    <Button variant="primary" onClick={handleExportPDF} className="w-100 shadow-sm rounded-3 px-4">
                      <Icon path={mdiFileExportOutline} size={0.9} className="me-2" />
                      Export PDF
                      {uploading ? "Export pdf en cours..." : "Export pdf"}
                    </Button>
                  </Col>
                  <Col xs={12} md="auto">
                    <Button variant="outline-secondary" className="w-100 shadow-sm rounded-3 px-4">
                      <Icon path={mdiCancel} size={0.9} className="me-2" />
                      Annuler
                    </Button>
                  </Col>
                </Row>
              </div>

              <br></br>
              {errorUpload && (
                <div className="alert alert-danger rounded-3 d-flex align-items-center gap-2">
                  <Icon path={mdiAlertCircle} size={0.8} />
                  {errorUpload}
                </div>
              )}
              {uploadSuccess && (
                <div className="alert alert-success rounded-3 d-flex align-items-center gap-2">
                  <Icon path={mdiCheckCircle} size={0.8} />
                  {uploadSuccess}
                </div>
              )}
              {uploading && (
                <Alert variant="info" className="mt-3">
                  Export pdf en cours...
                </Alert>
              )}
              {sending && (
                <Alert variant="info" className="mt-3">
                  Envoi en cours...
                </Alert>
              )}

              {sendSuccess && (
                <Alert variant="success" className="mt-3">
                  L’attestation a été envoyée avec succès !
                </Alert>
              )}

              {sendError && (
                <Alert variant="danger" className="mt-3">
                  {sendError}
                </Alert>
              )}

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

                      <p className="text-center fw-bold" style={{ fontSize: '30px', textTransform: 'uppercase' }}>
                        <b>{aboutModel.certificateTypeName}</b>
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
                        <Col md={8}>
                          <div className="mt-4 text-start">
                            <p>
                              <strong style={{textDecoration: 'underline'}}>Motif </strong>: <strong>{aboutModel.reason}</strong>
                            </p>
                          </div>
                          <div className="mt-4 text-center">
                            <QRCodeSVG value={qrValue} size={130} />
                          </div>
                        </Col>
                        <Col md={4}>
                          <div className="mt-4 text-end">
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
                          <Col md={8}>
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
                          <Col md={4} className="text-md-end">
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
