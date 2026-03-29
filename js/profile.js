function navigateTo(page) {
    window.location.href = page + '.html';
}

function loadProfile() {
    const plumberId = sessionStorage.getItem('selectedPlumberId');
    const profileData = {
        'plumber1': {
            name: 'John Smith',
            rating: 4.8,
            reviews: 127,
            experience: '10 years',
            location: 'New York, NY',
            specialties: ['Pipe Repair', 'Installation', 'Maintenance'],
            image: 'https://via.placeholder.com/200'
        }
    };

    const data = profileData[plumberId] || profileData['plumber1'];
    
    const profileContainer = document.getElementById('profile-container');
    if (profileContainer) {
        profileContainer.innerHTML = `
            <img src="${data.image}" alt="${data.name}">
            <h2>${data.name}</h2>
            <p class="rating">Rating: ${data.rating} ⭐ (${data.reviews} reviews)</p>
            <p>Experience: ${data.experience}</p>
            <p>Location: ${data.location}</p>
            <p>Specialties: ${data.specialties.join(', ')}</p>
        `;
    }
}

function bookService() {
    const dates = prompt('Enter preferred date (YYYY-MM-DD):');
    if (dates) {
        alert('Service booking request submitted for ' + dates);
    }
}

document.addEventListener('DOMContentLoaded', function() {
    loadProfile();
});
