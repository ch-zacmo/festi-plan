const urlParams = new URLSearchParams(window.location.search);
const manifestationId = urlParams.get('manifestationId');
const standId = urlParams.get('standId');
const apiBaseUrl = '/api';
const token = localStorage.getItem('token');
var $skedInstance = null;

document.addEventListener('DOMContentLoaded', async function () {
    await getStandDetails(); // Récupérer et pré-remplir les données dès que la page est chargée
    await loadUserSelect();
    await loadSkedTape();
});


// Formulaire d'édition de stand
document.getElementById('update-stand-form').addEventListener('submit', async function (event) {
    event.preventDefault();

    const name = document.getElementById('stand-name').value;
    const startDate = document.getElementById('start-date').value;
    const endDate = document.getElementById('end-date').value;
    const color = document.getElementById('color-select').value;
    const manager = document.getElementById('manager-select').value;
    console.log(manager);
    const opts = {
        color: color,
        manager: manager
    }

    // Mettre à jour le stand
    await updateStand(name, startDate, endDate, opts);
});


// Formulaire d'édition de disponibilité
document.getElementById('shift-edit-form').addEventListener('submit', async function (event) {
    event.preventDefault(); // Empêcher la soumission du formulaire par défaut

    const start = document.getElementById('shift-edit-start').value;
    const end = document.getElementById('shift-edit-end').value;

    const shiftId = document.getElementById('shift-edit-modal').dataset.shiftId;
    const userId = document.getElementById('shift-edit-modal').dataset.userId;

    const location = userId;


    const shift = {
        start: new Date(start),
        end: new Date(end),
        user: userId
    };

    // Verifier si il y a collision
    const events = getEventsFromSkedTape();
    console.log(events);
    const collision = events.some(event => {
        if (event.id !== shiftId && event.location === location) {
            return (shift.start >= event.start && shift.start < event.end) ||
                (shift.end > event.start && shift.end <= event.end) ||
                (shift.start <= event.start && shift.end >= event.end);
        }
    });

    if (collision) {
        alert('Collision détectée, veuillez choisir une autre plage horaire.');
        return;
    }

    await updateShiftOfStand(shiftId, shift);

    // Fermer la modal
    var myModal = bootstrap.Modal.getInstance(document.getElementById('shift-edit-modal'));
    myModal.hide();


});


// Formulaire d'ajout de disponibilité
document.getElementById('shift-add-form').addEventListener('submit', async function (event) {
    event.preventDefault(); // Empêcher la soumission du formulaire par défaut

    const userId = document.getElementById('user-select').value;
    const start = document.getElementById('shift-add-start').value;
    const end = document.getElementById('shift-add-end').value;


    const shift = {
        user: userId,
        start: new Date(start),
        end: new Date(end)
    };

    // Verifier si il y a collision
    const events = getEventsFromSkedTape();
    console.log(events);

    const collision = events.some(event => {
        if (event.location === userId) {
            return (shift.start >= event.start && shift.start < event.end) ||
                (shift.end > event.start && shift.end <= event.end) ||
                (shift.start <= event.start && shift.end >= event.end);
        }
    });

    if (collision) {
        alert('Collision détectée, veuillez choisir une autre plage horaire.');
        return;
    }

    await addShiftToStand(shift);


});

// Écouter le click sur le bouton de suppression de la disponibilité
document.getElementById('delete-shift-btn').addEventListener('click', async function (event) {
    const shiftId = document.getElementById('shift-edit-modal').dataset.shiftId;
    await deleteShift(shiftId);

    // Fermer la modal
    var myModal = bootstrap.Modal.getInstance(document.getElementById('shift-edit-modal'));
    myModal.hide();

    loadSkedTape();
});

