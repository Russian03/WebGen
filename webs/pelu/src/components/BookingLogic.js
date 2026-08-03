import { supabase } from '../lib/supabase.js';

export function initBookingModal() {
  const modal = document.getElementById('booking-modal');
  const openButtons = document.querySelectorAll('.open-booking-btn');
  const closeBtn = document.querySelector('.close-btn');
  const serviceSelect = document.querySelector('select[name="service"]');
  const timeGridContainer = document.getElementById('time-grid-container');

  if (!modal) return;

  // 1. Obrir i tancar el Modal
  function openModal(e) {
    e.preventDefault();
    document.body.style.overflow = 'hidden';
    
    const clickedElement = e.currentTarget;
    const selectedService = clickedElement.getAttribute('data-service');
    
    if (selectedService && serviceSelect) {
      serviceSelect.value = selectedService;
    } else if (serviceSelect) {
      serviceSelect.value = "";
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

  // Assegurem un valor per defecte si no n'hi ha cap definit
  if (genderInput && !genderInput.value) {
    genderInput.value = 'female';
  }

  genderButtons.forEach(button => {
    button.addEventListener('click', () => {
      genderButtons.forEach(b => b.classList.remove('active'));
      button.classList.add('active');
      
      const genderVal = button.getAttribute('data-gender') || 'female';
      if (genderInput) {
        genderInput.value = genderVal;
      }
    });
  });

  // 3. Funció per carregar els slots des de Supabase segons la data
  const timeInput = document.getElementById('time-input');

  async function fetchAvailableSlots(formattedDate) {
    if (!timeGridContainer) return;

    timeGridContainer.innerHTML = `<p style="grid-column: 1/-1; text-align: center; font-size: 0.85rem; color: #888;">Carregant horaris disponibles...</p>`;
    if (timeInput) timeInput.value = '';

    try {
      const { data: slots, error } = await supabase
        .from('slots')
        .select('time')
        .eq('date', formattedDate)
        .eq('is_blocked', false)
        .eq('is_reserved', false)
        .order('time', { ascending: true });

      if (error) throw error;

      timeGridContainer.innerHTML = '';

      if (!slots || slots.length === 0) {
        timeGridContainer.innerHTML = `<p style="grid-column: 1/-1; text-align: center; font-size: 0.85rem; color: #e74c3c;">No hi ha hores disponibles per a aquesta data.</p>`;
        return;
      }

      slots.forEach(slot => {
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.classList.add('time-btn');
        btn.setAttribute('data-time', slot.time);
        btn.innerText = slot.time;

        btn.addEventListener('click', () => {
          document.querySelectorAll('.time-btn').forEach(b => b.classList.remove('active'));
          btn.classList.add('active');
          if (timeInput) timeInput.value = slot.time;
        });

        timeGridContainer.appendChild(btn);
      });

    } catch (err) {
      console.error("Error en obtenir slots:", err);
      timeGridContainer.innerHTML = `<p style="grid-column: 1/-1; text-align: center; font-size: 0.85rem; color: #e74c3c;">Error en carregar les hores.</p>`;
    }
  }

  // 4. Control de Calendari Custom
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
        
        const selectedFormattedDate = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        if (dateInput) {
          dateInput.value = selectedFormattedDate;
        }

        // CARREGUEM ELS SLOTS LLIURES PER A AQUESTA DATA
        fetchAvailableSlots(selectedFormattedDate);
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

  // 5. Submit del formulari que fa UPDATE a la taula 'slots'
  const form = document.getElementById('booking-form');

  form?.addEventListener('submit', async (e) => {
    e.preventDefault();

    const submitBtn = form.querySelector('.submit-btn');
    const originalBtnText = submitBtn ? submitBtn.innerText : '';

    const fullName = document.getElementById('full-name')?.value;
    const phone = document.getElementById('phone')?.value;
    const service = serviceSelect?.value;
    const date = dateInput?.value;
    const time = timeInput?.value;
    
    // CORRECCIÓ: Extreiem el valor del gènere (i si està buit, fem servre 'female')
    const gender = genderInput?.value || 'female';

    if (!date || !time) {
      alert("Si us plau, selecciona una data i una hora per a la reserva.");
      return;
    }

    if (submitBtn) submitBtn.innerText = "Guardant...";

    try {
      // Actualitzem l'slot existent a reservat
      const { error } = await supabase
        .from('slots')
        .update({
          is_reserved: true,
          client_name: fullName,
          client_phone: phone,
          service: service,
          gender: gender  // CORRECCIÓ: Ara s'envia el camp 'gender' a la base de dades
        })
        .eq('date', date)
        .eq('time', time);

      if (error) throw error;

      alert(`¡Cita confirmada correctament!\nEns veiem el dia ${date} a les ${time}.`);
      
      form.reset();
      
      // Reiniciem l'input de gènere a 'female' per la pròxima reserva
      if (genderInput) genderInput.value = 'female';
      
      document.querySelectorAll('.time-btn, .calendar-day-btn').forEach(b => b.classList.remove('active'));
      if (timeGridContainer) {
        timeGridContainer.innerHTML = `<p style="grid-column: 1/-1; text-align: center; font-size: 0.85rem; color: #888;">Selecciona primer una data per veure la disponibilitat.</p>`;
      }
      closeModal();

    } catch (err) {
      console.error("Error en guardar la reserva:", err);
      alert("Hi ha hagut un problema al registrar la teva cita. Torna-ho a intentar.");
    } finally {
      if (submitBtn) submitBtn.innerText = originalBtnText;
    }
  });
}