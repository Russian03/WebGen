import type { APIRoute } from 'astro';
import { Resend } from 'resend';

// Substitueix la teva clau de Resend (comença per 're_...')
const resend = new Resend(import.meta.env.RESEND_API_KEY);

export const POST: APIRoute = async ({ request }) => {
  try {
    const body = await request.json();
    const { email, name, date, startTime, endTime, service } = body;

    // Enviem el correu electrònic amb Resend
    await resend.emails.send({
      from: 'Reserves <onboarding@resend.dev>', // Modifica-ho pel teu domini quan estigui verificat a Resend
      to: [email],
      subject: 'Confirmació de la teva cita',
      html: `
        <div style="font-family: sans-serif; padding: 20px; color: #333;">
          <h2>Hola ${name}, la teva cita està confirmada!</h2>
          <p>Gràcies per reservar amb nosaltres. Aquí tens els detalls de la teva reserva:</p>
          <ul style="line-height: 1.6;">
            <li><strong>Data:</strong> ${date}</li>
            <li><strong>Horari:</strong> De ${startTime} a ${endTime}</li>
            <li><strong>Servei:</strong> ${service}</li>
          </ul>
          <p>T'esperem!</p>
        </div>
      `
    });

    return new Response(JSON.stringify({ success: true }), { 
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), { 
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};