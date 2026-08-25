/**
 * Stubbed function to find the nearest police station.
 * TODO: Wire this up with a real Places API (e.g., Google Maps Places API or Mapbox) 
 * so we aren't blocked on external API keys today.
 *
 * @param {number} lat - Latitude
 * @param {number} lng - Longitude
 * @returns {Promise<string>} The name and address of the nearest police station
 */
export async function findNearestPoliceStation(lat, lng) {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 500))

  return 'Local Police Station (Placeholder Result)'
}
