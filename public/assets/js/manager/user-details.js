const urlParams = new URLSearchParams(window.location.search);
const userId = urlParams.get('userId');
const apiBaseUrl = '/api';
const token = localStorage.getItem('token');
var $skedInstance = null;

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
        editMode: true,
        showEventTime: true, // Afficher le temps de début et de fin des événements
        showEventDuration: true, // Afficher la durée des événements
        locations: locations,
        events: events // Ajouter les événements (disponibilités) dans la timeline
    };

    $skedInstance = $.skedTape(skedConfig);
    $('#sked').empty();
    $skedInstance.appendTo('#sked').skedTape('render');

    // Ajouter les événements SkedTape
    $skedInstance.on('event:dragEnded.skedtape', async function (e) {
        console.log('event:dragEnded :');
        console.log(e.detail.event);
        const event = e.detail.event;
        const manifestationId = document.getElementById('manifestation-select').value;

        // Créer l'objet de disponibilité à envoyer à l'API
        const availability = {
            start: new Date(event.start),
            end: new Date(event.end)
        };
        
        var userData = null;
        // Si l'id de l'évenement est un string, c'est un evenemnt existant
        if (typeof event.id === 'string') {
            userData = await updateAvailabilityToUser(manifestationId, event.id, availability);
        } else {
            userdata = await addAvailabilityToUser(manifestationId, availability);
        }

        // recharger les disponibilités
        handleManifestationChange({
            target: {
                value: manifestationId
            }
        });

    });

    $skedInstance.on('event:click.skedtape', function (e) {
        console.log('Click ' + e);
        $skedInstance.skedTape('removeEvent', e.detail.event.id);
    });

    $skedInstance.on('event:contextmenu.skedtape', function (e) {
        console.log('Context ' + e);
        var myModal = new bootstrap.Modal(document.getElementById('shift-edit-modal'));

        document.getElementById('shift-edit-start').value = toLocalDateTimeString(e.detail.event.start);
        document.getElementById('shift-edit-end').value = toLocalDateTimeString(e.detail.event.end);

        document.getElementById('shift-edit-modal').dataset.availabilityId = e.detail.event.userData.availabilityId;
        document.getElementById('shift-edit-modal').dataset.manifestationId = e.detail.event.userData.manifestationId;

        myModal.show();
    });

    $skedInstance.on('event:dragStart.skedtape', function (e) {
        console.log('event:dragStart :');
        console.log(e.detail.event);
    });

    $skedInstance.on('skedtape:event:addingCanceled', function (e) {
        console.log('skedtape:event:addingCanceled :');
        console.log(e.detail.event);
    });

    $skedInstance.on('timeline:click.skedtape', function (e, api) {
        try {
            const manifestationId = document.getElementById('manifestation-select').value; // ID de la manifestation sélectionnée
            if (!manifestationId) {
                alert('Veuillez sélectionner une manifestation avant d\'ajouter une disponibilité.');
                return;
            }

            // Ajouter un événement (disponibilité) à la timeline
            const newEvent = $skedInstance.skedTape('startAdding', {
                name: 'New availability',
                duration: 60 * 60 * 1000 // Durée par défaut d'1 heure

            });

        } catch (e) {
            if (e.name !== 'SkedTape.CollisionError') throw e;
            alert('Cette plage existe déjà.');
        }
    });

    return $skedInstance;
}


