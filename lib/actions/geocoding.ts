'use server'

// Free geocoding using Nominatim (OpenStreetMap)
export async function geocodeAddress(
    address: string,
    city: string,
    state?: string,
    country?: string
) {
    try {
        // Build query with all components
        let query = `${address}, ${city}`
        if (state) query += `, ${state}`
        if (country) query += `, ${country}`

        const encodedQuery = encodeURIComponent(query)

        console.log('Geocoding query:', query)

        const response = await fetch(
            `https://nominatim.openstreetmap.org/search?q=${encodedQuery}&format=json&limit=1`,
            {
                headers: {
                    'User-Agent': 'LocalRoots-Marketplace',
                },
            }
        )

        if (!response.ok) {
            return { success: false, error: 'Geocoding service unavailable' }
        }

        const data = await response.json()
        console.log('Geocoding response:', data)

        if (data.length === 0) {
            return { success: false, error: 'Address not found' }
        }

        const location = data[0]

        return {
            success: true,
            latitude: parseFloat(location.lat),
            longitude: parseFloat(location.lon),
            displayName: location.display_name, // Optional: for verification
        }
    } catch (error) {
        console.error('Geocoding error:', error)
        return { success: false, error: 'Failed to geocode address' }
    }
}