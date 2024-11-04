import { format } from 'date-fns';

// Gestion du format date
function FormattedDate({ date }) {
    const parsedDate = new Date(date);

    if (isNaN(parsedDate.getTime())) { // Vérifie si la date est invalide
        return <span>Date invalide</span>; // Ou un autre message
    }

    const formattedDate = format(parsedDate, 'yyyy-MM-dd');
    return <span>{formattedDate}</span>;
}

export default FormattedDate;