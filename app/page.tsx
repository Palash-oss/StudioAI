"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Upload, Sparkles, Download, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { toast } from "sonner"
import ImageUpload from "@/components/image-upload"

export default function Home() {
  const [uploadedImage, setUploadedImage] = useState<string | null>(null)
  const [processedImage, setProcessedImage] = useState<string | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)

  const handleImageUpload = (imageUrl: string) => {
    setUploadedImage(imageUrl)
    setProcessedImage(null)
  }

  const handleProcessImage = async () => {
    if (!uploadedImage) {
      toast.error("Please upload an image first")
      return
    }

    setIsProcessing(true)
    setProcessedImage(null)

    try {
      const response = await fetch("/api/process-image", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ imageDataUrl: uploadedImage }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to process image")
      }

      if (data.imageUrl) {
        setProcessedImage(data.imageUrl)
        toast.success("Image processed successfully!")
      } else {
        toast.error("No image returned from API")
      }
    } catch (error) {
      console.error("Error processing image:", error)
      toast.error(
        error instanceof Error
          ? error.message
          : "An error occurred while processing the image"
      )
    } finally {
      setIsProcessing(false)
    }
  }

  const handleDownload = () => {
    if (!processedImage) return

    const link = document.createElement("a")
    link.href = processedImage
    link.download = "studioai-processed-image.png"
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    toast.success("Image downloaded!")
  }

  const handleReset = () => {
    setUploadedImage(null)
    setProcessedImage(null)
  }

  return (
    <main className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-16">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <div className="flex items-center justify-center gap-2 mb-4">
            <Sparkles className="h-8 w-8 text-primary" />
            <h1 className="text-4xl font-bold tracking-tight">StudioAI</h1>
          </div>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Transform your product photos with AI-powered professional backgrounds
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-6 max-w-6xl mx-auto">
          {/* Upload Section */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Upload className="h-5 w-5" />
                  Upload Product Photo
                </CardTitle>
                <CardDescription>
                  Upload a photo of your product to get started
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ImageUpload onImageUpload={handleImageUpload} />
                {uploadedImage && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="mt-4 relative aspect-square rounded-lg overflow-hidden border"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={uploadedImage}
                      alt="Uploaded product"
                      className="w-full h-full object-contain"
                    />
                  </motion.div>
                )}
                {uploadedImage && (
                  <div className="mt-4 flex gap-2">
                    <Button
                      onClick={handleProcessImage}
                      disabled={isProcessing}
                      className="flex-1"
                    >
                      {isProcessing ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Processing...
                        </>
                      ) : (
                        <>
                          <Sparkles className="mr-2 h-4 w-4" />
                          Process with AI
                        </>
                      )}
                    </Button>
                    <Button
                      onClick={handleReset}
                      variant="outline"
                      disabled={isProcessing}
                    >
                      Reset
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>

          {/* Result Section */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5" />
                  AI Processed Result
                </CardTitle>
                <CardDescription>
                  Your product with a professional background
                </CardDescription>
              </CardHeader>
              <CardContent>
                {isProcessing ? (
                  <div className="aspect-square rounded-lg overflow-hidden border">
                    <Skeleton className="w-full h-full" />
                  </div>
                ) : processedImage ? (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="space-y-4"
                  >
                    <div className="relative aspect-square rounded-lg overflow-hidden border">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={processedImage}
                        alt="Processed product"
                        className="w-full h-full object-contain"
                      />
                    </div>
                    <Button
                      onClick={handleDownload}
                      className="w-full"
                      variant="outline"
                    >
                      <Download className="mr-2 h-4 w-4" />
                      Download Image
                    </Button>
                  </motion.div>
                ) : (
                  <div className="aspect-square rounded-lg border-2 border-dashed flex items-center justify-center text-muted-foreground">
                    <div className="text-center">
                      <Sparkles className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>Processed image will appear here</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </main>
  )
}

