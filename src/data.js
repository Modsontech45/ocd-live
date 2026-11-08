// Données fictives pour la maquette OCD Live. Rien ici n'est réel : prix, créneaux et réservations sont des exemples.

export const YEAR = 2026;
export const MONTH = 11; // décembre (0 = janvier)
export const LIVE_MINUTES = 90;

export const MODES = [
  {
    id: 'presentiel',
    title: 'Live en présentiel',
    place: 'Studio OCD Live · Lomé',
    text: 'Tu viens au studio, tu t’assois 1h30 devant la caméra, la régie dirige ton live et tu vends.',
    points: ['Régie et caméra fournies', 'Live diffusé sur le compte OCD Live', 'Tu présentes ton produit en direct'],
  },
  {
    id: 'distance',
    title: 'Live à distance',
    place: 'Partout en Afrique et dans le monde',
    text: 'Tu restes chez toi ou dans ta boutique. Une animatrice OCD Live t’accompagne depuis le studio pendant tout le live.',
    points: ['Animatrice dédiée au studio', 'Tu passes en live depuis ton téléphone', 'Idéal depuis le Cameroun, le Tchad, la Centrafrique…'],
  },
];

// Créneaux de 1h30 avec 15 min entre deux lives
export const SLOTS = ['08:00', '09:45', '11:30', '13:15', '15:00', '16:45', '18:30', '20:15'];

export function slotEnd(start) {
  const [h, m] = start.split(':').map(Number);
  const t = h * 60 + m + LIVE_MINUTES;
  return `${String(Math.floor(t / 60)).padStart(2, '0')}:${String(t % 60).padStart(2, '0')}`;
}
export const slotLabel = (s) => `${s.replace(':', 'h')} – ${slotEnd(s).replace(':', 'h')}`;

// Réservations déjà prises (pseudo-aléatoire mais stable)
function hash(n) { let x = Math.sin(n * 12.9898) * 43758.5453; return x - Math.floor(x); }
export function isTaken(day, slotIndex) {
  const date = new Date(YEAR, MONTH, day);
  if (date.getDay() === 0 && slotIndex < 3) return true; // dimanche : à partir de 13h15
  return hash(day * 31 + slotIndex * 7) < 0.34;
}
export function freeCount(day) {
  return SLOTS.filter((_, i) => !isTaken(day, i)).length;
}

export const PACKAGES = [
  { id: 'essai', name: 'Essai', lives: 1, price: 15000, tag: null,
    features: ['1 live de 1h30', 'Régie OCD Live', 'Tes coordonnées affichées pendant le live'] },
  { id: 'duo', name: 'Duo', lives: 2, price: 28000, tag: null,
    features: ['2 lives de 1h30', 'Régie OCD Live', 'Tes coordonnées affichées pendant le live'] },
  { id: 'pack4', name: 'Pack 4 lives', lives: 4, price: 50000, tag: 'Le plus choisi',
    features: ['4 lives de 1h30', '12 500 F le live au lieu de 15 000', 'Créneaux réservés à l’avance'] },
  { id: 'boost', name: 'Boost Bovann', lives: 1, price: 40000, tag: 'Visibilité', bovann: 1,
    features: ['1 live de 1h30', 'Bovann annonce ton live en vidéo sur son compte', 'Tes coordonnées affichées pendant le live'] },
  { id: 'pack4boost', name: 'Pack 4 + Boost', lives: 4, price: 80000, tag: null, bovann: 1,
    features: ['4 lives de 1h30', '1 annonce vidéo par Bovann', 'Visuel promo de ton live'] },
  { id: 'mois', name: 'Mois VIP', lives: 12, price: 160000, tag: 'Tout le mois', bovann: 2,
    features: ['12 lives (3 par semaine)', '2 annonces vidéo par Bovann', 'Visuel promo + bilan de fin de mois'] },
];

export const BUSINESSES = ['Alimentation & restauration', 'Mode & vêtements', 'Beauté & cosmétiques', 'Électronique & téléphones', 'Maison & déco', 'Santé & bien-être', 'Services', 'Autre'];

export const COUNTRIES = ['Togo', 'Bénin', 'Cameroun', 'Côte d’Ivoire', 'Burkina Faso', 'Niger', 'Tchad', 'Centrafrique', 'Gabon', 'Congo', 'RD Congo', 'Sénégal', 'Mali', 'Ghana', 'Nigeria', 'France', 'Autre pays'];

// Villes reliées au studio sur le globe 3D
export const LOME = { name: 'Lomé', lat: 6.13, lon: 1.22 };
export const CITIES = [
  { name: 'Douala', lat: 4.05, lon: 9.77 }, { name: 'Yaoundé', lat: 3.87, lon: 11.52 },
  { name: 'Abidjan', lat: 5.36, lon: -4.01 }, { name: 'Dakar', lat: 14.69, lon: -17.44 },
  { name: 'Cotonou', lat: 6.37, lon: 2.39 }, { name: 'Ouagadougou', lat: 12.37, lon: -1.52 },
  { name: 'Niamey', lat: 13.51, lon: 2.11 }, { name: 'N’Djamena', lat: 12.13, lon: 15.06 },
  { name: 'Bangui', lat: 4.39, lon: 18.56 }, { name: 'Kinshasa', lat: -4.44, lon: 15.27 },
  { name: 'Libreville', lat: 0.42, lon: 9.47 }, { name: 'Bamako', lat: 12.64, lon: -8.0 },
  { name: 'Paris', lat: 48.86, lon: 2.35 },
];

