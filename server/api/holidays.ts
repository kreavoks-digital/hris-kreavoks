export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const year = query.year

  let endpoint = 'https://libur.deno.dev/api'
  if (year) {
    endpoint = `https://libur.deno.dev/api?year=${year}`
  }

  try {
    const data = await $fetch(endpoint)
    return data
  } catch (error) {
    console.error('Error fetching holidays proxy:', error)
    return []
  }
})
