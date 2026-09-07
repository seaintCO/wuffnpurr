export const products = [
  { id: 'pawbridge', name: 'PawBridge Pet Stairs', priceCents: 3999, description: 'Soft-step stairs designed to make beds, sofas and favorite spaces easier to reach.', image: 'pawbridge-stairs.jpg' },
  { id: 'haven', name: 'Haven Pet Bed', priceCents: 7999, description: 'A supportive everyday bed created for comfortable lounging and overnight rest.', image: 'haven-pet-bed.jpg' },
  { id: 'companion', name: 'Companion Collar', priceCents: 2499, description: 'A refined adjustable collar built for everyday comfort, walks and identification.', image: 'companion-collar.jpg' },
  { id: 'waypoint', name: 'Waypoint Travel Kit', priceCents: 4999, description: 'A considered travel system for road trips, weekends away and daily life on the move.', image: 'waypoint-travel-kit.jpg' },
  { id: 'shedaway', name: 'ShedAway Vacuum', priceCents: 4499, description: 'Compact pet-hair cleanup for furniture, rugs, vehicles and the places fur collects most.', image: 'shedaway-vacuum.jpg' },
  { id: 'roadpaws', name: 'RoadPaws', priceCents: 5499, description: 'A padded travel seat created for cleaner, calmer and more comfortable car rides.', image: 'roadpaws.jpg' },
  { id: 'nailgrinder', name: 'Pet Nail Grinder', priceCents: 1999, description: 'Controlled at-home nail care in a compact format made for routine grooming.', image: 'pet-nail-grinder.jpg' },
  { id: 'freshnest', name: 'FreshNest', priceCents: 24999, description: 'A premium self-cleaning home-care solution created to simplify daily litter maintenance.', image: 'freshnest.jpg' },
  { id: 'gentlegroom', name: 'GentleGroom', priceCents: 2999, description: 'Gentle coat care for detangling, brushing and everyday loose-hair removal.', image: 'gentlegroom.jpg' }
];

export const productById = Object.fromEntries(products.map(product => [product.id, product]));
