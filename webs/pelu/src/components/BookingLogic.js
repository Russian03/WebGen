import { supabase } from '../lib/supabase.js';

export function initBookingModal() {
  const modal = document.getElementById('booking-modal');
  const openButtons = document.querySelectorAll('.open-booking-btn');
  const closeBtn = document.querySelector('.close-btn');
  const serviceSelect = document.querySelector('select[name="service"]');

  if (!modal) return;

  // 1. Obrir i tancar el Modal
  function openModal(e) {
    e.preventDefault();
    document.body.style.overflow = 'hidden';
    
    // Capturar el servei de la targeta clicada
    const clickedElement = e.currentTarget;
    const selectedService = clickedElement.getAttribute('data-service');
    
    if (selectedService && serviceSelect) {
      serviceSelect.value = selectedService;
    } else if (serviceSelect) {
      serviceSelect.value = ""; // Si ve del Hero o Navbar, el deixa per triar
    }

    modal.classList.add('show');
  }

  function closeModal() {
    document.body.style.overflow = '';
    modal.classList.remove('show');
  }

  openButtons.forEach(btn => btn.addEventListener('click', openModal));
  closeBtn?.addEventListener('click', closeModal);
  modal.addEventListener('click', (e) => { 
    if (e.target === modal) closeModal(); 
  });

  // 2. Control de Gènere
  const genderButtons = document.querySelectorAll('.gender-btn');
  const genderInput = document.getElementById('gender-input');

  genderButtons.forEach(button => {
    button.addEventListener('click', () => {
      genderButtons.forEach(b => b.classList.remove('active'));
      button.classList.add('active');
      if (genderInput) {
        genderInput.value = button.getAttribute('data-gender') || 'female';
      }
    });
  });

  // 3. Control de Calendari Custom
  const monthYearLabel = document.getElementById('calendar-month-year');
  const daysContainer = document.getElementById('calendar-days-container');
  const dateInput = document.getElementById('date-input');
  let currentDate = new Date();

  function renderCalendar() {
    if (!daysContainer || !monthYearLabel) return;
    daysContainer.innerHTML = '';
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    
    const monthNames = ["Gener", "Febrer", "Març", "Abril", "Maig", "Juny", "Juliol", "Agost", "Setembre", "Octubre", "Novembre", "Desembre"];
    monthYearLabel.innerText = `${monthNames[month]} ${year}`;

    const firstDayIndex = (new Date(year, month, 1).getDay() + 6) % 7;
    const lastDay = new Date(year, month + 1, 0).getDate();

    for (let i = 0; i < firstDayIndex; i++) {
      daysContainer.appendChild(document.createElement('div'));
    }

    for (let day = 1; day <= lastDay; day++) {
      const dayBtn = document.createElement('button');
      dayBtn.type = 'button';
      dayBtn.classList.add('calendar-day-btn');
      dayBtn.innerText = day.toString();
      
      dayBtn.addEventListener('click', () => {
        document.querySelectorAll('.calendar-day-btn').forEach(b => b.classList.remove('active'));
        dayBtn.classList.add('active');
        if (dateInput) {
          dateInput.value = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        }
      });
      daysContainer.appendChild(dayBtn);
    }
  }

  document.getElementById('prev-month')?.addEventListener('click', () => { 
    currentDate.setMonth(currentDate.getMonth() - 1); 
    renderCalendar(); 
  });
  
  document.getElementById('next-month')?.addEventListener('click', () => { 
    currentDate.setMonth(currentDate.getMonth() + 1); 
    renderCalendar(); 
  });
  
  renderCalendar();

  // 4. Control d'Hores
  const timeInput = document.getElementById('time-input');
  const timeBtns = document.querySelectorAll('.time-btn');

  timeBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      timeBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      if (timeInput) {
        timeInput.value = btn.getAttribute('data-time') || '';
      }
    });
  });

  // 5. Submit del formulari connectat a SUPABASE
  const form = document.getElementById('booking-form');

  form?.addEventListener('submit', async (e) => {
    e.preventDefault();

    const submitBtn = form.querySelector('.submit-btn');
    const originalBtnText = submitBtn ? submitBtn.innerText : '';

    // Recollim els valors dels camps
    const fullName = document.getElementById('full-name')?.value;
    const phone = document.getElementById('phone')?.value;
    const service = serviceSelect?.value;
    const gender = genderInput?.value;
    const date = dateInput?.value;
    const time = timeInput?.value;

    // Validació prèvia
    if (!date || !time) {
      alert("Si us plau, selecciona una data i una hora per a la reserva.");
      return;
    }

    // Canviem el text del botó mentre s'envia
    if (submitBtn) submitBtn.innerText = "Guardant...";

    try {
      // Inserim la reserva a la taula 'bookings' de Supabase
      const { data, error } = await supabase
        .from('bookings')
        .insert([
          { 
            full_name: fullName, 
            phone: phone, 
            service: service, 
            gender: gender, 
            booking_date: date, 
            booking_time: time 
          }
        ]);

      if (error) {
        throw error;
      }

      alert(`¡Cita confirmada correctament!\nEns veiem el dia ${date} a les ${time}.`);
      
      // Resetejem formulari i treiem la selecció activa de botons
      form.reset();
      document.querySelectorAll('.time-btn, .calendar-day-btn').forEach(b => b.classList.remove('active'));
      closeModal();

    } catch (err) {
      console.error("Error en guardar la reserva:", err);
      alert("Hi ha hagut un problema al registrar la teva cita. Torna-ho a intentar.");
    } finally {
      if (submitBtn) submitBtn.innerText = originalBtnText;
    }
  });
}