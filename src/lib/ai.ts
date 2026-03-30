import type { Property } from '../types';

// ─── Helpers ─────────────────────────────────────────────────────────────────

function formatPrice(price: number): string {
  return price.toLocaleString('fr-FR') + ' €';
}

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function pickRandom<T>(items: T[]): T {
  return items[Math.floor(Math.random() * items.length)];
}

// ─── Templates ───────────────────────────────────────────────────────────────

function generateApartmentDescription(property: Property): string {
  const intros = [
    `Découvrez ce magnifique appartement de ${property.rooms} pièces situé ${property.location}.`,
    `Rare sur le marché ! Appartement de ${property.surface} m² en plein cœur de ${property.location}.`,
    `Coup de cœur assuré pour cet appartement de ${property.rooms} pièces à ${property.location}.`,
  ];

  const surfaces = [
    `D'une surface de ${property.surface} m², ce bien offre ${property.bedrooms} chambre${property.bedrooms > 1 ? 's' : ''} spacieuse${property.bedrooms > 1 ? 's' : ''} et des espaces de vie lumineux.`,
    `Avec ses ${property.surface} m² habitables et ses ${property.bedrooms} chambre${property.bedrooms > 1 ? 's' : ''}, cet appartement répond aux exigences des acquéreurs les plus attentifs.`,
  ];

  const featuresText =
    property.features.length > 0
      ? `Parmi les atouts de ce bien : ${property.features.join(', ').toLowerCase()}.`
      : '';

  const locations = [
    `Idéalement situé à ${property.city} (${property.zipCode}), vous bénéficierez d'un cadre de vie agréable, proche de toutes commodités.`,
    `Le quartier de ${property.location} est prisé pour sa qualité de vie, ses commerces et ses transports.`,
  ];

  const closings = [
    `Proposé à ${formatPrice(property.price)}, ce bien ne restera pas longtemps sur le marché. Contactez-nous pour organiser une visite.`,
    `À saisir à ${formatPrice(property.price)}. N'hésitez pas à nous contacter pour plus d'informations ou pour planifier une visite.`,
  ];

  return [pickRandom(intros), pickRandom(surfaces), featuresText, pickRandom(locations), pickRandom(closings)]
    .filter(Boolean)
    .join('\n\n');
}

function generateHouseDescription(property: Property): string {
  const intros = [
    `Bienvenue dans cette superbe maison de ${property.surface} m² située à ${property.location}.`,
    `Maison d'exception de ${property.rooms} pièces au cœur de ${property.location}, un bien rare à ne pas manquer.`,
    `Venez découvrir cette belle maison familiale de ${property.surface} m² à ${property.city}.`,
  ];

  const details = [
    `Cette propriété comprend ${property.bedrooms} chambres, offrant tout l'espace nécessaire pour une vie de famille confortable. Les pièces de vie sont baignées de lumière naturelle.`,
    `Avec ${property.rooms} pièces dont ${property.bedrooms} chambres, cette maison allie espace, confort et charme. Chaque pièce a été pensée pour le bien-être de ses occupants.`,
  ];

  const featuresText =
    property.features.length > 0
      ? `Les plus de cette maison : ${property.features.join(', ').toLowerCase()}.`
      : '';

  const environment = [
    `Située dans un environnement calme et résidentiel à ${property.city} (${property.zipCode}), cette maison vous offre un cadre de vie idéal.`,
    `Le quartier de ${property.location} offre un parfait équilibre entre tranquillité et proximité des services.`,
  ];

  const closings = [
    `Proposée à ${formatPrice(property.price)}, cette maison est une opportunité à saisir rapidement. Contactez-nous dès aujourd'hui.`,
    `Prix : ${formatPrice(property.price)}. Visite sur rendez-vous uniquement — contactez notre agence pour en savoir plus.`,
  ];

  return [pickRandom(intros), pickRandom(details), featuresText, pickRandom(environment), pickRandom(closings)]
    .filter(Boolean)
    .join('\n\n');
}

function generateLandDescription(property: Property): string {
  const intros = [
    `Terrain constructible de ${property.surface} m² situé à ${property.location}, une opportunité rare pour concrétiser votre projet de construction.`,
    `À ${property.city}, découvrez ce terrain de ${property.surface} m² prêt à accueillir la maison de vos rêves.`,
  ];

  const details = [
    `Ce terrain offre une belle superficie de ${property.surface} m² dans un cadre agréable. La configuration du terrain permet une implantation optimale de votre future construction.`,
  ];

  const featuresText =
    property.features.length > 0
      ? `Caractéristiques : ${property.features.join(', ').toLowerCase()}.`
      : '';

  const closings = [
    `Proposé à ${formatPrice(property.price)}, ce terrain est une opportunité pour les constructeurs et les particuliers. Contactez-nous pour obtenir le plan cadastral et les informations d'urbanisme.`,
  ];

  return [pickRandom(intros), ...details, featuresText, pickRandom(closings)]
    .filter(Boolean)
    .join('\n\n');
}

function generateCommercialDescription(property: Property): string {
  const intros = [
    `Local commercial de ${property.surface} m² idéalement situé à ${property.location}.`,
    `Opportunité d'investissement : local commercial de ${property.surface} m² à ${property.city}.`,
  ];

  const details = [
    `Ce local dispose de ${property.surface} m² d'espace exploitable, parfaitement adapté à une activité commerciale ou de bureau. L'emplacement stratégique garantit une excellente visibilité.`,
  ];

  const featuresText =
    property.features.length > 0
      ? `Atouts du local : ${property.features.join(', ').toLowerCase()}.`
      : '';

  const closings = [
    `Prix de vente : ${formatPrice(property.price)}. Pour toute information complémentaire, n'hésitez pas à nous contacter.`,
  ];

  return [pickRandom(intros), ...details, featuresText, pickRandom(closings)]
    .filter(Boolean)
    .join('\n\n');
}

// ─── Public API ──────────────────────────────────────────────────────────────

export async function generatePropertyDescription(property: Property): Promise<string> {
  // Simulate AI processing time
  await delay(500);

  switch (property.type) {
    case 'apartment':
      return generateApartmentDescription(property);
    case 'house':
      return generateHouseDescription(property);
    case 'land':
      return generateLandDescription(property);
    case 'commercial':
      return generateCommercialDescription(property);
    default:
      return generateApartmentDescription(property);
  }
}
