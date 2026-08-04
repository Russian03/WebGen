import { supabase } from '../lib/supabase.js';

export function initBookingModal() {
  const modal = document.getElementById('booking-modal');
  const openButtons = document.querySelectorAll('.open-booking-btn');
  const closeBtn = document.querySelector('.close-btn');
  const serviceSelect = document.querySelector('select[name="service"]');
  const timeGridContainer = document.getElementById('time-grid-container');
  const dateInput = document.getElementById('date-input');
  const timeInput = document.getElementById('time-input');
  const genderInput = document.getElementById('gender-input');

  if (!modal) return;

  let servicesMap = {};

  // Horaris d'obertura de la perruqueria
  const OPENING_HOUR = "09:00";
  const CLOSING_HOUR = "20:00";
  const STEP_MINUTES = 10; // Intervals de 10 minuts per triar hora

  function timeToMinutes(timeStr) {
    const [h, m] = timeStr.split(':').map(Number);
    return h * 60 + m;
  }

  function minutesToTime(mins) {
    const h = Math.floor(mins / 60).toString().padStart(2, '0');
    const m = (mins % 60).toString().padStart(2, '0');
    return `${h}:${m}`;
  }

  // 1. Carregar serveis des de Supabase
  async function loadServices() {
    try {
      const { data, error } = await supabase
        .from('services')
        .select('code, name, name_es, duration_female, duration_male, resource_id');

      if (error) throw error;

      if (data && serviceSelect) {
        const isSpanish = (document.documentElement.lang || 'ca').toLowerCase().startsWith('es');
        serviceSelect.innerHTML = `<option value="">${isSpanish ? '-- Selecciona un servicio --' : '-- Selecciona un servei --'}</option>`;

        data.forEach(s => {
          servicesMap[s.code] = {
            female: s.duration_female,
            male: s.duration_male,
            resource_id: s.resource_id
          };

          const opt = document.createElement('option');
          opt.value = s.code;
          opt.textContent = (isSpanish && s.name_es) ? s.name_es : s.name;
          serviceSelect.appendChild(opt);
        });
      }
    } catch (err) {
      console.error("Error carregant serveis:", err);
    }
  }

  loadServices();

  // 2. Obrir i tancar el Modal (AQUESTA ÉS LA PART QUE FALTAVA)
  function openModal(e) {
    e.preventDefault();
    document.body.style.overflow = 'hidden';
    
    const clickedElement = e.currentTarget;
    const selectedService = clickedElement.getAttribute('data-service');
    
    if (selectedService && serviceSelect) {
      serviceSelect.value = selectedService;
    }

    modal.classList.add('show');
    calculateOptimizedSlots();
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

  // 3. Controladors de Gènere i Canvis
  const genderButtons = document.querySelectorAll('.gender-btn');
  if (genderInput && !genderInput.value) {
    genderInput.value = 'female';
  }

  genderButtons.forEach(button => {
    button.addEventListener('click', () => {
      genderButtons.forEach(b => b.classList.remove('active'));
      button.classList.add('active');
      const genderVal = button.getAttribute('data-gender') || 'female';
      if (genderInput) genderInput.value = genderVal;
      calculateOptimizedSlots();
    });
  });

  serviceSelect?.addEventListener('change', calculateOptimizedSlots);

  // 4. Calendari
  const monthYearLabel = document.getElementById('calendar-month-year');
  const daysContainer = document.getElementById('calendar-days-container');
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
        if (dateInput) dateInput.value = selectedFormattedDate;

        calculateOptimizedSlots();
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

  // 5. Càlcul dinàmic d'horaris lliures
  async function calculateOptimizedSlots() {
    if (!timeGridContainer) return;

    const selectedServiceCode = serviceSelect?.value;
    const selectedDate = dateInput?.value;
    const selectedGender = genderInput?.value || 'female';

    if (!selectedServiceCode) {
      timeGridContainer.innerHTML = `<p style="grid-column: 1/-1; text-align: center; font-size: 0.85rem; color: #888;">Selecciona primer un servei.</p>`;
      return;
    }

    if (!selectedDate) {
      timeGridContainer.innerHTML = `<p style="grid-column: 1/-1; text-align: center; font-size: 0.85rem; color: #888;">Selecciona una data al calendari.</p>`;
      return;
    }

    const serviceInfo = servicesMap[selectedServiceCode];
    const duration = serviceInfo ? (selectedGender === 'male' ? serviceInfo.male : serviceInfo.female) : 30;

    timeGridContainer.innerHTML = `<p style="grid-column: 1/-1; text-align: center; font-size: 0.85rem; color: #888;">Calculant disponibilitat...</p>`;

    try {
      let maxAllowedCapacity = 1;
      if (serviceInfo?.resource_id) {
        const { data: resourceData } = await supabase
          .from('resources')
          .select('quantity')
          .eq('id', serviceInfo.resource_id)
          .maybeSingle();

        if (resourceData?.quantity) {
          maxAllowedCapacity = resourceData.quantity;
        }
      }

      const { data: existingBookings, error } = await supabase
        .from('bookings')
        .select('start_time, end_time')
        .eq('date', selectedDate);

      if (error) throw error;

      const dayStartMins = timeToMinutes(OPENING_HOUR);
      const dayEndMins = timeToMinutes(CLOSING_HOUR);

      let validStartTimes = [];

      for (let potentialStart = dayStartMins; potentialStart + duration <= dayEndMins; potentialStart += STEP_MINUTES) {
        const potentialEnd = potentialStart + duration;
        let isSlotAvailable = true;

        for (let currentMinute = potentialStart; currentMinute < potentialEnd; currentMinute++) {
          let concurrentBookings = 0;

          existingBookings?.forEach(b => {
            const bStart = timeToMinutes(b.start_time);
            const bEnd = timeToMinutes(b.end_time);

            if (currentMinute >= bStart && currentMinute < bEnd) {
              concurrentBookings++;
            }
          });

          if (concurrentBookings >= maxAllowedCapacity) {
            isSlotAvailable = false;
            break;
          }
        }

        if (isSlotAvailable) {
          validStartTimes.push(minutesToTime(potentialStart));
        }
      }

      timeGridContainer.innerHTML = '';

      if (validStartTimes.length === 0) {
        timeGridContainer.innerHTML = `<p style="grid-column: 1/-1; text-align: center; font-size: 0.85rem; color: #e74c3c;">No hi ha hores lliures disponibles per a aquesta durada (${duration} min).</p>`;
        return;
      }

      validStartTimes.forEach(timeStr => {
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.classList.add('time-btn');
        btn.innerText = timeStr;

        btn.addEventListener('click', () => {
          document.querySelectorAll('.time-btn').forEach(b => b.classList.remove('active'));
          btn.classList.add('active');
          if (timeInput) timeInput.value = timeStr;
        });

        timeGridContainer.appendChild(btn);
      });

    } catch (err) {
      console.error("Error calculant horaris:", err);
      timeGridContainer.innerHTML = `<p style="grid-column: 1/-1; text-align: center; font-size: 0.85rem; color: #e74c3c;">Error en carregar les hores.</p>`;
    }
  }

  // 6. Guardar la cita a la taula 'bookings'
  const form = document.getElementById('booking-form');

  form?.addEventListener('submit', async (e) => {
    e.preventDefault();

    const fullName = document.getElementById('full-name')?.value;
    const phone = document.getElementById('phone')?.value;
    const service = serviceSelect?.value;
    const date = dateInput?.value;
    const startTime = timeInput?.value;
    const gender = genderInput?.value || 'female';

    if (!service || !date || !startTime) {
      alert("Omple tots els camps necessaris (servei, data i hora).");
      return;
    }

    const serviceInfo = servicesMap[service];
    const duration = serviceInfo ? (gender === 'male' ? serviceInfo.male : serviceInfo.female) : 30;

    const startMins = timeToMinutes(startTime);
    const endMins = startMins + duration;
    const endTime = minutesToTime(endMins);

    try {
      const { error } = await supabase
        .from('bookings')
        .insert({
          date: date,
          start_time: startTime,
          end_time: endTime,
          client_name: fullName,
          client_phone: phone,
          service_code: service,
          gender: gender
        });

      if (error) throw error;

      alert(`¡Cita confirmada!\nData: ${date}\nDe ${startTime} a ${endTime}`);
      
      form.reset();
      closeModal();

    } catch (err) {
      console.error("Error guardant la cita:", err);
      alert("Error en guardar la cita. Comprova la connexió.");
    }
  });
}