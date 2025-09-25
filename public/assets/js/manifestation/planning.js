const urlParams = new URLSearchParams(window.location.search);
const manifestationId = urlParams.get('id');
const apiBaseUrl = '/api';
const token = localStorage.getItem('token');
var $skedInstance = null;

document.addEventListener('DOMContentLoaded', async function () {
    await loadSkedTape();
});



// Fonction pour initialiser skedTape avec des dates de début et de fin et des événements
async function initSkedTape(startDate, endDate, options = {
    events: [],
    locations: []
}) {
    const {
        events,
        locations
    } = options;

    console.log('Init SkedTape:', startDate, endDate, events);

    const skedConfig = {
        caption: '',
        start: startDate, // Utiliser la date de début de la manifestation
        end: endDate, // Utiliser la date de fin de la manifestation
        editMode: false,
        showEventTime: true, // Afficher le temps de début et de fin des événements
        showEventDuration: true, // Afficher la durée des événements
        showIntermission: true, // Afficher les intermissions
        locations: locations,
        events: events // Ajouter les événements (disponibilités) dans la timeline
    };

    $skedInstance = $.skedTape(skedConfig);
    $('#sked').empty();
    $skedInstance.appendTo('#sked').skedTape('render');

    return $skedInstance;
}


async function getShiftOfManifestation() {
    try {
        const response = await fetch(`/api/manifestations/${manifestationId}/shifts`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        });

        if (!response.ok) {
            throw new Error(`Erreur : ${response.statusText}`);
        }

        const shifts = await response.json();
        console.log('Shifts récupérés avec succès :', shifts);
        return shifts;
    } catch (error) {
        console.error('Erreur lors de la récupération des shifts :', error);
    }
}

async function getUsersofManifestation() {
    try {
        const response = await fetch(`/api/manifestations/${manifestationId}/users`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        });

        if (!response.ok) {
            throw new Error(`Erreur : ${response.statusText}`);
        }

        const users = await response.json();
        console.log('Utilisateurs récupérés avec succès :', users);
        return users;
    } catch (error) {
        console.error('Erreur lors de la récupération des utilisateurs :', error);
    }
}

// Fonction pour récupérer les détails d'une manifestation par ID
async function fetchManifestationDetails(manifestationId) {
    try {
        const response = await fetch(`${apiBaseUrl}/manifestations/${manifestationId}`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        const manifestation = await response.json();
        return manifestation;
    } catch (error) {
        console.error('Erreur lors de la récupération des détails de la manifestation:', error);
    }
}


async function loadSkedTape() {

    const manifestation = await fetchManifestationDetails(manifestationId); // Récupérer les détails
    const startDate = new Date(manifestation.start_date);
    const endDate = new Date(manifestation.end_date);

    // Initialiser la timeline SkedTape
    //initSkedTape(startDate, endDate);

    const shifts = await getShiftOfManifestation();
    const users = await getUsersofManifestation();

    // // Créer une location par utilisateur (sans doublon) pour afficher les shifts
    // const locations = shifts.reduce((acc, shift) => {
    //     if (!acc.some(location => location.id === shift.user._id)) {
    //         acc.push({
    //             id: shift.user._id,
    //             name: shift.user.username
    //         });
    //     }
    //     return acc;
    // }, []);

    const locations = users.map(user => {
        return {
            id: user._id,
            name: user.username
        };
    });

    // Créer les événements à partir des shifts
    var events = shifts.map(shift => {
        return {
            id: shift._id,
            name: shift.standName,
            start: new Date(shift.start),
            end: new Date(shift.end),
            location: shift.user._id,
            style: {
                'background-color': shift.color
            },
            userData: {
                shiftId: shift._id,
                userId: shift.user._id
            }
        };
    });


    // Ordre les location en fonction premier évenment le plus proche.
    // Si il y a plusieurs location avec une date de début identique, on trie par ordre alphabétique 
    //Si il  n'y a pas d'événement, on mets en dernier
    locations.sort((a, b) => {
        const eventA = events.find(event => event.location === a.id);
        const eventB = events.find(event => event.location === b.id);

        if (!eventA && !eventB) {
            return 0;
        }

        if (!eventA) {
            return 1;
        }

        if (!eventB) {
            return -1;
        }

        if (eventA.start < eventB.start) {
            return -1;
        }

        if (eventA.start > eventB.start) {
            return 1;
        }

        if (eventA.start === eventB.start) {
            if (a.name < b.name) {
                return -1;
            }

            if (a.name > b.name) {
                return 1;
            }
        }

        return 0;
    });
    
    console.log('Locations triées :', locations);

    // Ajouter aux événements les indisponibilités des utilisateurs
    users.forEach(user => {
        user.manifestations.forEach(manifestation => {
            if (manifestation.manifestation === manifestationId) {
                const unavailable = manifestation.availability.filter(availability => availability.type === 'unavailable');

                unavailable.forEach(availability => {
                    events.push({
                        id: availability._id,
                        name: 'Indisponible',
                        start: new Date(availability.start),
                        end: new Date(availability.end),
                        location: user._id,
                        style: {
                            'background-color': 'grey'
                        },
                        userData: {
                            userId: user._id,
                            availabilityId: availability._id
                        },
                        opts: {
                            preserveId: true,
                            allowCollisions: true
                        }
                    });
                });

            }
        });
    });





    // Find the the earliest start date
    const earliestStartDate = events.reduce((acc, event) => {
        return event.start < acc ? event.start : acc;
    }, events[0].start);

    // Initialiser la timeline SkedTape


    const opts = {
        events,
        locations,
    };

    initSkedTape(earliestStartDate, endDate, opts);

    //setLocationsToSkedTape(locations);
    //setEventsToSkedTape(events);
}