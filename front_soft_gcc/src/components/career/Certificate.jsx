import React, { useState } from 'react';
import { Document, Page, Text, View, Image, StyleSheet, PDFViewer } from '@react-pdf/renderer';
import useSWR from 'swr';
import logo from '../../assets/images/Logo/softwellogo.png';
import Fetcher from '../Fetcher';

// Styles du PDF
const styles = StyleSheet.create({
  page: {
    padding: 30,
    fontFamily: 'Helvetica',
  },
  logo: {
    width: 60,
    height: 60,
    alignSelf: 'left',
    marginBottom: 1,
  },
  title: {
    fontSize: 20,
    marginBottom: 10,
    textAlign: 'center',
    fontWeight: 'bold',
  },
  section: {
    marginBottom: 10,
    padding: 10,
    border: '1px solid #e4e4e4',
  },
  text: {
    fontSize: 12,
    marginBottom: 5,
  },
  paragraph: {
    fontSize: 12,
    marginBottom: 15,
    textAlign: 'justify',
  },
});

// Composant pour générer le PDF
const MyDocument = ({ data }) => (
  <Document>
    <Page size="A4" style={styles.page}>
      <Image style={styles.logo} src={logo} />
      <Text style={styles.title}>CERTIFICAT DE TRAVAIL</Text>
      <Text style={styles.paragraph}>
        Ce document atteste que l'employé mentionné ci-dessous a été employé dans notre société et a rempli ses fonctions avec sérieux et professionnalisme.
      </Text>
      <View style={styles.section}>
        <Text style={styles.text}>Référence : {data.reference}</Text>
        <Text style={styles.text}>Société : {data.societe}</Text>
        <Text style={styles.text}>Type : {data.type}</Text>
        <Text style={styles.text}>Motif : {data.motif}</Text>
        <Text style={styles.text}>Date : {data.date}</Text>
      </View>
    </Page>
  </Document>
);

function Certificate() {
  const [showPDF, setShowPDF] = useState(false);
  const [formData, setFormData] = useState({
    reference: '',
    societe: '',
    type: '',
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
                    <label htmlFor="reference">Reference</label>
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
                  <div className="form-group">
                    <label htmlFor="type">Type d'attestation</label>
                    <select
                      className="form-control"
                      name="type"
                      onChange={handleInputChange}
                      value={formData.type}
                    >
                      {certificateTypes && certificateTypes.map((item) => (
                        <option key={item.certificateTypeId} value={item.certificateTypeId}>
                          {item.certificateTypeName}
                        </option>
                      ))}
                    </select>
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
                      Export PDF
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </form>
      ) : (
        <div>
          <button
            type="button"
            className="btn btn-danger btn-fw"
            onClick={() => setShowPDF(false)}
            style={{ marginBottom: '10px' }}
          >
            Retour
          </button>
          <PDFViewer style={{ width: '100%', height: '600px' }}>
            <MyDocument data={formData} />
          </PDFViewer>
        </div>
      )}
    </div>
  );
}

export default Certificate;