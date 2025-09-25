
function today(hours, minutes) {
    var date = new Date();
    date.setHours(hours, minutes, 0, 0);
    return date;
}

function yesterday(hours, minutes) {
    var date = today(hours, minutes);
    date.setTime(date.getTime() - 24 * 60 * 60 * 1000);
    return date;
}

function tomorrow(hours, minutes) {
    var date = today(hours, minutes);
    date.setTime(date.getTime() + 24 * 60 * 60 * 1000);
    return date;
}

function toLocalDateTimeString(date) {
    const tzOffset = date.getTimezoneOffset() * 60000; // Décalage de fuseau horaire en millisecondes
    const localDate = new Date(date.getTime() - tzOffset); // Ajuster l'heure UTC à l'heure locale
    return localDate.toISOString().slice(0, 16); // Formater pour `datetime-local` (yyyy-MM-ddTHH:mm)
}

function toUTCDate(dateString) {
    const localDate = new Date(dateString); // Date locale
    const tzOffset = localDate.getTimezoneOffset() * 60000; // Décalage de fuseau horaire en millisecondes
    const utcDate = new Date(localDate.getTime() + tzOffset); // Convertir en UTC
    return utcDate.toISOString(); // Formater en ISO pour MongoDB
}

// add event to skedTape
function addEventToSkedTape(event) {
    const opts = {
        preserveId: true
    };
    $skedInstance.skedTape('addEvent', event, opts);
}

function setEventsToSkedTape(events) {
    const opts = {
        preserveId: true,
        allowCollisions : true
    };
    $skedInstance.skedTape('setEvents', events, opts);
}

function addLocationToSkedTape(location) {
    $skedInstance.skedTape('addLocation', location);
}

function setLocationsToSkedTape(locations) {
    $skedInstance.skedTape('setLocations', locations);
}

function getEventsFromSkedTape() {
    return $skedInstance.data('sked-tape').getEvents();
}

const api = {

    fetchUser: async function (userId) {
        try {
            const response = await fetch(`/api/users/${userId}`,
                {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                }
            );

            if (!response.ok) throw new Error('Utilisateur non trouvé');
            return await response.json();
        } catch (error) {
            throw new Error(`Erreur lors de la récupération de l'utilisateur: ${error.message}`);
        }
    },

    fetchUsers: async function () {
        try {
            const response = await fetch('/api/users',
                {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                }
            );
            if (!response.ok) throw new Error('Utilisateurs non trouvés');
            return await response.json();
        } catch (error) {
            throw new Error(`Erreur lors de la récupération des utilisateurs: ${error.message}`);
        }
    },

};