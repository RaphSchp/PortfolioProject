// HANDLE REGISTRATION EVENT --------------------------------------------------------------------------------------------------------------------------------------------

let fileName = "";

function uploadImage() {
    var fileInput = document.getElementById("eventImage");
    if (fileInput.files.length > 0) {
        fileName = fileInput.files[0].name;

    } else {
        console.log("No file selected.");
        return;
    }
    console.log("Selected file name:", fileName);

}




function handleRegistrationEvent() {
    const event_name = document.getElementById('eventName').value;
    const sport = document.getElementById('eventSport').value;
    const doc = document.getElementById('eventDescription').value;
    const event_hour = document.getElementById('eventHour').value;
    const event_date = document.getElementById('eventDate').value;
    const city = document.getElementById('eventCity').value;
    const address = document.getElementById('eventAddress').value;
    const participants = document.getElementById('participants').value;

    const statusCheckbox = document.getElementById('status');
    const status = statusCheckbox.checked ? 'Open' : 'Demand';

    // Create a new FormData object
    const formData = new FormData();
    // Add the image to the FormData
    const fileInput = document.getElementById('eventImage');
    const file = fileInput.files[0];
    formData.append('eventImage', file);

    // Send the request to upload the image
    fetch('/upload', {
            method: 'POST',
            body: formData,
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                // Retrieve the filename of the uploaded image
                const img = data.filename;

                // Send other form data as JSON
                fetch('/registerevent', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({
                            event_name,
                            userpic,
                            img,
                            sport,
                            doc,
                            event_hour,
                            event_date,
                            city,
                            address,
                            participants,
                            status,
                        }),
                    })
                    .then(response => response.json())
                    .then(data => {
                        if (data.success) {
                            alert(data.message);
                            console.log('Event registration successful:', data);
                        } else {
                            alert(data.message);
                        }
                    })
                    .catch(error => {
                        console.error('Error during registration event:', error);
                        alert('An error occurred. Please try again later.');
                    });
            } else {
                alert('Image upload failed. Please try again.');
            }
        })
        .catch(error => {
            console.error('Error uploading image:', error);
            alert('An error occurred while uploading the image. Please try again later.');
        });
}


document.addEventListener('DOMContentLoaded', () => {
    const registerEventButton = document.getElementById('registerEvent');
    const boxRegisterEventInput = document.querySelector('.event-box');

    if (registerEventButton) {
        registerEventButton.addEventListener('click', handleRegistrationEvent);
    }

    if (boxRegisterEventInput) {
        boxRegisterEventInput.addEventListener('keydown', (event) => {
            if (event.key === 'Enter') {
                handleRegistrationEvent();
            }
        });
    }
});