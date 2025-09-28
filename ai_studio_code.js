// Firebase configuration (REPLACE WITH YOUR ACTUAL CONFIG)
const firebaseConfig = {
    apiKey: "YOUR_API_KEY",
    authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
    databaseURL: "https://YOUR_PROJECT_ID-default-rtdb.firebaseio.com",
    projectId: "YOUR_PROJECT_ID",
    storageBucket: "YOUR_PROJECT_ID.appspot.com",
    messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
    appId: "YOUR_APP_ID"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const database = firebase.database();

// --- Elements ---
const authContainer = document.getElementById('auth-container');
const dashboardContainer = document.getElementById('dashboard-container');
const authError = document.getElementById('auth-error');

// Auth elements
const emailInput = document.getElementById('email');
const passwordInput = document.getElementById('password');
const passKeyInput = document.getElementById('passKey');
const loginBtn = document.getElementById('loginBtn');
const signupBtn = document.getElementById('signupBtn');
const logoutBtn = document.getElementById('logoutBtn');

// Dashboard elements
const totalStudentsSpan = document.getElementById('totalStudents');
const totalCollegesSpan = document.getElementById('totalColleges');

const studentNameInput = document.getElementById('studentName');
const studentNumberInput = document.getElementById('studentNumber');
const studentAddressInput = document.getElementById('studentAddress');
const addStudentBtn = document.getElementById('addStudentBtn');
const studentList = document.getElementById('studentList');
const studentMessage = document.getElementById('student-message');

const collegeNameInput = document.getElementById('collegeName');
const collegeNumberInput = document.getElementById('collegeNumber');
const collegeAddressInput = document.getElementById('collegeAddress');
const facultyNameInput = document.getElementById('facultyName');
const addCollegeBtn = document.getElementById('addCollegeBtn');
const collegeList = document.getElementById('collegeList');
const collegeMessage = document.getElementById('college-message');

const navItems = document.querySelectorAll('.bottom-nav .nav-item');
const contentSections = document.querySelectorAll('.content-section');

// --- In-built Security: Triple Base64 Encoded Pass Key ---
// Encode "buxi123" three times:
// 1. buxi123 -> YnV4aTEyMw==
// 2. YnV4aTEyMw== -> WUJCeGlURU13PT0=
// 3. WUJCeGlURU13PT0= -> V1lCQ2V4aUlURU13TVE9PQ==
const TRIPLE_ENCODED_PASS_KEY = "V1lCQ2V4aUlURU13TVE9PQ==";

function encodeBase64(str) {
    return btoa(str);
}

function verifyPassKey(inputKey) {
    let encoded = encodeBase64(inputKey);
    encoded = encodeBase64(encoded);
    encoded = encodeBase64(encoded);
    return encoded === TRIPLE_ENCODED_PASS_KEY;
}

// --- Firebase Authentication ---
auth.onAuthStateChanged(user => {
    if (user) {
        authContainer.style.display = 'none';
        dashboardContainer.style.display = 'flex';
        // Load data specific to the logged-in user
        loadDashboardData(user.uid);
    } else {
        authContainer.style.display = 'block';
        dashboardContainer.style.display = 'none';
        authError.textContent = ''; // Clear any previous errors
        emailInput.value = '';
        passwordInput.value = '';
        passKeyInput.value = '';
    }
});

loginBtn.addEventListener('click', async () => {
    const email = emailInput.value;
    const password = passwordInput.value;
    const passKey = passKeyInput.value;

    if (!verifyPassKey(passKey)) {
        authError.textContent = 'Invalid local pass key.';
        return;
    }

    try {
        await auth.signInWithEmailAndPassword(email, password);
        authError.textContent = '';
    } catch (error) {
        authError.textContent = error.message;
    }
});

signupBtn.addEventListener('click', async () => {
    const email = emailInput.value;
    const password = passwordInput.value;
    const passKey = passKeyInput.value;

    if (!verifyPassKey(passKey)) {
        authError.textContent = 'Invalid local pass key.';
        return;
    }

    try {
        await auth.createUserWithEmailAndPassword(email, password);
        authError.textContent = '';
    } catch (error) {
        authError.textContent = error.message;
    }
});

logoutBtn.addEventListener('click', async () => {
    try {
        await auth.signOut();
    } catch (error) {
        console.error('Logout error:', error);
    }
});

// --- Dashboard Data Management ---
let currentUserId = null; // Store the current user's ID

function loadDashboardData(userId) {
    currentUserId = userId;
    // Listen for changes in Students
    database.ref(`users/${userId}/students`).on('value', (snapshot) => {
        studentList.innerHTML = '';
        const students = snapshot.val();
        let studentCount = 0;
        if (students) {
            Object.keys(students).forEach(key => {
                const student = students[key];
                const li = document.createElement('li');
                li.innerHTML = `
                    <span class="item-name">${student.name}</span>
                    <span>Contact: ${student.number}</span>
                    <span>Address: ${student.address}</span>
                `;
                studentList.appendChild(li);
                studentCount++;
            });
        }
        totalStudentsSpan.textContent = studentCount;
    });

    // Listen for changes in Colleges
    database.ref(`users/${userId}/colleges`).on('value', (snapshot) => {
        collegeList.innerHTML = '';
        const colleges = snapshot.val();
        let collegeCount = 0;
        if (colleges) {
            Object.keys(colleges).forEach(key => {
                const college = colleges[key];
                const li = document.createElement('li');
                li.innerHTML = `
                    <span class="item-name">${college.name}</span>
                    <span>Contact: ${college.number}</span>
                    <span>Address: ${college.address}</span>
                    <span>Faculty: ${college.faculty}</span>
                `;
                collegeList.appendChild(li);
                collegeCount++;
            });
        }
        totalCollegesSpan.textContent = collegeCount;
    });
}

// Add Student
addStudentBtn.addEventListener('click', () => {
    if (!currentUserId) {
        studentMessage.textContent = 'Please log in to add students.';
        studentMessage.classList.remove('success');
        studentMessage.classList.add('error');
        return;
    }

    const name = studentNameInput.value.trim();
    const number = studentNumberInput.value.trim();
    const address = studentAddressInput.value.trim();

    if (name && number && address) {
        database.ref(`users/${currentUserId}/students`).push({
            name,
            number,
            address
        })
        .then(() => {
            studentMessage.textContent = 'Student added successfully!';
            studentMessage.classList.remove('error');
            studentMessage.classList.add('success');
            studentNameInput.value = '';
            studentNumberInput.value = '';
            studentAddressInput.value = '';
        })
        .catch(error => {
            studentMessage.textContent = 'Error adding student: ' + error.message;
            studentMessage.classList.remove('success');
            studentMessage.classList.add('error');
        });
    } else {
        studentMessage.textContent = 'Please fill all student fields.';
        studentMessage.classList.remove('success');
        studentMessage.classList.add('error');
    }
});

// Add College
addCollegeBtn.addEventListener('click', () => {
    if (!currentUserId) {
        collegeMessage.textContent = 'Please log in to add colleges.';
        collegeMessage.classList.remove('success');
        collegeMessage.classList.add('error');
        return;
    }

    const name = collegeNameInput.value.trim();
    const number = collegeNumberInput.value.trim();
    const address = collegeAddressInput.value.trim();
    const faculty = facultyNameInput.value.trim();

    if (name && number && address && faculty) {
        database.ref(`users/${currentUserId}/colleges`).push({
            name,
            number,
            address,
            faculty
        })
        .then(() => {
            collegeMessage.textContent = 'College added successfully!';
            collegeMessage.classList.remove('error');
            collegeMessage.classList.add('success');
            collegeNameInput.value = '';
            collegeNumberInput.value = '';
            collegeAddressInput.value = '';
            facultyNameInput.value = '';
        })
        .catch(error => {
            collegeMessage.textContent = 'Error adding college: ' + error.message;
            collegeMessage.classList.remove('success');
            collegeMessage.classList.add('error');
        });
    } else {
        collegeMessage.textContent = 'Please fill all college fields.';
        collegeMessage.classList.remove('success');
        collegeMessage.classList.add('error');
    }
});

// --- Bottom Navigation ---
navItems.forEach(item => {
    item.addEventListener('click', () => {
        const targetId = item.dataset.target;

        // Deactivate all nav items and hide all sections
        navItems.forEach(nav => nav.classList.remove('active'));
        contentSections.forEach(section => section.classList.remove('active'));

        // Activate clicked nav item and show target section
        item.classList.add('active');
        document.getElementById(targetId).classList.add('active');
    });
});

// Initial load for nav to ensure one is active
document.addEventListener('DOMContentLoaded', () => {
    if (navItems.length > 0) {
        navItems[0].click(); // Simulate click on the first nav item (Home)
    }
});