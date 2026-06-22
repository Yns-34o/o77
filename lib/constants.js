// Constantes partagées du site.

export const NAV_LINKS = [
  { href: '/carte', label: 'Carte' },
  { href: '/histoire', label: 'Histoire' },
  { href: '/reserver', label: 'Réserver' },
]

// Lien Deliveroo fourni par le client (page Commander).
export const DELIVEROO_URL =
  'https://deliveroo.fr/fr/menu/Paris/pontault-combault/o77-146-avenue-charles-rouxel/?day=today&geohash=u09ve1x2509h&time=ASAP&fulfillment_method=DELIVERY'

export const RESTAURANT = {
  name: "O'77",
  slogan: "O'77 par nous, pour vous !",
  phone: '09 85 00 27 73',
  phoneHref: 'tel:0985002773',
  email: 'o77pizzeria@gmail.com',
  address: {
    street: '146 Av. Charles Rouxel',
    postalCode: '77340',
    city: 'Pontault-Combault',
  },
  hoursLabel: '11h — 01h',
  cuisine: 'Fast-food & pizzeria',
}