// Fonction pour récupérer les détails du stand et pré-remplir le formulaire
async function getStandDetails() {
    try {
        const token = localStorage.getItem('token'); // Récupérer le token si nécessaire
        const response = await fetch(`/api/manifestations/${manifestationId}/stands/${standId}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}` // Ajouter l'autorisation si nécessaire
            }
        });

        if (!response.ok) {
            throw new Error(`Erreur lors de la récupération des détails : ${response.statusText}`);
        }

        const stand = await response.json();

        // Pré-remplir les champs du formulaire avec les données récupérées
        document.getElementById('stand-name').value = stand.name || '';
        document.getElementById('start-date').value = toLocalDateTimeString(new Date(stand.start));
        document.getElementById('shift-add-start').value = toLocalDateTimeString(new Date(stand.start));
        
        document.getElementById('end-date').value = toLocalDateTimeString(new Date(stand.end));
        document.getElementById('shift-add-end').value = toLocalDateTimeString(new Date(stand.end));

        loadManagerSelect(stand.manager);
        document.getElementById('color-select').value = stand?.color || '#00000'

        // Initialiser la timeline de skedTape avec les dates de début et de fin du stand
        initSkedTape(new Date(stand.start), new Date(stand.end));

        console.log('Détails du stand récupérés avec succès :', stand);
    } catch (error) {
        console.error('Erreur lors de la récupération des détails du stand :', error);
        // Afficher un message d'erreur dans l'UI si nécessaire
    }
}

// Charger les managers dans la liste déroulante du formulaire de modification de stand
function loadManagerSelect(manager) {
    const managerSelect = document.getElementById('manager-select');
    //managerSelect.innerHTML = '<option value="">Sélectionner un/des manager</option>';

    // Ajouter les utilisateurs dans la liste et les pré-sélectionner si ils sont déjà manager
    api.fetchUsers().then(users => {
        users.forEach(user => {
            const option = document.createElement('option');
            option.value = user._id;
            option.textContent = user.username;

            console.log('manager' + manager);
            if (manager.some(m => m._id === user._id)) {
                option.selected = true;
                console.log('selected' + user.username);
            }
            managerSelect.appendChild(option);
        });
    }).catch(error => {
        console.error('Erreur lors de la récupération des utilisateurs :', error);
    });

}

// Mettre à jour un stand
async function updateStand(name, startDate, endDate, opts) {

    const data = {};

    // Ajouter uniquement les champs non vides
    if (name) data.name = name;
    if (startDate) data.start = new Date(startDate); // Convertir la date locale en UTC
    if (endDate) data.end = new Date(endDate); // Convertir la date locale en UTC
    data.color = opts?.color || '#000000'

    data.manager = [opts?.manager] || [];

    try {
        const token = localStorage.getItem('token');
        const response = await fetch(`/api/manifestations/${manifestationId}/stands/${standId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(data)
        });

        if (!response.ok) {
            throw new Error(`Erreur : ${response.statusText}`);
        }

        const updatedStand = await response.json();
        console.log('Stand mis à jour avec succès :', updatedStand);
        // Ajoute ici le code pour mettre à jour l'UI ou afficher un message de succès
    } catch (error) {
        console.error('Erreur lors de la mise à jour du stand :', error);
        // Ajoute ici le code pour afficher un message d'erreur dans l'UI
    }
}

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

        // Créer l'objet de disponibilité à envoyer à l'API
        const shift = {
            start: new Date(event.start),
            end: new Date(event.end),
            user: event.location
        };

        var userData = null;
        // Si l'id de l'évenement est un string, c'est un evenemnt existant
        if (typeof event.id === 'string') {
            await updateShiftOfStand(event.id, shift);
        } else {
            await addShiftToStand(shift);
        }

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

        document.getElementById('shift-edit-modal').dataset.shiftId = e.detail.event.userData.shiftId;
        document.getElementById('shift-edit-modal').dataset.userId = e.detail.event.userData.userId;
        document.getElementById('shift-edit-modal').dataset.location = e.detail.event.location;

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


// Chargement de la liste déroulante des utilisateurs du formulaire d'ajout de shift
async function loadUserSelect() {
    try {
        const response = await fetch('/api/users', {
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

        // Ajouter les utilisateurs disponibles dans la liste déroulante a condition qu'ils aient des disponibilités pour la manifestation
        const userSelect = document.getElementById('user-select');
        userSelect.innerHTML = '<option value="">Sélectionner un utilisateur</option>';
        users.forEach(user => {
            const option = document.createElement('option');
            option.value = user._id;
            option.textContent = user.username;
            userSelect.appendChild(option);
        });

        // empty value option
        const option = document.createElement('option');
        option.value = '';
        option.textContent = 'No User';
        userSelect.appendChild(option);


    } catch (error) {
        console.error('Erreur lors de la récupération des manifestations:', error);
    }
}


// Ajouter un shift à un stand
async function addShiftToStand(shift) {
    try {
        const response = await fetch(`/api/manifestations/${manifestationId}/stands/${standId}/shifts`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(shift)
        });

        if (!response.ok) {
            throw new Error(`Erreur : ${response.statusText}`);
        }

        const manifestation = await response.json();
        console.log('Shift ajouté avec succès :', manifestation);
        return manifestation;
    } catch (error) {
        console.error('Erreur lors de l\'ajout du shift :', error);
    }
}

// Récupérer les shifts d'un stand
async function getShiftOfStand() {
    try {
        const response = await fetch(`/api/manifestations/${manifestationId}/stands/${standId}/shifts`, {
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

// Mettre a jour un shift
async function updateShiftOfStand(shiftId, shift) {
    try {
        const response = await fetch(`/api/manifestations/${manifestationId}/stands/${standId}/shifts/${shiftId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(shift)
        });

        if (!response.ok) {
            throw new Error(`Erreur : ${response.statusText}`);
        }

        const updatedManifestation = await response.json();
        console.log('Shift mis à jour avec succès :', updatedManifestation);
        return updatedManifestation;
    } catch (error) {
        console.error('Erreur lors de la mise à jour du shift :', error);
    }
}

