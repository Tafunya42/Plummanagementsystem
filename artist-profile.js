
        document.addEventListener('DOMContentLoaded', function() {
            lucide.createIcons();

            // Modal handling
            const modal = document.getElementById('bookingModal');
            const bookBtns = document.querySelectorAll('#bookBtn, #bookBtn2');
            const closeModal = document.getElementById('closeModal');

            bookBtns.forEach(btn => {
                btn.addEventListener('click', () => modal.classList.add('active'));
            });
            closeModal.addEventListener('click', () => modal.classList.remove('active'));
            modal.addEventListener('click', (e) => { if (e.target === modal) modal.classList.remove('active'); });

            document.getElementById('bookingForm').addEventListener('submit', (e) => {
                e.preventDefault();
                alert('Booking request sent! The artist will contact you shortly.');
                modal.classList.remove('active');
            });

            // Save button
            const saveBtn = document.getElementById('saveBtn');
            saveBtn.addEventListener('click', function() {
                this.classList.toggle('active');
                if (this.classList.contains('active')) {
                    this.innerHTML = '<i data-lucide="heart"></i> Saved';
                    this.style.background = '#EF4444';
                    this.style.borderColor = '#EF4444';
                    this.style.color = 'white';
                } else {
                    this.innerHTML = '<i data-lucide="heart"></i> Save';
                    this.style.background = 'transparent';
                    this.style.borderColor = 'var(--border)';
                    this.style.color = 'var(--white)';
                }
                lucide.createIcons();
            });

            // Share button
            document.getElementById('shareBtn').addEventListener('click', () => {
                if (navigator.share) navigator.share({ title: 'The Jazz Collective', text: 'Check out this amazing artist!', url: window.location.href });
                else { navigator.clipboard.writeText(window.location.href); alert('Profile link copied to clipboard!'); }
            });

            // Tabs
            document.querySelectorAll('.tab-btn').forEach(btn => {
                btn.addEventListener('click', function() {
                    const tab = this.dataset.tab;
                    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
                    document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
                    this.classList.add('active');
                    document.querySelector(`.tab-content[data-tab="${tab}"]`).classList.add('active');
                });
            });

            // Gallery lightbox
            document.querySelectorAll('.gallery-item').forEach(item => {
                item.addEventListener('click', function() {
                    const imgSrc = this.querySelector('img').src;
                    const modalLightbox = document.createElement('div');
                    modalLightbox.className = 'modal';
                    modalLightbox.innerHTML = `<div class="modal-content" style="max-width:80%;text-align:center"><img src="${imgSrc}" style="max-width:100%;border-radius:var(--r-lg)"><button class="modal-close" style="position:absolute;top:20px;right:20px"><i data-lucide="x"></i></button></div>`;
                    document.body.appendChild(modalLightbox);
                    modalLightbox.classList.add('active');
                    modalLightbox.querySelector('.modal-close').addEventListener('click', () => modalLightbox.remove());
                    modalLightbox.addEventListener('click', (e) => { if (e.target === modalLightbox) modalLightbox.remove(); });
                    lucide.createIcons();
                });
            });

            // Audio player simulation
            document.querySelectorAll('.play-btn').forEach(btn => {
                btn.addEventListener('click', function() {
                    const audioItem = this.closest('.audio-item');
                    const progressFill = audioItem.querySelector('.progress-fill');
                    if (this.classList.contains('playing')) {
                        this.classList.remove('playing');
                        this.innerHTML = '<i data-lucide="play"></i>';
                        clearInterval(this.interval);
                        progressFill.style.width = '0%';
                        lucide.createIcons();
                    } else {
                        // Stop others
                        document.querySelectorAll('.play-btn').forEach(b => {
                            if (b !== this && b.classList.contains('playing')) {
                                b.classList.remove('playing');
                                b.innerHTML = '<i data-lucide="play"></i>';
                                clearInterval(b.interval);
                                b.closest('.audio-item').querySelector('.progress-fill').style.width = '0%';
                            }
                        });
                        this.classList.add('playing');
                        this.innerHTML = '<i data-lucide="pause"></i>';
                        lucide.createIcons();
                        let width = 0;
                        this.interval = setInterval(() => {
                            width += 2;
                            if (width >= 100) {
                                clearInterval(this.interval);
                                this.classList.remove('playing');
                                this.innerHTML = '<i data-lucide="play"></i>';
                                progressFill.style.width = '0%';
                                lucide.createIcons();
                            } else {
                                progressFill.style.width = width + '%';
                            }
                        }, 100);
                    }
                });
            });

            // Calendar
            let currentMonth = new Date();
            function generateCalendar() {
                const calendar = document.getElementById('calendarGrid');
                const monthNames = ['January','February','March','April','May','June','July','August','September','October','November','December'];
                document.getElementById('currentMonth').textContent = monthNames[currentMonth.getMonth()] + ' ' + currentMonth.getFullYear();
                calendar.innerHTML = '';
                const dayNames = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
                dayNames.forEach(day => { let el = document.createElement('div'); el.className = 'calendar-day-name'; el.textContent = day; calendar.appendChild(el); });
                const firstDay = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1).getDay();
                const daysInMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0).getDate();
                for (let i = 0; i < firstDay; i++) { let empty = document.createElement('div'); empty.className = 'calendar-day empty'; calendar.appendChild(empty); }
                for (let day = 1; day <= daysInMonth; day++) {
                    let dayEl = document.createElement('div');
                    dayEl.className = 'calendar-day';
                    dayEl.textContent = day;
                    // Simulate availability: even days available after 15th become blocked
                    if (day <= 15) dayEl.classList.add('available');
                    else if (day % 2 === 0) dayEl.classList.add('available');
                    else dayEl.classList.add('blocked');
                    dayEl.addEventListener('click', () => alert(`Selected date: ${monthNames[currentMonth.getMonth()]} ${day}, ${currentMonth.getFullYear()}. Use booking form to request.`));
                    calendar.appendChild(dayEl);
                }
            }
            document.getElementById('prevMonth').addEventListener('click', () => { currentMonth.setMonth(currentMonth.getMonth() - 1); generateCalendar(); });
            document.getElementById('nextMonth').addEventListener('click', () => { currentMonth.setMonth(currentMonth.getMonth() + 1); generateCalendar(); });
            generateCalendar();

            // Scroll reveal animation
            const observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        entry.target.style.opacity = '1';
                        entry.target.style.transform = 'translateY(0)';
                    }
                });
            }, { threshold: 0.1 });
            document.querySelectorAll('.section-card, .pricing-card, .review-item, .history-item, .sidebar-card').forEach(el => {
                el.style.opacity = '0';
                el.style.transform = 'translateY(20px)';
                el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
                observer.observe(el);
            });
        });