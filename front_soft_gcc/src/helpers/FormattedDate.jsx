import { format } from 'date-fns';

// Gestion du format date
function FormattedDate({ date }) {
    const parsedDate = new Date(date);

    if (isNaN(parsedDate.getTime())) { 
        return <span>Date invalide</span>; 
    }

    const formattedDate = format(parsedDate, 'yyyy-MM-dd');
    return <span>{formattedDate}</span>;
}

export default FormattedDate;