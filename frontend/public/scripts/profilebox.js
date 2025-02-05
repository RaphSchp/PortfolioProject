// PROFILE BOX ----------------------------------------------------------------------------------------------------------------------------------------------------------
document.addEventListener("DOMContentLoaded", () => {
    const profileLink = document.querySelectorAll('.user-profile a');
    const modalBackground2 = document.getElementById('modalBackground2');

    // Hide modal background by default
    modalBackground2.style.display = 'none';

    profileLink.forEach(link => {
        link.addEventListener('click', (event) => {
            event.preventDefault();
            modalBackground2.style.display = 'flex';
        });
    });
});

function closeProfileBox() {
    document.getElementById('modalBackground2').style.display = 'none';
}

function editProfile() {
    // Logic to handle form submission
    // ...

    // After handling the submission, hide the modal
    const modalBackground = document.getElementById('modalBackground2');
    modalBackground.style.display = 'none';
}

// Function to logout on the client-side
function logout() {
    fetch('/logout', {
            method: 'GET'
        })
        .then(response => {
            if (response.ok) {
                // Redirect to the login page once logged out
                window.location.href = '/login';
            } else {
                console.error('Erreur lors de la déconnexion:', response.statusText);

            }
        })
        .catch(error => {
            console.error('Erreur lors de la déconnexion:', error);

        });
}

