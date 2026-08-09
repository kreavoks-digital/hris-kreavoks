export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const year = query.year

  const endpoints = year 
    ? [
        `https://dayoffapi.vercel.app/api?year=${year}`,
        `https://api-harilibur.vercel.app/api?year=${year}`,
        `https://libur.deno.dev/api?year=${year}`
      ]
    : [
        'https://dayoffapi.vercel.app/api',
        'https://api-harilibur.vercel.app/api',
        'https://libur.deno.dev/api'
      ];

  for (const endpoint of endpoints) {
    try {
      const data = await $fetch<any[]>(endpoint)
      if (data && Array.isArray(data) && data.length > 0) {
        return data; // Return the first one that works
      }
    } catch (error) {
      console.warn(`Fallback: Failed fetching from ${endpoint}`);
    }
  }

  return [];
})
