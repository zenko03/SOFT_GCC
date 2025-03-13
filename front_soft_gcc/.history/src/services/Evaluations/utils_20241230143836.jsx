
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
  


export const compareDates = (date1, date2) => {
    const [year1, month1, day1] = date1.split('-').map(Number);
    const [year2, month2, day2] = date2.split('-').map(Number);
  
    return new Date(year1, month1 - 1, day1) === new Date(year2, month2 - 1, day2);
  };
  