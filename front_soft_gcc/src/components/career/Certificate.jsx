import React, { useState } from 'react';
import { Document, Page, Text, View, Image, StyleSheet, PDFViewer } from '@react-pdf/renderer';
import useSWR from 'swr';
import logo from '../../assets/images/Logo/softwellogo.png';
import Fetcher from '../Fetcher';
import DateDisplayNoTime from '../../helpers/DateDisplayNoTime';
import DateDisplayWithTime from '../../helpers/DateDisplayWithTime';
import ModelEdit from '../../pages/certificateManagement/ModelEdit';

const formatDate = (dateString) => {
  if (!dateString) return ''; // Vérification pour éviter les erreurs si la date est vide

  const mois = [
    'janvier', 'février', 'mars', 'avril', 'mai', 'juin',
    'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre'
  ];

  const date = new Date(dateString);
  const jour = date.getDate();
  const moisNom = mois[date.getMonth()];
  const annee = date.getFullYear();

  return `le ${jour} ${moisNom} ${annee}`;
};

// Styles améliorés du PDF
const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontFamily: 'Helvetica',
  },
  header: {
    textAlign: 'center',
    marginBottom: 20,
  },
  logo: {
    width: 70,
    height: 70,
    marginBottom: 10,
    alignSelf: 'right',
  },
  title: {
    fontSize: 22,
    marginBottom: 15,
    textAlign: 'center',
    fontWeight: 'bold',
    textTransform: 'uppercase',
    fontFamily: 'Helvetica-Bold'
  },
  subtitle: {
    fontSize: 14,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 10
  },
  reference: {
    fontFamily: 'Helvetica-Bold',
    fontSize: 12,
    textAlign: 'center',
    marginBottom: 20
  },
  section: {
    padding: 15,
    borderRadius: 5,
    marginBottom: 15,
  },
  paragraph: {
    fontSize: 12,
    marginBottom: 10,
    textAlign: 'justify',
    lineHeight: 1.5,
  },
  listItem: {
    fontSize: 12,
    marginBottom: 5,
    marginLeft: 15,
    textIndent: -10,
  },
  signatureContainer: {
    marginTop: 30,
    textAlign: 'right',
    fontSize: 12,
  },
  signatureLine: {
    marginTop: 5,
    width: 150,
    height: 1,
    backgroundColor: '#000',
    alignSelf: 'flex-end',
  },
  footer: {
    position: 'absolute',
    bottom: 1,
    fontSize: 10,
    textAlign: 'center',
    width: '95%',
    color: 'gray',
    padding: '20px',
    borderTopWidth: 2, 
    borderTopColor: '#87CEEB', // Bleu ciel
    borderTopStyle: 'solid', 
    border: '1px solid black'
  },
});

const MyDocument = ({ data, dataEmployee }) => (
  <Document>
    <Page size="A4" style={styles.page}>
      {/* En-tête */}
      <View style={styles.header}>
        <Image style={styles.logo} src={logo} />
        <Text style={styles.title}>Attestation de travail</Text>
      </View>

      {/* Référence du document */}
      <Text style={styles.reference}>
        <Text style={{ fontWeight: 'bold', textDecoration: 'underline' }}>Réf </Text>: {data.reference}
      </Text>

      {/* Contenu principal */}
      <View style={styles.section}>
        <Text style={styles.paragraph}>
          Nous,<Text style={{ fontWeight: 'bold', fontFamily: 'Helvetica-Bold' }}> Société {data.societe}</Text>, attestons par la présente que 
          Monsieur <Text style={{ fontWeight: 'bold', fontFamily: 'Helvetica-Bold' }}>{dataEmployee.name+' '+dataEmployee.firstName}</Text> travaille avec un contrat 
          à durée indéterminée, au sein de notre établissement en qualité de :
        </Text>
        <Text style={styles.listItem}>• <Text style={{ fontWeight: 'bold', fontFamily: 'Helvetica-Bold' }}>{dataEmployee.positionName}</Text> depuis le <Text style={{ fontWeight: 'bold', fontFamily: 'Helvetica-Bold' }}>{formatDate(dataEmployee.assignmentDate)}</Text> à ce jour</Text>
        <Text style={styles.paragraph}>
          Monsieur <Text style={{ fontWeight: 'bold', fontFamily: 'Helvetica-Bold' }}>{dataEmployee.name+' '+dataEmployee.firstName}</Text> n'est actuellement ni démissionnaire 
          ni en procédure de licenciement.
        </Text>
        <Text style={styles.paragraph}>
          En foi de quoi, la présente attestation lui est délivrée pour servir et valoir ce que de droit.
        </Text>
      </View>

      {/* Signature */}
      <View style={styles.signatureContainer}>
        <Text>Antananarivo, {formatDate(data.date)}.</Text>
        <Text style={{ marginTop: 20 }}>La Directrice Administrative et Financière</Text>
        <Text style={{ fontWeight: 'bold', marginTop: 100 }}>RAMAMONJISOA Voahangy Lalao</Text>
      </View>

      {/* Motif */}
      <Text style={{ marginTop: 15, fontSize: 12 }}>
        <Text style={{ fontWeight: 'bold', textDecoration: 'underline', fontFamily: 'Helvetica-Bold' }}>Motif </Text>: Administratif
      </Text>

      {/* Pied de page */}
      <View style={styles.footer}>
        <Text> Lot II H 31 Ter Ankadindramamy Ankerana, Antananarivo Madagascar</Text>
        <Text>Telephone : 020 22 409 32 | 034 49 107 00</Text>
        <Text>Email : Marketinng@softwell.mg</Text>
        <Text>Site web : www.softwell.mg</Text>
        <Text>Réseau sociaux : Softwell Madagascar</Text>
      </View>
    </Page>
  </Document>
);

function Certificate({dataEmployee}) {
  const [showPDF, setShowPDF] = useState(false);
  const [formData, setFormData] = useState({
    reference: '',
    societe: '',
    motif: '',
    date: '',
  });
  const { data: certificateTypes } = useSWR('/CertificateType', Fetcher);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  return (
    <div>
      {!showPDF ? (
        <form>
          <div className="row">
            <div className="col-md-6 grid-margin stretch-card">
              <div className="card">
                <div className="card-body">
                  <div className="form-group">
                    <label htmlFor="reference">Référence</label>
                    <input
                      type="text"
                      className="form-control"
                      name="reference"
                      onChange={handleInputChange}
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="societe">Société</label>
                    <input
                      type="text"
                      className="form-control"
                      name="societe"
                      onChange={handleInputChange}
                    />
                  </div>
                </div>
              </div>
            </div>
            <div className="col-md-6 grid-margin stretch-card">
              <div className="card">
                <div className="card-body">
                  <div className="form-group">
                    <label htmlFor="motif">Motif</label>
                    <input
                      type="text"
                      className="form-control"
                      name="motif"
                      onChange={handleInputChange}
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="date">Date</label>
                    <input
                      type="date"
                      className="form-control"
                      name="date"
                      onChange={handleInputChange}
                    />
                  </div>
                  <div className="form-group">
                    <button
                      type="button"
                      className="btn btn-success btn-fw"
                      onClick={() => setShowPDF(true)}
                    >
                      Exporter en PDF
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </form>
      ) : (
        <div>
          <button type="button" className="btn btn-danger btn-fw" onClick={() => setShowPDF(false)}>
            Retour
          </button>
          <PDFViewer style={{ width: '100%', height: '600px' }}>
            <MyDocument data={formData} dataEmployee={dataEmployee} />
          </PDFViewer>
        </div>
      )}
      <ModelEdit />
    </div>
  );
}

export default Certificate;
