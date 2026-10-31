// Datos de contacto y redes. Los que dicen PENDIENTE los pasa Mate más adelante.
export const site = {
  name: 'Juanse Durando',
  role: 'DJ',
  city: 'Santa Fe',
  region: 'Santa Fe',
  country: 'Argentina',
  description:
    'Juanse Durando, DJ en Santa Fe capital. Fiestas, boliches y eventos privados. Contrataciones por WhatsApp.',
  // Formato internacional sin + ni espacios, ej: 5493425000000
  whatsapp: 'PENDIENTE',
  email: 'PENDIENTE',
  socials: {
    instagram: 'PENDIENTE',
    tiktok: 'PENDIENTE',
    soundcloud: 'PENDIENTE',
    spotify: 'PENDIENTE',
    youtube: 'PENDIENTE',
  },
};

export const isSet = (v: string) => v && v !== 'PENDIENTE';

export const whatsappLink = (text = 'Hola Juanse! Quiero consultar por una fecha') =>
  isSet(site.whatsapp) ? `https://wa.me/${site.whatsapp}?text=${encodeURIComponent(text)}` : '#contacto';
