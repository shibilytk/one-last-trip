// =========================================================
// One Last Trip — Educational Tour (Batch 2024-28)
// Department of Computer Science • MES Arts & Science College
// =========================================================

// Google Apps Script Web App Endpoint (Live & Verified)
const GOOGLE_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbx8424DrDUA3CxGL7w_0h9lZJm_EralHnrExQkyHYxQDMNRt0rt7JQugq88cs52Vkndlg/exec';

// ===========================
// File Upload Handling
// ===========================
const uploadArea = document.getElementById('uploadArea');
const fileInput = document.getElementById('aadhaarFile');

if (uploadArea && fileInput) {
    uploadArea.addEventListener('click', () => {
        fileInput.click();
    });

    ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
        uploadArea.addEventListener(eventName, (e) => {
            e.preventDefault();
            e.stopPropagation();
        });
    });

    uploadArea.addEventListener('dragover', () => uploadArea.classList.add('dragover'));
    uploadArea.addEventListener('dragleave', () => uploadArea.classList.remove('dragover'));
    uploadArea.addEventListener('drop', (e) => {
        uploadArea.classList.remove('dragover');
        const files = e.dataTransfer.files;
        if (files.length) {
            handleFile(files[0]);
        }
    });

    fileInput.addEventListener('change', () => {
        if (fileInput.files.length) {
            handleFile(fileInput.files[0]);
        }
    });
}

function handleFile(file) {
    // Validate file type (supports both MIME and extension for mobile file pickers)
    const isPdf = file.type === 'application/pdf' || (file.name && file.name.toLowerCase().endsWith('.pdf'));
    if (!isPdf) {
        document.getElementById('fileError').textContent = 'Please select a valid PDF file only';
        return;
    }

    // Validate file size (2MB)
    if (file.size > 2 * 1024 * 1024) {
        document.getElementById('fileError').textContent = 'File size exceeds 2 MB. Please upload a smaller PDF.';
        return;
    }

    // Clear error
    document.getElementById('fileError').textContent = '';

    // Show file preview
    document.getElementById('uploadContent').style.display = 'none';
    document.getElementById('uploadSuccess').style.display = 'flex';
    document.getElementById('fileName').textContent = file.name;
    document.getElementById('fileSize').textContent = formatFileSize(file.size);
    uploadArea.classList.add('has-file');

    // Attach to file input if dropped
    if (fileInput.files.length === 0) {
        const dt = new DataTransfer();
        dt.items.add(file);
        fileInput.files = dt.files;
    }
}

function removeFile(event) {
    event.stopPropagation();
    fileInput.value = '';
    document.getElementById('uploadContent').style.display = 'flex';
    document.getElementById('uploadSuccess').style.display = 'none';
    uploadArea.classList.remove('has-file');
}

function formatFileSize(bytes) {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
}