// Fonction pour récupérer et afficher les détails de l'utilisateur
async function fetchUserDetails() {
    try {
        const response = await fetch(`${apiBaseUrl}/users/${userId}`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        const user = await response.json();

        document.getElementById('username').textContent = user.username;
        document.getElementById('role').textContent = user.role;

        return user;
    } catch (error) {
        console.error('Erreur lors de la récupération des détails de l\'utilisateur:', error);
    }
}

// Fonction pour charger la liste des manifestations dans le sélecteur
async function loadManifestations() {
    try {
        const response = await fetch(`${apiBaseUrl}/manifestations`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        const manifestations = await response.json();

        const select = document.getElementById('manifestation-select');
        manifestations.forEach(manifestation => {
            const option = document.createElement('option');
            option.value = manifestation._id;
            option.textContent = manifestation.name;
            select.appendChild(option);
        });

        // appeler handleManifestationChange pour afficher les disponibilités du premier élément
        handleManifestationChange({
            target: {
                value: select.value
            }
        });

        return manifestations;
    } catch (error) {
        console.error('Erreur lors de la récupération des manifestations:', error);
    }
}

// Fonction pour vérifier si l'utilisateur a la manifestation attribuée et retourner l'objet manifestation
function getUserManifestation(user, manifestationId) {
    return user.manifestations.find(manifestation => manifestation.manifestation._id === manifestationId);
}

// Fonction pour vérifier si l'utilisateur a la manifestation attribuée
function userHasManifestation(user, manifestationId) {
    return user.manifestations.some(manifestation => manifestation.manifestation._id === manifestationId);
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


// Fonction pour ajouter une disponibilité à l'utilisateur pour une manifestation
async function addAvailabilityToUser(manifestationId, availability) {
    try {
        const response = await fetch(`${apiBaseUrl}/users/${userId}/manifestations/${manifestationId}/availability`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(availability)
        });

        if (!response.ok) {
            throw new Error('Erreur lors de l\'ajout de la disponibilité');
        }

        const updatedUser = await response.json();
        return updatedUser;
    } catch (error) {
        console.error('Erreur lors de l\'ajout de la disponibilité:', error);
    }
}

async function updateAvailabilityToUser(manifestationId, availabilityId, availability) {
    try {
        const response = await fetch(`${apiBaseUrl}/users/${userId}/manifestations/${manifestationId}/availability/${availabilityId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(availability)
        });

        if (!response.ok) {
            throw new Error('Erreur lors de la modification de la disponibilité');
        }

        const updatedUser = await response.json();
        return updatedUser;
    } catch (error) {
        console.error('Erreur lors de la modification de la disponibilité:', error);
    }
}

// Fonction pour gérer le changement de sélection de la manifestation
async function handleManifestationChange(event) {
    const manifestationId = event.target.value; // Récupérer l'ID de la manifestation sélectionnée
    if (manifestationId) {
        const manifestation = await fetchManifestationDetails(manifestationId); // Récupérer les détails
        const startDate = new Date(manifestation.start_date);
        const endDate = new Date(manifestation.end_date);

        // Récupérer les détails de l'utilisateur
        const user = await fetchUserDetails();

        // Initialiser la timeline SkedTape
        initSkedTape(startDate, endDate);
        // Vérifier si l'utilisateur a la manifestation attribuée
        const userManifestation = getUserManifestation(user, manifestationId);
        console.log('User manifestation:', userManifestation);
        const showDispo = !!userManifestation;

        if (showDispo) {
            // Ajouter la location des disponibilités
            const location = {
                id: 'dispo',
                name: 'Disponibilités',
                color: '#FFD700'
            };
            addLocationToSkedTape(location);



            // Afficher les disponibilités existantes
            userManifestation.availability.forEach(avail => {

                const availType = avail.type === 'available' ? 'Disponible' : 'Indisponible';
                const isNotAvailable = avail.type === 'available' ? false : true;
                
                addEventToSkedTape({
                    id: avail._id,
                    name: availType,
                    start: new Date(avail.start),
                    end: new Date(avail.end),
                    disabled: isNotAvailable,
                    location: 'dispo',
                    userData : {
                        availabilityId: avail._id,
                        manifestationId: manifestationId
                    }
                });
            });
        }
        
        // Disable the assign button if the user has the manifestation
        document.getElementById('assign-manifestation-btn').disabled = showDispo;

    }
}

// Fonction pour attribuer une manifestation à l'utilisateur
async function assignManifestationToUser(manifestationId) {
    try {
        const response = await fetch(`${apiBaseUrl}/users/${userId}/manifestations`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
                manifestationId
            })
        });

        if (!response.ok) {
            throw new Error('Erreur lors de l\'attribution de la manifestation');
        }

        const updatedUser = await response.json();
        console.log('Manifestation attribuée:', updatedUser);

        // Recharger la timeline après l'attribution
        handleManifestationChange({
            target: {
                value: manifestationId
            }
        });
    } catch (error) {
        console.error('Erreur lors de l\'attribution de la manifestation:', error);
    }
}

// Écouter le submit du formulaire d'assignation de la manifestation
document.getElementById('assign-manifestation-form').addEventListener('submit', async function (event) {
    event.preventDefault(); // Empêcher la soumission du formulaire par défaut
    const manifestationId = document.getElementById('manifestation-select').value;

    if (manifestationId) {
        await assignManifestationToUser(manifestationId);
    }
});

// Écouter le submit du formulaire de modification de la disponibilité
document.getElementById('shift-edit-form').addEventListener('submit', async function (event) {
    event.preventDefault(); // Empêcher la soumission du formulaire par défaut

    const start = document.getElementById('shift-edit-start').value;
    const end = document.getElementById('shift-edit-end').value;
    const available = document.getElementById('shift-edit-availability').value;
    const availabilityId = document.getElementById('shift-edit-modal').dataset.availabilityId;
    const manifestationId = document.getElementById('shift-edit-modal').dataset.manifestationId;
    

    const availability = {
        start: new Date(start),
        end: new Date(end),
        type : available
    };

    // Verifier si il y a collision
    const events = getEventsFromSkedTape();
    const collision = events.some(event => {
        if (event.id !== availabilityId) {
            return (availability.start >= event.start && availability.start < event.end) ||
                (availability.end > event.start && availability.end <= event.end) ||
                (availability.start <= event.start && availability.end >= event.end);
        }
    });

    if (collision) {
        alert('Collision détectée, veuillez choisir une autre plage horaire.');
        return;
    }

    await updateAvailabilityToUser(manifestationId, availabilityId, availability);
    
    // Fermer la modal
    var myModal = bootstrap.Modal.getInstance(document.getElementById('shift-edit-modal'));
    myModal.hide();

    // recharger les disponibilités
    handleManifestationChange({
        target: {
            value: manifestationId
        }
    });

});

// Écouter le click sur le bouton de suppression de la disponibilité
document.getElementById('delete-shift-btn').addEventListener('click', async function (event) {
    const availabilityId = document.getElementById('shift-edit-modal').dataset.availabilityId;
    const manifestationId = document.getElementById('shift-edit-modal').dataset.manifestationId;

    await deleteAvailabilityFromUser(manifestationId, availabilityId);

    // Fermer la modal
    var myModal = bootstrap.Modal.getInstance(document.getElementById('shift-edit-modal'));
    myModal.hide();

    // recharger les disponibilités
    handleManifestationChange({
        target: {
            value: manifestationId
        }
    });
});

// Fonction pour supprimer une disponibilité de l'utilisateur pour une manifestation
async function deleteAvailabilityFromUser(manifestationId, availabilityId) {
    try {
        const response = await fetch(`${apiBaseUrl}/users/${userId}/manifestations/${manifestationId}/availability/${availabilityId}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (!response.ok) {
            throw new Error('Erreur lors de la suppression de la disponibilité');
        }

        const updatedUser = await response.json();
        return updatedUser;
    } catch (error) {
        console.error('Erreur lors de la suppression de la disponibilité:', error);
    }
}

// Ajouter l'écouteur d'événement pour la sélection de manifestation
document.getElementById('manifestation-select').addEventListener('change', handleManifestationChange);

// Charger les détails de l'utilisateur et les manifestations lors du chargement de la page
document.addEventListener('DOMContentLoaded', async function () {
    await fetchUserDetails();
    await loadManifestations();

});