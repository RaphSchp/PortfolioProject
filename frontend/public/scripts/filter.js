// FILTERS --------------------------------------------------------------------------------------------------------------------------------------------------------------

// ** SPORT -------------------------------------------------------------------------------------------------------------------------------------------------------------
// Fetch sports list from the server
async function fetchSportsList() {
    try {
        const response = await fetch('/sports.json');
        const data = await response.json();
        return data.sports;
    } catch (error) {
        console.error('Error fetching sports list:', error);
        return [];
    }
}

// Function to handle applying sport filter
async function applySportFilter() {
    const selectedSport = document.getElementById('sportFilter').value.toLowerCase();
    // Loop through all figures and toggle display based on search term
    const allFigures = Array.from(document.querySelectorAll("main figure, #myTopnav figure"));
    allFigures.forEach((figure) => {
        const sportSection = figure.querySelector(".sport").textContent.toLowerCase();

        const isMatch =
            sportSection.includes(selectedSport);

        if (isMatch) {
            figure.style.display = "block";
        } else {
            figure.style.display = "none";
        }
    });
}

// Populate sports dropdown/select
async function populateSportsDropdown() {
    const sportsList = await fetchSportsList();
    const sportDropdown = document.getElementById('sportFilter');
    sportsList.forEach(sport => {
        const option = document.createElement('option');
        option.value = sport;
        option.textContent = sport;
        sportDropdown.appendChild(option);
    });
}

// Call the function to populate sports dropdown on page load
document.addEventListener('DOMContentLoaded', () => {
    populateSportsDropdown();
});

// ** DATE --------------------------------------------------------------------------------------------------------------------------------------------------------------
function sortEventsByDate(order) {
    console.log('Sorting events by date:', order); // Check if the function is called and with what order

    // Comparison function to sort events by date
    const compareDates = function(a, b) {
        const dateA = new Date(a.querySelector('.event-date span:last-child').textContent);
        const dateB = new Date(b.querySelector('.event-date span:last-child').textContent);
        return order === 'newer' ? dateB - dateA : dateA - dateB;
    };

    // Sort the figures using the comparison function
    figures.sort(compareDates);

    // Detach the figures from their parent
    figures.forEach(figure => {
        figure.parentNode.removeChild(figure);
    });

    // Re-insert the sorted figures in the correct order
    const main = document.querySelector("main");
    figures.forEach(figure => {
        main.appendChild(figure);
    });
}
// Add an event listener to detect changes in the sorting selection
document.addEventListener("DOMContentLoaded", function() {
    document.getElementById("dateSort").addEventListener("change", function() {
        var sortOrder = this.value;
        sortEventsByDate(sortOrder);
    });
});


// ** CITY --------------------------------------------------------------------------------------------------------------------------------------------------------------
// Fetch cities data
async function fetchCitiesData() {
    try {
        const response = await fetch('/cities.json');
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error fetching cities data:', error);
        return [];
    }
}

// Function to filter cities based on input
async function filterCities() {
    const input = document.getElementById('cityInput').value.toLowerCase().trim();
    const suggestionsContainer = document.getElementById('citySuggestions');
    suggestionsContainer.innerHTML = '';

    const cities = await fetchCitiesData();
    const filteredCities = cities.filter(city => city.name.toLowerCase().startsWith(input));

    const suggestionsList = document.createElement('ul');
    suggestionsList.setAttribute('id', 'cityList');

    filteredCities.slice(0, 4).forEach(city => {
        const li = document.createElement('li');
        li.textContent = `${city.name}, ${city.country}`;
        li.onclick = () => {
            document.getElementById('cityInput').value = `${city.name}, ${city.country}`;
            suggestionsContainer.innerHTML = '';
        };
        suggestionsList.appendChild(li);
    });

    suggestionsContainer.appendChild(suggestionsList);
}

// Function to filter events by selected city
function filterEventsByCity(selectedCity) {
    const city = selectedCity.toLowerCase();

    const allFigures = Array.from(document.querySelectorAll("main figure"));
    allFigures.forEach((figure) => {
        const citySection = figure.querySelector(".city").textContent.toLowerCase();
        const isMatch = citySection.includes(city);

        if (isMatch) {
            figure.style.display = "block";
        } else {
            figure.style.display = "none";
        }
    });
}

// Apply city filter
function applyCityFilter() {
    const selectedCity = document.getElementById('cityInput').value.trim();
    filterEventsByCity(selectedCity);
}

// Event listener for DOMContentLoaded
document.addEventListener("DOMContentLoaded", () => {
    const applyButton = document.querySelector("#applyCityFilterButton");
    if (applyButton) {
        applyButton.addEventListener("click", applyCityFilter);
    }

    const cityInput = document.getElementById('cityInput');
    if (cityInput) {
        cityInput.addEventListener('input', filterCities);
    }

    // Call filterCities initially to populate suggestions based on initial input value
    filterCities();
});


function filterEventsByStatus(status) {
    // Check if figures is defined
    if (!figures) return;

    // Loop through all figures and toggle display based on the selected status
    figures.forEach(figure => {
        const eventStatusElement = figure.querySelector('.status');
        if (!eventStatusElement) return; // Ensure .status element is found
        const eventStatus = eventStatusElement.textContent.toLowerCase().trim().replace("status: ", ""); // Extract status without "status: "
        // Show the figure if it matches the selected status or if "All" is selected
        if (status === 'All' || eventStatus === status.toLowerCase()) {
            figure.style.display = 'block';
        } else {
            figure.style.display = 'none';
        }
    });
}


// Add an event listener to detect changes in the status selection
document.addEventListener("DOMContentLoaded", function() {
    const statusSelect = document.getElementById("statusSort");

    // Initially filter based on the default status selection
    const defaultStatus = statusSelect.value;
    filterEventsByStatus(defaultStatus);

    // Add event listener to status select dropdown
    statusSelect.addEventListener("change", function() {
        const selectedStatus = this.value;
        filterEventsByStatus(selectedStatus);
    });
});
