
export const formatDate = (dateString) => {
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
  
    return `${year}-${month}-${day} ${hours}:${minutes}`;
  };



export const isValidInterviewDate = (dateString) => {
    return dateString !== null && dateString !== '' && dateString.trim() !== '';
  };
  




export const compareDates = (dateString, today) => {
    // Supposons que la date dans la base de données est au format "YYYY-MM-DDTHH:mm:ss"
    const [datePart] = dateString.split('T');
    
    // Convertir la chaîne de date en objet Date sans heure
    const dateWithoutTime = new Date(datePart);
    dateWithoutTime.setHours(0, 0, 0, 0);
  
    return dateWithoutTime.getTime() === new Date(today).getTime();
  };
  
  