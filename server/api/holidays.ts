export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const year = query.year

  // Use Nager.Date API as fallback since Indonesian APIs are dead
  const targetYear = year || new Date().getFullYear();
  const nagerEndpoint = `https://date.nager.at/api/v3/PublicHolidays/${targetYear}/ID`;

  try {
    const data = await $fetch<any[]>(nagerEndpoint);
    if (data && Array.isArray(data) && data.length > 0) {
      // Map Nager.Date format to our expected format
      return data.map(h => ({
        date: h.date,
        name: h.localName || h.name
      }));
    }
  } catch (error) {
    console.warn(`Failed fetching from Nager.Date API`);
  }

  return [];
})
