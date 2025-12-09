import { NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const { imageDataUrl } = await request.json()

    if (!imageDataUrl) {
      return NextResponse.json(
        { error: "Image data is required" },
        { status: 400 }
      )
    }

    const FAL_API_KEY = process.env.FAL_API_KEY

    if (!FAL_API_KEY) {
      return NextResponse.json(
        { error: "FAL_API_KEY is not configured. Please add it to your .env.local file" },
        { status: 500 }
      )
    }

    // Convert data URL to blob, then to base64
    const response = await fetch(imageDataUrl)
    if (!response.ok) {
      throw new Error("Failed to fetch image data")
    }
    const blob = await response.blob()
    const arrayBuffer = await blob.arrayBuffer()
    const base64 = Buffer.from(arrayBuffer).toString("base64")
    
    // Fal.ai accepts base64 data URLs
    const base64DataUrl = `data:${blob.type || "image/jpeg"};base64,${base64}`

    // Try multiple Fal.ai endpoints - starting with the most common ones
    const endpoints = [
      "https://fal.run/fal-ai/wan/v2.2-a14b/image-to-image",
      "https://fal.run/fal-ai/flux-pro/image-to-image",
      "https://queue.fal.run/fal-ai/wan/v2.2-a14b/image-to-image",
    ]

    let lastError: Error | null = null
    
    for (const endpoint of endpoints) {
      try {
        const falResponse = await fetch(endpoint, {
          method: "POST",
          headers: {
            Authorization: `Key ${FAL_API_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            image_url: base64DataUrl,
            prompt: "professional product photography, studio lighting, clean white background, high quality, commercial photography, product on white background, professional studio setup",
            strength: 0.6,
            num_inference_steps: 30,
            guidance_scale: 7.5,
          }),
        })

        if (falResponse.ok) {
          const data = await falResponse.json()
          
          // Handle different response formats from Fal.ai
          if (data.images && Array.isArray(data.images) && data.images.length > 0) {
            return NextResponse.json({ imageUrl: data.images[0].url || data.images[0] })
          } else if (data.image?.url) {
            return NextResponse.json({ imageUrl: data.image.url })
          } else if (data.url) {
            return NextResponse.json({ imageUrl: data.url })
          } else if (data.images && typeof data.images[0] === "string") {
            return NextResponse.json({ imageUrl: data.images[0] })
          }
        } else {
          const errorData = await falResponse.json().catch(() => ({}))
          lastError = new Error(errorData.detail || errorData.message || `Endpoint ${endpoint} failed: ${falResponse.statusText}`)
          console.error(`Endpoint ${endpoint} failed:`, errorData)
          // Continue to next endpoint
          continue
        }
      } catch (err) {
        lastError = err instanceof Error ? err : new Error(String(err))
        console.error(`Error with endpoint ${endpoint}:`, err)
        continue
      }
    }

    // If all endpoints failed, throw the last error
    throw lastError || new Error("All Fal.ai endpoints failed")
  } catch (error) {
    console.error("Error processing image:", error)
    return NextResponse.json(
      { 
        error: error instanceof Error 
          ? error.message 
          : "Internal server error" 
      },
      { status: 500 }
    )
  }
}
