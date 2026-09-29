// Reservas de la web. Mientras llega el módulo de reservas integrado
// (packages/booking, ver docs/RESERVAS.md), los botones "Reservar" abren la
// web de reservas de AJschedule del negocio en otra pestaña.
export const BOOKING_URL = 'https://ajschedule-9sc.pages.dev/reservar/demo';

export function setupBookingLinks() {
  document.querySelectorAll('.open-booking-btn').forEach((element) => {
    element.addEventListener('click', () => {
      window.open(BOOKING_URL, '_blank', 'noopener');
    });
  });
}
