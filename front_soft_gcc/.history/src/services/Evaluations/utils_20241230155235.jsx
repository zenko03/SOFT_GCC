
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
  




// src/utils.jsx
export const compareDates = (dateString, today) => {
    // Supposons que dateString est au format "YYYY-MM-DDTHH:mm:ss"
    const [datePart] = dateString.split('T'); // Extraire seulement la partie "YYYY-MM-DD"
    
    // Convertir les deux dates en objets Date sans heure
    const dateWithoutTime = new Date(datePart);
    dateWithoutTime.setHours(0, 0, 0, 0);
  
    const todayDate = new Date(today); // Convertir `today` qui est au format "YYYY-MM-DD"
    todayDate.setHours(0, 0, 0, 0);
  
    // Comparer les timestamps
    return dateWithoutTime.getTime() === todayDate.getTime();
  };
  
  
  