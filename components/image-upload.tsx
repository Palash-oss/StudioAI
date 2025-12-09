"use client"

import { useCallback, useRef, useState } from "react"
import { Upload } from "lucide-react"
import { motion } from "framer-motion"

interface ImageUploadProps {
  onImageUpload: (imageUrl: string) => void
}

export default function ImageUpload({ onImageUpload }: ImageUploadProps) {
  const [isDragging, setIsDragging] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFile = useCallback(
    (file: File) => {
      if (!file.type.startsWith("image/")) {
        return
      }

      const reader = new FileReader()
      reader.onload = () => {
        const result = reader.result as string
        onImageUpload(result)
      }
      reader.readAsDataURL(file)
    },
    [onImageUpload]
  )

  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault()
      setIsDragging(false)

      const file = e.dataTransfer.files[0]
      if (file) {
        handleFile(file)
      }
    },
    [handleFile]
  )

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDragging(true)
  }, [])

  const handleDragLeave = useCallback(() => {
    setIsDragging(false)
  }, [])

  const handleClick = () => {
    fileInputRef.current?.click()
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      handleFile(file)
    }
  }

  return (
    <div
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onClick={handleClick}
      className={`
        relative border-2 border-dashed rounded-lg p-8 text-center cursor-pointer
        transition-all duration-200
        ${
          isDragging
            ? "border-primary bg-primary/5"
            : "border-muted-foreground/25 hover:border-muted-foreground/50"
        }
      `}
    >
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
      />
      <motion.div
        animate={{
          scale: isDragging ? 1.05 : 1,
        }}
        transition={{ duration: 0.2 }}
      >
        <Upload
          className={`h-12 w-12 mx-auto mb-4 ${
            isDragging ? "text-primary" : "text-muted-foreground"
          }`}
        />
        <p className="text-sm text-muted-foreground mb-2">
          {isDragging
            ? "Drop the image here"
            : "Drag & drop an image here, or click to select"}
        </p>
        <p className="text-xs text-muted-foreground/70">
          PNG, JPG, WEBP up to 10MB
        </p>
      </motion.div>
    </div>
  )
}
