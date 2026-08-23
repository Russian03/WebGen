import { supabase } from '../lib/supabase.js';

export function initBookingModal() {
  const modal = document.getElementById('booking-modal');
  const openButtons = document.querySelectorAll('.open-booking-btn');
  const closeBtn = document.querySelector('.close-btn');
  const serviceSelect = document.querySelector('select[name="service"]');
  const workerSelect = document.getElementById('worker-select');
  const timeGridContainer = document.getElementById('time-grid-container');
  const durationInfoLabel = document.getElementById('service-duration-info');
  const dateInput = document.getElementById('date-input');
  const timeInput = document.getElementById('time-input');
  const genderInput = document.getElementById('gender-input');

  if (!modal) return;

  let servicesMap = {};
  let workersList = [];

  const STEP_MINUTES = 10;
  const MAX_ADVANCE_DAYS = 30; // Nombre màxim de dies permesos per reservar amb antelació
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

      const { data: workersData, error: workersErr } = await supabase
        .from('workers')
        .select('id, name, schedule, visible')
        .eq('visible', true);

      if (workersErr) throw workersErr;

      if (workersData) {
        workersList = workersData;
        if (workerSelect) {
          const isSpanish = (document.documentElement.lang || 'ca').toLowerCase().startsWith('es');
          workerSelect.innerHTML = `<option value="any">${isSpanish ? 'Sin preferencia (cualquier disponibilidad)' : 'Sense preferència (qualsevol disponibilitat)'}</option>`;
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

  async function renderCalendar() {
    if (!daysContainer || !monthYearLabel) return;
    daysContainer.innerHTML = '';
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    
    const isSpanish = (document.documentElement.lang || 'ca').toLowerCase().startsWith('es');
    const monthNamesCa = ["Gener", "Febrer", "Març", "Abril", "Maig", "Juny", "Juliol", "Agost", "Setembre", "Octubre", "Novembre", "Desembre"];
    const monthNamesEs = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];
    
    const monthNames = isSpanish ? monthNamesEs : monthNamesCa;
    monthYearLabel.innerText = `${monthNames[month]} ${year}`;

    // Obtenir dies festius del mes actual des de Supabase
    const startOfMonth = `${year}-${String(month + 1).padStart(2, '0')}-01`;
    const endOfMonth = `${year}-${String(month + 1).padStart(2, '0')}-${new Date(year, month + 1, 0).getDate()}`;
    
    let holidayDates = new Set();
    try {
      const { data: holidaysData } = await supabase
        .from('holidays')
        .select('date')
        .gte('date', startOfMonth)
        .lte('date', endOfMonth);
      
      if (holidaysData) {
        holidaysData.forEach(h => holidayDates.add(h.date));
      }
    } catch (e) {
      console.error("Error carregant festius:", e);
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const maxBookingDate = new Date(today);
    maxBookingDate.setDate(today.getDate() + MAX_ADVANCE_DAYS);

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

      const thisDate = new Date(year, month, day);
      thisDate.setHours(0, 0, 0, 0);

      const formattedDate = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      const isPast = thisDate < today;
      const isToday = thisDate.getTime() === today.getTime();
      const isHoliday = holidayDates.has(formattedDate);
      const exceedsMaxDays = thisDate > maxBookingDate;

      if (isToday) {
        dayBtn.classList.add('today');
      }

      if (isPast) {
        dayBtn.disabled = true;
        dayBtn.classList.add('disabled', 'past');
      } else if (isHoliday) {
        dayBtn.disabled = true;
        dayBtn.classList.add('disabled', 'holiday');
        dayBtn.title = isSpanish ? 'Día festivo' : 'Dia festiu';
      } else if (exceedsMaxDays) {
        dayBtn.disabled = true;
        dayBtn.classList.add('disabled', 'exceeds-max');
        dayBtn.title = isSpanish 
          ? `No se puede reservar con más de ${MAX_ADVANCE_DAYS} días de antelación` 
          : `No es pot reservar amb més de ${MAX_ADVANCE_DAYS} dies d'antelació`;
      } else {
        dayBtn.addEventListener('click', () => {
          document.querySelectorAll('.calendar-day-btn').forEach(b => b.classList.remove('active'));
          dayBtn.classList.add('active');
          
          if (dateInput) dateInput.value = formattedDate;
          calculateOptimizedSlots();
        });
      }

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

    const isSpanish = (document.documentElement.lang || 'ca').toLowerCase().startsWith('es');
    const selectedServiceCode = serviceSelect?.value;
    const selectedDate = dateInput?.value;
    const selectedGender = genderInput?.value || 'female';
    const selectedWorkerId = workerSelect?.value || 'any';

    if (!selectedServiceCode) {
      if (durationInfoLabel) durationInfoLabel.style.display = 'none';
      timeGridContainer.innerHTML = `<p style="grid-column: 1/-1; text-align: center; font-size: 0.85rem; color: #888;">${isSpanish ? 'Selecciona primero un servicio.' : 'Selecciona primer un servei.'}</p>`;
      return;
    }

    const serviceInfo = servicesMap[selectedServiceCode];
    const duration = serviceInfo ? (selectedGender === 'male' ? serviceInfo.male : serviceInfo.female) : 30;

    if (durationInfoLabel) {
      const durationText = isSpanish 
        ? `Duración aproximada del servicio: ${duration} min`
        : `Durada aproximada del servei: ${duration} min`;
      
      durationInfoLabel.innerText = durationText;
      durationInfoLabel.style.display = 'block';
    }

    if (!selectedDate) {
      timeGridContainer.innerHTML = `<p style="grid-column: 1/-1; text-align: center; font-size: 0.85rem; color: #888;">${isSpanish ? 'Selecciona una fecha en el calendario.' : 'Selecciona una data al calendari.'}</p>`;
      return;
    }

    const todayStr = new Date().toISOString().split('T')[0];
    if (selectedDate < todayStr) {
      timeGridContainer.innerHTML = `<p style="grid-column: 1/-1; text-align: center; font-size: 0.85rem; color: #e74c3c;">${isSpanish ? 'No se puede reservar en fechas pasadas.' : 'No es pot reservar en dates passades.'}</p>`;
      return;
    }

    const { data: holidayCheck } = await supabase
      .from('holidays')
      .select('name')
      .eq('date', selectedDate)
      .maybeSingle();

    if (holidayCheck) {
      timeGridContainer.innerHTML = `<p style="grid-column: 1/-1; text-align: center; font-size: 0.85rem; color: #e74c3c;">${isSpanish ? `Día festivo (${holidayCheck.name}). No disponible.` : `Dia festiu (${holidayCheck.name}). No disponible.`}</p>`;
      return;
    }

    timeGridContainer.innerHTML = `<p style="grid-column: 1/-1; text-align: center; font-size: 0.85rem; color: #888;">${isSpanish ? 'Calculando disponibilidad...' : 'Calculant disponibilitat...'}</p>`;

    try {
      const dateObj = new Date(selectedDate);
      const dayName = dayMap[dateObj.getDay()];

      const { data: existingBookings, error } = await supabase
        .from('bookings')
        .select('start_time, end_time, worker_id')
        .eq('date', selectedDate);

      if (error) throw error;

      const activeWorkers = selectedWorkerId === 'any'
        ? workersList.filter(w => (w.visible !== false) && w.schedule[dayName]?.active)
        : workersList.filter(w => (w.visible !== false) && w.id === selectedWorkerId && w.schedule[dayName]?.active);

      if (activeWorkers.length === 0) {
        timeGridContainer.innerHTML = `<p style="grid-column: 1/-1; text-align: center; font-size: 0.85rem; color: #e74c3c;">${isSpanish ? 'No hay personal disponible este día.' : 'No hi ha personal disponible aquest dia.'}</p>`;
        return;
      }

      let validStartTimes = new Set();

      activeWorkers.forEach(worker => {
        const schedule = worker.schedule[dayName];
        
        const shifts = [];
        if (schedule.morning && schedule.afternoon) {
          shifts.push(schedule.morning);
          shifts.push(schedule.afternoon);
        } else if (schedule.start && schedule.end) {
          shifts.push({ start: schedule.start, end: schedule.end });
        }

        const workerBookings = existingBookings.filter(b => b.worker_id === worker.id);

        shifts.forEach(shift => {
          const shiftStartMins = timeToMinutes(shift.start);
          const shiftEndMins = timeToMinutes(shift.end);

          for (let potentialStart = shiftStartMins; potentialStart + duration <= shiftEndMins; potentialStart += STEP_MINUTES) {
            const potentialEnd = potentialStart + duration;
            let isAvailable = true;

            for (let b of workerBookings) {
              const bStart = timeToMinutes(b.start_time);
              const bEnd = timeToMinutes(b.end_time);

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
        timeGridContainer.innerHTML = `<p style="grid-column: 1/-1; text-align: center; font-size: 0.85rem; color: #e74c3c;">${isSpanish ? `No hay horas libres disponibles para esta duración (${duration} min).` : `No hi ha hores lliures disponibles per a aquesta durada (${duration} min).`}</p>`;
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
      timeGridContainer.innerHTML = `<p style="grid-column: 1/-1; text-align: center; font-size: 0.85rem; color: #e74c3c;">${isSpanish ? 'Error al cargar las horas.' : 'Error en carregar les hores.'}</p>`;
    }
  }

  // 6. Guardar la cita
  const form = document.getElementById('booking-form');

  form?.addEventListener('submit', async (e) => {
    e.preventDefault();

    const isSpanish = (document.documentElement.lang || 'ca').toLowerCase().startsWith('es');
    const fullName = document.getElementById('full-name')?.value;
    
    // Captura robusta del telèfon (tant per ID com per atribut name)
    const phoneInput = document.getElementById('phone') || document.querySelector('input[name="phone"]');
    const phone = phoneInput ? phoneInput.value : '';
    
    const email = document.getElementById('email')?.value;
    const service = serviceSelect?.value;
    const date = dateInput?.value;
    const startTime = timeInput?.value;
    const gender = genderInput?.value || 'female';
    let workerId = workerSelect?.value;

    // Validació de format de correu electrònic
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || !emailRegex.test(email)) {
      alert(isSpanish ? "Por favor, introduce un correo electrónico válido." : "Si us plau, introdueix un correu electrònic vàlid.");
      return;
    }

    // Validació flexible del telèfon (elimina espais, guions, parèntesis i accepta prefix +)
    const cleanPhone = phone ? phone.replace(/[\s\-\(\)]/g, '') : '';
    const phoneRegex = /^\+?[0-9]{9,15}$/;

    if (!phone || !phoneRegex.test(cleanPhone)) {
      alert(isSpanish ? "Por favor, introduce un número de teléfono válido." : "Si us plau, introdueix un número de telèfon vàlid.");
      return;
    }

    if (!service || !date || !startTime) {
      alert(isSpanish ? "Completa todos los campos necesarios (servicio, fecha y hora)." : "Omple tots els camps necessaris (servei, data i hora).");
      return;
    }

    const serviceInfo = servicesMap[service];
    const duration = serviceInfo ? (gender === 'male' ? serviceInfo.male : serviceInfo.female) : 30;

    const startMins = timeToMinutes(startTime);
    const endMins = startMins + duration;
    const endTime = minutesToTime(endMins);

    if (workerId === 'any' || !workerId) {
      const dateObj = new Date(date);
      const dayName = dayMap[dateObj.getDay()];

      const { data: existingBookings } = await supabase
        .from('bookings')
        .select('worker_id, start_time, end_time')
        .eq('date', date);

      const availableWorkers = workersList.filter(w => {
        if (w.visible === false || !w.schedule[dayName]?.active) return false;
        
        const schedule = w.schedule[dayName];
        const shifts = schedule.morning && schedule.afternoon 
          ? [schedule.morning, schedule.afternoon]
          : [{ start: schedule.start, end: schedule.end }];
      
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
        alert(isSpanish ? "Esta hora ya no está disponible." : "Aquesta hora ja no està disponible.");
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
          client_phone: phone, // Desa el telèfon tal com l'ha escrit l'usuari
          client_email: email,
          service_code: service,
          gender: gender,
          worker_id: workerId
        });

      if (error) throw error;

      // Enviament automàtic de correu electrònic de confirmació
      try {
        const emailRes = await fetch('/api/send-email', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: email,
            name: fullName,
            date: date,
            startTime: startTime,
            endTime: endTime,
            service: service
          })
        });

        const emailData = await emailRes.json();
        
        if (!emailRes.ok) {
          console.error("Error enviant el correu (Resend):", emailData);
        } else {
          console.log("Correu enviat correctament amb Resend:", emailData);
        }
      } catch (emailErr) {
        console.error("Error de xarxa o de connexió enviant el correu electrònic:", emailErr);
      }

      alert(isSpanish 
        ? `¡Cita confirmada! Te hemos enviado una confirmación a ${email}.\nFecha: ${date}\nDe ${startTime} a ${endTime}` 
        : `¡Cita confirmada! T'hem enviat una confirmació a ${email}.\nData: ${date}\nDe ${startTime} a ${endTime}`
      );
      
      form.reset();
      if (durationInfoLabel) durationInfoLabel.style.display = 'none';
      closeModal();

    } catch (err) {
      console.error("Error guardant la cita:", err);
      alert(isSpanish ? "Error al guardar la cita. Comprueba la conexión." : "Error en guardar la cita. Comprova la connexió.");
    }
  });
}