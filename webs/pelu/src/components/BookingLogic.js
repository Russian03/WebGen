import { supabase } from '../lib/supabase.js';

export function initBookingModal() {
  const modal = document.getElementById('booking-modal');
  const openButtons = document.querySelectorAll('.open-booking-btn');
  const closeBtn = document.querySelector('.close-btn');
  const serviceSelect = document.querySelector('select[name="service"]');
  const workerSelect = document.getElementById('worker-select'); // Element selector treballador
  const timeGridContainer = document.getElementById('time-grid-container');
  const dateInput = document.getElementById('date-input');
  const timeInput = document.getElementById('time-input');
  const genderInput = document.getElementById('gender-input');

  if (!modal) return;

  let servicesMap = {};
  let workersList = [];

  const STEP_MINUTES = 10;
  const dayMap = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];

  function timeToMinutes(timeStr) {
    const [h, m] = timeStr.split(':').map(Number);
    return h * 60 + m;
  }

  function minutesToTime(mins) {
    const h = Math.floor(mins / 60).toString().padStart(2, '0');
    const m = (mins % 60).toString().padStart(2, '0');
    return `${h}:${m}`;
  }

  // 1. Carregar serveis i treballadors des de Supabase
  async function loadInitialData() {
    try {
      // Carregar serveis
      const { data: servicesData, error: servicesErr } = await supabase
        .from('services')
        .select('code, name, name_es, duration_female, duration_male, resource_id');

      if (servicesErr) throw servicesErr;

      if (servicesData && serviceSelect) {
        const isSpanish = (document.documentElement.lang || 'ca').toLowerCase().startsWith('es');
        serviceSelect.innerHTML = `<option value="">${isSpanish ? '-- Selecciona un servicio --' : '-- Selecciona un servei --'}</option>`;

        servicesData.forEach(s => {
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

      // Carregar treballadors
      const { data: workersData, error: workersErr } = await supabase
        .from('workers')
        .select('id, name, schedule');

      if (workersErr) throw workersErr;

      if (workersData) {
        workersList = workersData;
        if (workerSelect) {
          workerSelect.innerHTML = `<option value="any">Sense preferència (qualsevol disponibilitat)</option>`;
          workersData.forEach(w => {
            const opt = document.createElement('option');
            opt.value = w.id;
            opt.textContent = w.name;
            workerSelect.appendChild(opt);
          });
        }
      }
    } catch (err) {
      console.error("Error carregant dades inicials:", err);
    }
  }

  loadInitialData();

  // 2. Obrir i tancar el Modal
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
  workerSelect?.addEventListener('change', calculateOptimizedSlots);

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

  // 5. Càlcul dinàmic d'horaris lliures segons el Treballador i el seu Horari
  async function calculateOptimizedSlots() {
    if (!timeGridContainer) return;

    const selectedServiceCode = serviceSelect?.value;
    const selectedDate = dateInput?.value;
    const selectedGender = genderInput?.value || 'female';
    const selectedWorkerId = workerSelect?.value || 'any';

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
      const dateObj = new Date(selectedDate);
      const dayName = dayMap[dateObj.getDay()];

      // Obtenir totes les reserves d'aquell dia
      const { data: existingBookings, error } = await supabase
        .from('bookings')
        .select('start_time, end_time, worker_id')
        .eq('date', selectedDate);

      if (error) throw error;

      // Filtrar quins treballadors estan actius aquest dia
      const activeWorkers = selectedWorkerId === 'any'
        ? workersList.filter(w => w.schedule[dayName]?.active)
        : workersList.filter(w => w.id === selectedWorkerId && w.schedule[dayName]?.active);

      if (activeWorkers.length === 0) {
        timeGridContainer.innerHTML = `<p style="grid-column: 1/-1; text-align: center; font-size: 0.85rem; color: #e74c3c;">No hi ha personal disponible aquest dia.</p>`;
        return;
      }

      let validStartTimes = new Set();

      // Comprovar disponibilitat per cada treballador elegible
      // Comprovar disponibilitat per cada treballador elegible
      activeWorkers.forEach(worker => {
        const schedule = worker.schedule[dayName];
        
        // Obtenir els dos intervals (suportant tant l'estructura antiga com la nova)
        const shifts = [];
        if (schedule.morning && schedule.afternoon) {
          shifts.push(schedule.morning);
          shifts.push(schedule.afternoon);
        } else if (schedule.start && schedule.end) {
          shifts.push({ start: schedule.start, end: schedule.end });
        }

        // Obtenir reserves d'aquest treballador en concret
        const workerBookings = existingBookings.filter(b => b.worker_id === worker.id);

        // Comprovar disponibilitat en cada torn (Matí / Tarda)
        shifts.forEach(shift => {
          const shiftStartMins = timeToMinutes(shift.start);
          const shiftEndMins = timeToMinutes(shift.end);

          for (let potentialStart = shiftStartMins; potentialStart + duration <= shiftEndMins; potentialStart += STEP_MINUTES) {
            const potentialEnd = potentialStart + duration;
            let isAvailable = true;

            for (let b of workerBookings) {
              const bStart = timeToMinutes(b.start_time);
              const bEnd = timeToMinutes(b.end_time);

              // Comprovar si hi ha solapament amb altres reserves
              if (potentialStart < bEnd && potentialEnd > bStart) {
                isAvailable = false;
                break;
              }
            }

            if (isAvailable) {
              validStartTimes.add(minutesToTime(potentialStart));
            }
          }
        });
      });

      timeGridContainer.innerHTML = '';
      const sortedTimes = Array.from(validStartTimes).sort();

      if (sortedTimes.length === 0) {
        timeGridContainer.innerHTML = `<p style="grid-column: 1/-1; text-align: center; font-size: 0.85rem; color: #e74c3c;">No hi ha hores lliures disponibles per a aquesta durada (${duration} min).</p>`;
        return;
      }

      sortedTimes.forEach(timeStr => {
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

  // 6. Guardar la cita assignant el treballador a la taula 'bookings'
  const form = document.getElementById('booking-form');

  form?.addEventListener('submit', async (e) => {
    e.preventDefault();

    const fullName = document.getElementById('full-name')?.value;
    const phone = document.getElementById('phone')?.value;
    const service = serviceSelect?.value;
    const date = dateInput?.value;
    const startTime = timeInput?.value;
    const gender = genderInput?.value || 'female';
    let workerId = workerSelect?.value;

    if (!service || !date || !startTime) {
      alert("Omple tots els camps necessaris (servei, data i hora).");
      return;
    }

    const serviceInfo = servicesMap[service];
    const duration = serviceInfo ? (gender === 'male' ? serviceInfo.male : serviceInfo.female) : 30;

    const startMins = timeToMinutes(startTime);
    const endMins = startMins + duration;
    const endTime = minutesToTime(endMins);

    // Si ha triat "Sense preferència", s'assigna automàticament el primer treballador lliure en aquella franja
    if (workerId === 'any' || !workerId) {
      const dateObj = new Date(date);
      const dayName = dayMap[dateObj.getDay()];

      const { data: existingBookings } = await supabase
        .from('bookings')
        .select('worker_id, start_time, end_time')
        .eq('date', date);

      const availableWorkers = workersList.filter(w => {
        if (!w.schedule[dayName]?.active) return false;
        
        const schedule = w.schedule[dayName];
        const shifts = schedule.morning && schedule.afternoon 
          ? [schedule.morning, schedule.afternoon]
          : [{ start: schedule.start, end: schedule.end }];
      
        // Comprovar si la cita entra dins de qualsevol dels seus torns (matí o tarda)
        const fitsInAShift = shifts.some(shift => {
          const wStart = timeToMinutes(shift.start);
          const wEnd = timeToMinutes(shift.end);
          return startMins >= wStart && endMins <= wEnd;
        });
      
        if (!fitsInAShift) return false;
      
        const wBookings = (existingBookings || []).filter(b => b.worker_id === w.id);
        return !wBookings.some(b => {
          const bStart = timeToMinutes(b.start_time);
          const bEnd = timeToMinutes(b.end_time);
          return startMins < bEnd && endMins > bStart;
        });
      });

      if (availableWorkers.length > 0) {
        workerId = availableWorkers[0].id;
      } else {
        alert("Aquesta hora ja no està disponible.");
        return;
      }
    }

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
          gender: gender,
          worker_id: workerId // <--- Es guarda la ID del treballador assignat
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