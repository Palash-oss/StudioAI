interface FalAIResponse {
  images?: Array<{ url: string }>
  image?: { url: string }
  error?: string
}

export async function processImageWithFal(
  imageDataUrl: string
): Promise<string | null> {
  const FAL_API_KEY = process.env.NEXT_PUBLIC_FAL_API_KEY

  if (!FAL_API_KEY) {
    throw new Error("FAL_API_KEY is not set. Please add it to your .env.local file")
  }

  try {
    // Convert data URL to blob
    const response = await fetch(imageDataUrl)
    const blob = await response.blob()

    // Create FormData
    const formData = new FormData()
    formData.append("image_file", blob, "product.jpg")

    // Call Fal.ai API - Using flux-pro image-to-image endpoint
    // This endpoint places the product in a professional background
    const falResponse = await fetch(
      "https://fal.run/fal-ai/flux-pro/image-to-image",
      {
        method: "POST",
        headers: {
          Authorization: `Key ${FAL_API_KEY}`,
        },
        body: formData,
      }
    )

    if (!falResponse.ok) {
      const errorData = await falResponse.json().catch(() => ({}))
      throw new Error(
        errorData.detail || `Fal.ai API error: ${falResponse.statusText}`
      )
    }

    const data: FalAIResponse = await falResponse.json()

    // Handle different response formats
    if (data.images && data.images.length > 0) {
      return data.images[0].url
    } else if (data.image?.url) {
      return data.image.url
    } else if (data.error) {
      throw new Error(data.error)
    }

    return null
  } catch (error) {
    console.error("Error calling Fal.ai API:", error)
    throw error
  }
}