// ===========================
// Student Form Validation
// ===========================
function validateForm() {
    let isValid = true;

    // Full Name
    const fullName = document.getElementById('fullName');
    const nameVal = fullName.value.trim();
    if (!nameVal) {
        showError('fullNameError', 'Please enter your full name as in Aadhaar card');
        isValid = false;
    } else if (nameVal.length < 3) {
        showError('fullNameError', 'Name must be at least 3 characters');
        isValid = false;
    } else {
        clearError('fullNameError');
    }

    // Gender
    const gender = document.querySelector('input[name="gender"]:checked');
    if (!gender) {
        showError('genderError', 'Please select your gender');
        isValid = false;
    } else {
        clearError('genderError');
    }

    // Date of Birth
    const dob = document.getElementById('dob');
    if (!dob.value) {
        showError('dobError', 'Please select your date of birth');
        isValid = false;
    } else {
        clearError('dobError');
    }

    // Age
    const age = document.getElementById('age');
    const ageNum = parseInt(age.value, 10);
    if (!age.value.trim()) {
        showError('ageError', 'Please enter your age');
        isValid = false;
    } else if (isNaN(ageNum) || ageNum < 15 || ageNum > 70) {
        showError('ageError', 'Enter valid age (15–70)');
        isValid = false;
    } else {
        clearError('ageError');
    }

    // Mobile Number (10 digit Indian number)
    const phone = document.getElementById('phone');
    const phoneRegex = /^[6-9]\d{9}$/;
    if (!phone.value.trim()) {
        showError('phoneError', 'Please enter your 10-digit mobile number');
        isValid = false;
    } else if (!phoneRegex.test(phone.value.trim())) {
        showError('phoneError', 'Enter a valid 10-digit Indian mobile number');
        isValid = false;
    } else {
        clearError('phoneError');
    }

    // Email
    const email = document.getElementById('email');
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email.value.trim()) {
        showError('emailError', 'Please enter your email address');
        isValid = false;
    } else if (!emailRegex.test(email.value.trim())) {
        showError('emailError', 'Enter a valid email address');
        isValid = false;
    } else {
        clearError('emailError');
    }

    // Aadhaar File
    const file = document.getElementById('aadhaarFile');
    if (!file.files || !file.files.length) {
        showError('fileError', 'Please upload your Aadhaar card PDF');
        isValid = false;
    } else {
        clearError('fileError');
    }

    // Agreement Checkbox
    const terms = document.getElementById('terms');
    if (!terms.checked) {
        alert('Please confirm the agreement checkbox to submit your registration.');
        isValid = false;
    }

    return isValid;
}

function showError(errorId, message) {
    const el = document.getElementById(errorId);
    if (el) el.textContent = message;
}

function clearError(errorId) {
    const el = document.getElementById(errorId);
    if (el) el.textContent = '';
}

// Auto-calculate Age when DOB is selected
const dobInput = document.getElementById('dob');
const ageInput = document.getElementById('age');

if (dobInput && ageInput) {
    dobInput.addEventListener('change', () => {
        if (!dobInput.value) return;
        const birthDate = new Date(dobInput.value);
        const today = new Date();
        let calcAge = today.getFullYear() - birthDate.getFullYear();
        const m = today.getMonth() - birthDate.getMonth();
        if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
            calcAge--;
        }
        if (calcAge >= 10 && calcAge <= 90) {
            ageInput.value = calcAge;
            clearError('ageError');
        }
    });
}

// Clear errors on user input
document.querySelectorAll('input').forEach(input => {
    input.addEventListener('input', () => {
        const errorEl = input.closest('.input-block')?.querySelector('.error-msg');
        if (errorEl) errorEl.textContent = '';
    });
});

// ===========================
// Form Submission to Google Sheet
// ===========================
const form = document.getElementById('registrationForm');
if (form) {
    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        if (!validateForm()) return;

        const submitBtn = document.getElementById('submitBtn');
        const btnText = submitBtn.querySelector('.btn-text');
        const btnLoader = submitBtn.querySelector('.btn-loader');

        submitBtn.disabled = true;
        btnText.style.display = 'none';
        btnLoader.style.display = 'inline-flex';

        try {
            const fullName = document.getElementById('fullName').value.trim();
            const gender = document.querySelector('input[name="gender"]:checked').value;
            const dob = document.getElementById('dob').value;
            const age = document.getElementById('age').value.trim();
            const phone = document.getElementById('phone').value.trim();
            const email = document.getElementById('email').value.trim();
            const file = document.getElementById('aadhaarFile').files[0];

            // Convert PDF to Base64
            const base64File = await fileToBase64(file);

            const payload = {
                fullName: fullName,
                gender: gender,
                age: age,
                dob: dob,
                phone: phone,
                email: email,
                fileName: file.name,
                fileSize: file.size,
                fileData: base64File,
                timestamp: new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })
            };

            // Post to Google Apps Script
            await fetch(GOOGLE_SCRIPT_URL, {
                method: 'POST',
                mode: 'no-cors',
                headers: {
                    'Content-Type': 'text/plain;charset=utf-8',
                },
                body: JSON.stringify(payload)
            });

            // Show Confirmation Pass
            showSuccessModal(fullName);
            resetForm();

        } catch (error) {
            console.error('Submission error:', error);
            alert('Something went wrong during submission. Please check your network connection and try again.');
        } finally {
            submitBtn.disabled = false;
            btnText.style.display = 'inline';
            btnLoader.style.display = 'none';
        }
    });
}

