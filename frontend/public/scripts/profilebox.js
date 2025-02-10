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

document.addEventListener("DOMContentLoaded", async function () {
    const profilePic1 = document.getElementById("userpic");
    const profilePic2 = document.getElementById("userpic2");
    const fileInput = document.getElementById("userpicInput");

    // Fetch user info and update the profile picture
    async function updateUserPic() {
        try {
            const response = await fetch("/getLoggedInUserInfo");
            const data = await response.json();

            if (data.success) {
                const profileImagePath = data.userpic === "lol.jpeg"
                    ? "/assets/user_image/lol.jpeg"
                    : `/assets/user_image/${data.userpic}`;

                profilePic1.src = profileImagePath;
                profilePic2.src = profileImagePath;
            } else {
                console.error("User not logged in:", data.message);
            }
        } catch (error) {
            console.error("Error fetching logged-in user:", error);
        }
    }

    await updateUserPic(); // Initial update when the page loads

    // Click event to trigger file selection
    document.getElementById("changeUserPic").addEventListener("click", function (event) {
        event.preventDefault();
        fileInput.click();
    });

    // Handle file selection
    fileInput.addEventListener("change", function () {
        const file = fileInput.files[0];
        if (!file) return;

        // Validate file type (JPEG, PNG only)
        const allowedTypes = ["image/jpeg", "image/png"];
        if (!allowedTypes.includes(file.type)) {
            alert("Only JPEG and PNG files are allowed.");
            return;
        }

        // Validate file size (5MB max)
        if (file.size > 5 * 1024 * 1024) {
            alert("File size must be less than 5MB.");
            return;
        }

        // Upload the image
        uploadProfilePicture(file);
    });

    function uploadProfilePicture(file) {
        const formData = new FormData();
        formData.append("userpic", file);

        fetch("/upload-profile", {
            method: "POST",
            body: formData,
            credentials: "include"
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                alert("Profile picture updated successfully!");

                //  Immediately update profile picture in UI
                profilePic1.src = data.userpic;
                profilePic2.src = data.userpic;
            } else {
                alert("Error: " + data.message);
            }
        })
        .catch(error => {
            console.error("Error uploading profile picture:", error);
            alert("Failed to update profile picture.");
        });
    }
});
