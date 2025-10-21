'use server'

export async function geocodeAddress(
    address: string,
    city: string,
    state?: string,
    country?: string
) {
    const apiKey = process.env.GOOGLE_MAPS_API_KEY

    if (!apiKey) {
        console.error('GOOGLE_MAPS_API_KEY not found in environment variables')
        return { success: false, error: 'Geocoding API key not configured' }
    }

    try {
        // Build the address components
        let fullAddress = ''

        if (address && address.trim()) {
            fullAddress += address.trim()
        }

        if (city && city.trim()) {
            fullAddress += (fullAddress ? ', ' : '') + city.trim()
        }

        if (state && state.trim()) {
            fullAddress += (fullAddress ? ', ' : '') + state.trim()
        }

        if (country && country.trim()) {
            fullAddress += (fullAddress ? ', ' : '') + country.trim()
        }


        const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(fullAddress)}&key=${apiKey}`

        const response = await fetch(url)

        if (!response.ok) {
            return { success: false, error: 'Geocoding service unavailable' }
        }

        const data = await response.json()

        if (data.status === 'ZERO_RESULTS') {
            return {
                success: false,
                error: 'Address not found. Try simplifying your address.'
            }
        }

        if (data.status !== 'OK') {
            return {
                success: false,
                error: `Geocoding failed: ${data.status}`
            }
        }

        const location = data.results[0].geometry.location

        return {
            success: true,
            latitude: location.lat,
            longitude: location.lng,
            displayName: data.results[0].formatted_address,
        }
    } catch (error) {
        console.error('Geocoding error:', error)
        return { success: false, error: 'Failed to geocode address' }
    }
}