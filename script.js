let doctors = [];
let filteredDoctors = [];
let selectedDoctor = null;
let selectedTime = null;

// Initialize the page
window.onload = async function () {
    await loadDoctors();
    displayDoctors(doctors);
    setupEventListeners();
    setMinDate();
};

// Fetch doctors from JSON file
async function loadDoctors() {
    try {
        const response = await fetch('doctors.json');
        doctors = await response.json();
        filteredDoctors = [...doctors];
    } catch (error) {
        console.error("Error fetching doctors:", error);
    }
}

function setupEventListeners() {
    document.getElementById('searchForm').addEventListener('submit', handleSearch);
    document.getElementById('appointmentForm').addEventListener('submit', handleBooking);

    document.getElementById('searchInput').addEventListener('input', filterDoctors);
    document.getElementById('locationInput').addEventListener('input', filterDoctors);
    document.getElementById('specialtySelect').addEventListener('change', filterDoctors);

    document.querySelectorAll('.filter-chip').forEach(chip => {
        chip.addEventListener('click', function () {
            document.querySelectorAll('.filter-chip').forEach(c => c.classList.remove('active'));
            this.classList.add('active');
        });
    });
}

function setMinDate() {
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('appointmentDate').min = today;
}

function renderStars(rating) {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;
    let stars = '';

    for (let i = 0; i < fullStars; i++) {
        stars += '★';
    }
    if (hasHalfStar) {
        stars += '★';
    }

    return stars;
}

function displayDoctors(doctorList) {
    const grid = document.getElementById('doctorGrid');
    grid.innerHTML = '';

    doctorList.forEach(doctor => {
        const doctorCard = document.createElement('div');
        doctorCard.className = 'doctor-card';
        doctorCard.innerHTML = `
            <div class="doctor-header">
                <div class="doctor-avatar">
                    ${doctor.name.split(' ').map(n => n[0]).join('')}
                </div>
                <div class="doctor-info">
                    <h3>${doctor.name}</h3>
                    <p>${doctor.specialty}</p>
                </div>
            </div>

            <div class="rating">
                <div class="stars">
                    ${renderStars(doctor.rating)}
                </div>
                <span>${doctor.rating} (${doctor.reviews} reviews)</span>
            </div>

            <div class="doctor-details">
                <div class="detail-item">📍 ${doctor.location}</div>
                <div class="detail-item">🎓 ${doctor.experience} years experience</div>
                <div class="detail-item">🗣 ${doctor.languages.join(", ")}</div>
                <div class="detail-item">💰 ₹${doctor.fees} consultation</div>
                <div class="detail-item">⏰ ${doctor.availability}</div>
            </div>

            <button class="book-btn" onclick="openBookingModal(${doctor.id})">
                📅 Book Appointment
            </button>
        `;
        grid.appendChild(doctorCard);
    });
}

function filterDoctors() {
    const searchQuery = document.getElementById('searchInput').value.toLowerCase();
    const location = document.getElementById('locationInput').value.toLowerCase();
    const specialty = document.getElementById('specialtySelect').value;

    filteredDoctors = doctors.filter(doctor => {
        const matchesSearch = !searchQuery ||
            doctor.name.toLowerCase().includes(searchQuery) ||
            doctor.specialty.toLowerCase().includes(searchQuery);

        const matchesLocation = !location ||
            doctor.location.toLowerCase().includes(location);

        const matchesSpecialty = specialty === 'All' || doctor.specialty === specialty;

        return matchesSearch && matchesLocation && matchesSpecialty;
    });

    displayDoctors(filteredDoctors);
}

function handleSearch(e) {
    e.preventDefault();
    filterDoctors();
}

function openBookingModal(doctorId) {
    selectedDoctor = doctors.find(d => d.id === doctorId);
    const modal = document.getElementById('bookingModal');
    const doctorInfo = document.getElementById('modalDoctorInfo');

    doctorInfo.innerHTML = `
        <div class="doctor-avatar">
            ${selectedDoctor.name.split(' ').map(n => n[0]).join('')}
        </div>
        <div class="doctor-info">
            <h3>${selectedDoctor.name}</h3>
            <p>${selectedDoctor.specialty}</p>
            <p>Fee: ₹${selectedDoctor.fees}</p>
        </div>
    `;

    document.getElementById('successMessage').innerHTML = `
        🎉 Your Booking is Successful! 🎉<br/>
        <strong>Appointment confirmed with ${selectedDoctor.name}</strong><br/>
        You will receive a confirmation SMS and email shortly.<br/>
        <small>Please arrive 15 minutes early for your appointment.</small>
    `;

    modal.classList.add('show');
    document.getElementById('successMessage').classList.remove('show');
    document.getElementById('appointmentForm').classList.remove('hidden');
}

function closeModal() {
    document.getElementById('bookingModal').classList.remove('show');
    document.getElementById('appointmentForm').reset();
    selectedTime = null;
    document.querySelectorAll('.time-slot').forEach(slot => slot.classList.remove('selected'));
}

function selectTime(element) {
    document.querySelectorAll('.time-slot').forEach(slot => slot.classList.remove('selected'));
    element.classList.add('selected');
    selectedTime = element.textContent;
}

function handleBooking(e) {
    e.preventDefault();

    const patientName = document.getElementById('patientName').value;
    const patientPhone = document.getElementById('patientPhone').value;
    const appointmentDate = document.getElementById('appointmentDate').value;

    if (!patientName.trim()) {
        alert('Please enter patient name');
        return;
    }
    if (!patientPhone.trim()) {
        alert('Please enter phone number');
        return;
    }
    if (!appointmentDate) {
        alert('Please select appointment date');
        return;
    }
    if (!selectedTime) {
        alert('Please select a time slot');
        return;
    }

    document.getElementById('appointmentForm').classList.add('hidden');
    document.getElementById('successMessage').classList.add('show');

    setTimeout(() => {
        closeModal();
        document.getElementById('appointmentForm').classList.remove('hidden');
    }, 3000);
}
