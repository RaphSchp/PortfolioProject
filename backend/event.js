document.addEventListener("DOMContentLoaded", () => {
    const createEventLinks = document.querySelectorAll('.create-event-link');
    const modalBackground = document.getElementById('modalBackground');

    // Hide modal background by default
    modalBackground.style.display = 'none';

    createEventLinks.forEach(link => {
        link.addEventListener('click', (event) => {
            event.preventDefault();
            modalBackground.style.display = 'flex';

            // Retrieve user information (name and userpic)
            fetch('/getLoggedInUserInfo')
                .then(response => response.json())
                .then(data => {
                    // Call a function to dynamically create the event box
                    createEventBox(data.name, data.userpic);
                })
                .catch(error => console.error('Error fetching user info:', error));
        });
    });

    // Function to dynamically create the event box
    function createEventBox(name, userpic) {
        // Create your event box HTML dynamically
        const eventBoxHTML = `
            <div class="event-box">
                <h2>Create Event</h2>
                <!-- Add other form elements as needed -->

                <button type="button" onclick="submitEvent('${name}', '${userpic}')">Create Event</button>
            </div>
        `;

        // Append the event box HTML to a container (e.g., modalBackground)
        modalBackground.innerHTML = eventBoxHTML;
    }

    function closeEventBox() {
        document.getElementById('modalBackground').style.display = 'none';
    }
});

// Fonction pour gérer l'inscription
function handleRegistration() {
    const username = document.getElementById('regUsername').value;
    const email = document.getElementById('regEmail').value;
    const password = document.getElementById('regPassword').value;
    const passwordConfirmation = document.getElementById('regPasswordConfirmation').value;

    // Vérifier si les passwords ne sont pas identiques ou vides
    if (password !== passwordConfirmation || password === '') {
        alert('Password and Password Confirmation do not match or are empty.');
        return;
    }

    // Vérifier si l'email est valide
    if (!validateEmail(email)) {
        alert('Email is not valid.');
        return;
    }

    fetch('/register', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, email, password, passwordConfirmation }),
    })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                // Afficher un message de validation
                alert(data.message);
                // Rediriger l'utilisateur vers la page de connexion
                window.location.href = '/login';
            } else {
                // Afficher un message d'erreur
                alert(data.message);
            }
        })
        .catch(error => {
            console.error('Error during registration:', error);
            alert('An error occurred. Please try again later.');
        });
}

// Fonction pour valider un email
function validateEmail(email) {
    const re = /\S+@\S+\.\S+/;
    return re.test(email);
}