// Contour simplifié de l'Afrique et de Madagascar (lon, lat) pour allumer le continent
export const AFRICA = [[-5.9,35.8],[-1,35.1],[3,36.8],[10.2,37.2],[11.1,35.2],[10.1,33.8],[15.2,32.3],[19.9,30.9],[20,32.1],[25,31.7],[29.9,31.2],[32.3,31.3],[32.6,29.9],[35.5,23.9],[37.2,21],[38.6,18],[39.7,15.5],[43.3,12.6],[44.9,10.4],[51.2,11.8],[51,10.4],[49,6],[46,2.5],[42,-1],[40.2,-2.8],[39.3,-6.8],[40.5,-10.5],[40.6,-15],[37,-17.9],[35.3,-22.1],[35.5,-24],[32.6,-25.9],[32.9,-28.5],[30.9,-30.5],[27.9,-33],[25.6,-34],[20,-34.8],[18.4,-34],[18.1,-31],[16.5,-28.6],[15.2,-26.7],[14.5,-22.9],[11.8,-17.3],[12,-13],[13.2,-8.8],[12.2,-6],[11.8,-4.8],[9.4,0.4],[9.7,3.9],[8.5,4.5],[6.1,4.3],[4.4,6.4],[2.4,6.35],[1.2,6.13],[-1.6,5],[-4,5.2],[-7.5,4.4],[-11.5,6.9],[-13.3,8.5],[-15.1,10.9],[-16.8,13.4],[-17.5,14.7],[-16.9,19.2],[-17.1,21],[-16,23.7],[-14.9,25.8],[-13.2,27.7],[-10,29.4],[-9.8,31.5],[-8.5,33.3],[-6.9,34.1]];
export const MADAGASCAR = [[49.3,-12],[50.5,-15.5],[49.5,-17.5],[47.2,-25],[45.2,-25.5],[43.6,-23.5],[44.3,-19.5],[44.3,-16.2],[46.5,-15.7]];

const pkg = (id) => PACKAGES.find((p) => p.id === id);
// Réservations fictives déjà reçues (espace équipe)
export const MOCK_BOOKINGS = [
  { ref: 'OCD-1204', name: 'Ama Kodjo', shop: 'Chez Ama Délices', business: 'Alimentation & restauration', mode: 'presentiel', country: 'Togo', city: 'Lomé, Bè', day: 1, slot: '09:45', pack: pkg('pack4'), phone: '+228 90 •• •• 12', at: 'il y a 2 h' },
  { ref: 'OCD-1203', name: 'Mireille Ngono', shop: 'Mimi Wax Couture', business: 'Mode & vêtements', mode: 'distance', country: 'Cameroun', city: 'Douala, Akwa', day: 1, slot: '11:30', pack: pkg('boost'), phone: '+237 6 •• •• 48', at: 'il y a 3 h' },
  { ref: 'OCD-1202', name: 'Kossi Agbéko', shop: 'K-Phone Store', business: 'Électronique & téléphones', mode: 'presentiel', country: 'Togo', city: 'Lomé, Adawlato', day: 2, slot: '15:00', pack: pkg('essai'), phone: '+228 91 •• •• 07', at: 'il y a 5 h' },
  { ref: 'OCD-1201', name: 'Fatimé Abakar', shop: 'Beauté du Sahel', business: 'Beauté & cosmétiques', mode: 'distance', country: 'Tchad', city: 'N’Djamena', day: 3, slot: '18:30', pack: pkg('pack4boost'), phone: '+235 6 •• •• 31', at: 'hier' },
  { ref: 'OCD-1200', name: 'Yao Dossou', shop: 'Déco Maison Yao', business: 'Maison & déco', mode: 'presentiel', country: 'Togo', city: 'Lomé, Agoè', day: 4, slot: '08:00', pack: pkg('duo'), phone: '+228 92 •• •• 55', at: 'hier' },
  { ref: 'OCD-1199', name: 'Grâce Mbaye', shop: 'Naturel by Grâce', business: 'Santé & bien-être', mode: 'distance', country: 'Centrafrique', city: 'Bangui', day: 5, slot: '13:15', pack: pkg('mois'), phone: '+236 7 •• •• 90', at: 'il y a 2 j' },
  { ref: 'OCD-1198', name: 'Edem Amegah', shop: 'Edem Shoes', business: 'Mode & vêtements', mode: 'presentiel', country: 'Togo', city: 'Lomé, Tokoin', day: 7, slot: '16:45', pack: pkg('pack4'), phone: '+228 93 •• •• 21', at: 'il y a 3 j' },
];

export const fmt = (n) => n.toLocaleString('fr-FR').replace(/ | /g, ' ') + ' F';
export const dayLabel = (day) => new Date(YEAR, MONTH, day).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' });