// supprimer un shift
async function deleteShift(shiftId) {
    try {
        const response = await fetch(`/api/manifestations/${manifestationId}/stands/${standId}/shifts/${shiftId}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        });

        if (!response.ok) {
            throw new Error(`Erreur : ${response.statusText}`);
        }

        console.log('Shift supprimé avec succès');
    } catch (error) {
        console.error('Erreur lors de la suppression du shift :', error);
    }
}


// Récupérer les disponibilités d'un utilisateur pour une manifestation
async function getUserAvailability(userId) {
    try {
        const response = await fetch(`/api/users/${userId}/manifestations/${manifestationId}/availability`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        });

        if (!response.ok) {
            throw new Error(`Erreur : ${response.statusText}`);
        }

        const availabilities = await response.json();
        console.log('Disponibilités récupérées avec succès :', availabilities);
        return availabilities;
    } catch (error) {
        console.error('Erreur lors de la récupération des disponibilités :', error);
    }
}


// Fonction pour charger les locations et les événements dans skedTape
async function loadSkedTape() {
    const shifts = await getShiftOfStand();
    // Créer une location par utilisateur (sans doublon) pour afficher les shifts
    const locations = shifts.reduce((acc, shift) => {
        if (shift.user) { // Vérifier si le shift a un utilisateur
            if (!acc.some(location => location.id === shift.user._id)) {
                acc.push({
                    id: shift.user._id,
                    name: shift.user.username
                });
            }
        } else { // Gérer le cas où le shift n'a pas d'utilisateur
            if (!acc.some(location => location.id === 'no-user')) {
                acc.push({
                    id: 'no-user',
                    name: 'No User'
                });
            }
        }
        return acc;
    }, []);

    console.log('Locations:', locations);

    // Créer les événements à partir des shifts
    const events = shifts.map(shift => {
        return {
            id: shift._id,
            name: shift.user ? shift.user.username : 'No User',
            start: new Date(shift.start),
            end: new Date(shift.end),
            location: shift.user ? shift.user._id : 'no-user',
            userData: {
                shiftId: shift._id,
                userId: shift.user ? shift.user._id : null
            }
        };
    });

    console.log('Events:', events);

    setLocationsToSkedTape(locations);
    setEventsToSkedTape(events);
}