
        document.addEventListener('DOMContentLoaded', () => {
            lucide.createIcons();

            let currentUserType = null;

            const step1 = document.getElementById('step1');
            const step2Artist = document.getElementById('step2-artist');
            const step2Organizer = document.getElementById('step2-organizer');

            // Radio group styling
            const radioOptions = document.querySelectorAll('.radio-option');
            radioOptions.forEach(opt => {
                opt.addEventListener('click', function () {
                    const radio = this.querySelector('input[type="radio"]');
                    radio.checked = true;
                    radioOptions.forEach(o => o.classList.remove('selected'));
                    this.classList.add('selected');
                    currentUserType = radio.value;
                });
            });

            // Next from step1
            document.getElementById('nextStep1').addEventListener('click', () => {
                const email = document.getElementById('email').value.trim();
                const password = document.getElementById('password').value;
                const confirm = document.getElementById('confirmPassword').value;

                if (!email || !password || !confirm) {
                    alert('Please fill in all fields.');
                    return;
                }
                if (password !== confirm) {
                    alert('Passwords do not match.');
                    return;
                }
                if (!currentUserType) {
                    alert('Please select whether you are an Artist or Event Organizer.');
                    return;
                }

                // Check if email already exists
                const users = JSON.parse(localStorage.getItem('plum_users')) || [];
                if (users.find(u => u.email === email)) {
                    alert('An account with this email already exists. Please log in.');
                    return;
                }

                // Store basic info temporarily
                sessionStorage.setItem('reg_email', email);
                sessionStorage.setItem('reg_password', password);
                sessionStorage.setItem('reg_userType', currentUserType);

                step1.classList.remove('active');
                if (currentUserType === 'artist') {
                    step2Artist.classList.add('active');
                } else {
                    step2Organizer.classList.add('active');
                }
            });

            // Back buttons
            document.getElementById('backStep2').addEventListener('click', () => {
                step2Artist.classList.remove('active');
                step1.classList.add('active');
            });
            document.getElementById('backStep2Org').addEventListener('click', () => {
                step2Organizer.classList.remove('active');
                step1.classList.add('active');
            });

            // Artist registration
            document.getElementById('registerArtist').addEventListener('click', () => {
                const name = document.getElementById('artistName').value.trim();
                const bio = document.getElementById('artistBio').value.trim();
                const category = document.getElementById('artistCategory').value;
                const tagsRaw = document.getElementById('artistTags').value;
                const tags = tagsRaw ? tagsRaw.split(',').map(t => t.trim()).filter(t => t) : [];
                const price = parseFloat(document.getElementById('artistPrice').value);
                const portfolio = document.getElementById('artistPortfolio').value.trim();

                if (!name || !bio || isNaN(price) || price <= 0) {
                    alert('Please fill in all required fields (Name, Bio, Price).');
                    return;
                }

                const email = sessionStorage.getItem('reg_email');
                const password = sessionStorage.getItem('reg_password');
                const userType = sessionStorage.getItem('reg_userType');

                const user = {
                    id: Date.now(),
                    email,
                    password,
                    userType,
                    profile: {
                        name,
                        bio,
                        category,
                        tags,
                        price,
                        portfolio: portfolio || null,
                        joined: new Date().toISOString()
                    }
                };

                let users = JSON.parse(localStorage.getItem('plum_users')) || [];
                users.push(user);
                localStorage.setItem('plum_users', JSON.stringify(users));

                // Auto login
                localStorage.setItem('plum_current_user', JSON.stringify({
                    id: user.id,
                    email,
                    userType
                }));

                alert('Registration successful! You will now be redirected to your dashboard.');
                window.location.href = 'dashboard.html';
            });

            // Organizer registration
            document.getElementById('registerOrganizer').addEventListener('click', () => {
                const company = document.getElementById('orgName').value.trim();
                const contact = document.getElementById('orgContact').value.trim();
                const phone = document.getElementById('orgPhone').value.trim();
                const eventTypesRaw = document.getElementById('orgEventTypes').value;
                const eventTypes = eventTypesRaw ? eventTypesRaw.split(',').map(t => t.trim()).filter(t => t) : [];
                const description = document.getElementById('orgDesc').value.trim();
                const website = document.getElementById('orgWebsite').value.trim();

                if (!company || !contact || !phone || eventTypes.length === 0 || !description) {
                    alert('Please fill in all required fields (Company, Contact, Phone, Event Types, Description).');
                    return;
                }

                const email = sessionStorage.getItem('reg_email');
                const password = sessionStorage.getItem('reg_password');
                const userType = sessionStorage.getItem('reg_userType');

                const user = {
                    id: Date.now(),
                    email,
                    password,
                    userType,
                    profile: {
                        company,
                        contactPerson: contact,
                        phone,
                        eventTypes,
                        description,
                        website: website || null,
                        joined: new Date().toISOString()
                    }
                };

                let users = JSON.parse(localStorage.getItem('plum_users')) || [];
                users.push(user);
                localStorage.setItem('plum_users', JSON.stringify(users));

                localStorage.setItem('plum_current_user', JSON.stringify({
                    id: user.id,
                    email,
                    userType
                }));

                alert('Registration successful! You will now be redirected to your dashboard.');
                window.location.href = 'dashboard.html';
            });
        });
    