function fileToBase64(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result.split(',')[1]);
        reader.onerror = error => reject(error);
    });
}

function resetForm() {
    form.reset();
    fileInput.value = '';
    document.getElementById('uploadContent').style.display = 'flex';
    document.getElementById('uploadSuccess').style.display = 'none';
    uploadArea.classList.remove('has-file');
}

// ===========================
// Success Modal & Confetti
// ===========================
function showSuccessModal(studentName) {
    document.getElementById('successModal').classList.add('show');
    document.body.style.overflow = 'hidden';
    launchConfetti();

    // Prepare WhatsApp ticket message
    const whatsappBtn = document.getElementById('whatsappShareBtn');
    if (whatsappBtn) {
        const text = encodeURIComponent(
            `🎓 *One Last Trip (Batch 2024–28)*\n` +
            `🏛️ *Department of Computer Science — MES Arts & Science College*\n` +
            `📍 *Route:* Calicut Railway Station (CLT) ➔ Agra ➔ Jaipur ➔ Jaisalmer ➔ Jodhpur\n\n` +
            `✅ Registration Confirmed for *${studentName || 'Student'}*\n\n` +
            `Batchmates, register your details here:\n${window.location.href}`
        );
        whatsappBtn.href = `https://api.whatsapp.com/send?text=${text}`;
    }
}

function closeModal() {
    document.getElementById('successModal').classList.remove('show');
    document.body.style.overflow = '';
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function launchConfetti() {
    const container = document.getElementById('confetti');
    if (!container) return;
    container.innerHTML = '';
    const colors = ['#B71C1C', '#2E7D32', '#F59E0B', '#1565C0', '#6A1B9A'];

    for (let i = 0; i < 40; i++) {
        const piece = document.createElement('div');
        piece.className = 'confetti-piece';
        piece.style.left = Math.random() * 100 + '%';
        piece.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
        piece.style.animationDelay = (Math.random() * 0.4) + 's';
        piece.style.animationDuration = (Math.random() * 1.5 + 1.2) + 's';
        container.appendChild(piece);
    }
}

// ===========================
// FAQ Accordion Toggle
// ===========================
function toggleFaq(button) {
    const item = button.closest('.faq-card');
    const isOpen = item.classList.contains('open');

    document.querySelectorAll('.faq-card').forEach(el => {
        if (el !== item) el.classList.remove('open');
    });

    item.classList.toggle('open', !isOpen);
}

// ===========================
// Mobile Sticky Action Bar Visibility on Scroll
// ===========================
const stickyBar = document.getElementById('stickyBar');
const regForm = document.getElementById('register-form');

window.addEventListener('scroll', () => {
    if (!stickyBar || !regForm) return;

    const formRect = regForm.getBoundingClientRect();
    const scrollY = window.pageYOffset;

    // Show sticky bar once scrolled 200px down
    if (scrollY > 200) {
        // If registration form is currently visible on screen, hide sticky bar
        if (formRect.top <= window.innerHeight && formRect.bottom >= 0) {
            stickyBar.style.transform = 'translateY(100%)';
            stickyBar.style.transition = 'transform 0.3s ease';
        } else {
            stickyBar.style.transform = 'translateY(0)';
            stickyBar.style.transition = 'transform 0.3s ease';
        }
    } else {
        stickyBar.style.transform = 'translateY(100%)';
    }
});

// Smooth scroll for anchor links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({ behavior: 'smooth' });
        }
    });
});
