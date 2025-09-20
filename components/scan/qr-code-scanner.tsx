"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"

interface QRCodeScannerProps {
  onScanSuccess: (data: string) => void
  isLoading: boolean
}

export function QRCodeScanner({ onScanSuccess, isLoading }: QRCodeScannerProps) {
  const [isScanning, setIsScanning] = useState(false)
  const [stream, setStream] = useState<MediaStream | null>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  const startScanning = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" },
      })
      setStream(mediaStream)
      setIsScanning(true)

      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream
        videoRef.current.play()
      }

      // Start QR code detection
      scanQRCode()
    } catch (error) {
      console.error("Error accessing camera:", error)
    }
  }

  const stopScanning = () => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop())
      setStream(null)
    }
    setIsScanning(false)
  }

  const scanQRCode = () => {
    if (!videoRef.current || !canvasRef.current) return

    const video = videoRef.current
    const canvas = canvasRef.current
    const context = canvas.getContext("2d")

    if (!context) return

    const scan = () => {
      if (video.readyState === video.HAVE_ENOUGH_DATA) {
        canvas.width = video.videoWidth
        canvas.height = video.videoHeight
        context.drawImage(video, 0, 0, canvas.width, canvas.height)

        const imageData = context.getImageData(0, 0, canvas.width, canvas.height)

        // In a real implementation, you would use a QR code library like jsQR
        // For demo purposes, we'll simulate QR code detection
        // You would install and use: npm install jsqr
        // import jsQR from 'jsqr'
        // const code = jsQR(imageData.data, imageData.width, imageData.height)

        // Simulated QR code detection - replace with actual jsQR implementation
        setTimeout(() => {
          // Demo: simulate successful scan after 3 seconds
          if (isScanning) {
            const demoData = {
              patientId: "P1234567890",
              name: "John Doe",
              bloodType: "A+",
              allergies: ["Penicillin"],
              emergencyContact: "Jane Doe - (555) 123-4567",
            }
            onScanSuccess(JSON.stringify(demoData))
            stopScanning()
          }
        }, 3000)
      }

      if (isScanning) {
        requestAnimationFrame(scan)
      }
    }

    scan()
  }

  useEffect(() => {
    return () => {
      stopScanning()
    }
  }, [])

  return (
    <div className="space-y-4">
      {!isScanning ? (
        <Card>
          <CardContent className="p-8 text-center">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z"
                />
              </svg>
            </div>
            <h3 className="text-lg font-semibold mb-2">QR Code Scanner</h3>
            <p className="text-muted-foreground mb-4">
              Point your camera at a patient's QR code to access their medical information
            </p>
            <Button onClick={startScanning} disabled={isLoading}>
              {isLoading ? "Processing..." : "Start Camera"}
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          <div className="relative">
            <video ref={videoRef} className="w-full h-64 bg-black rounded-lg object-cover" playsInline muted />
            <canvas ref={canvasRef} className="hidden" />
            <div className="absolute inset-0 border-2 border-primary rounded-lg pointer-events-none">
              <div className="absolute top-4 left-4 w-8 h-8 border-l-4 border-t-4 border-primary"></div>
              <div className="absolute top-4 right-4 w-8 h-8 border-r-4 border-t-4 border-primary"></div>
              <div className="absolute bottom-4 left-4 w-8 h-8 border-l-4 border-b-4 border-primary"></div>
              <div className="absolute bottom-4 right-4 w-8 h-8 border-r-4 border-b-4 border-primary"></div>
            </div>
          </div>
          <div className="text-center">
            <p className="text-sm text-muted-foreground mb-4">Position the QR code within the frame</p>
            <Button onClick={stopScanning} variant="outline">
              Stop Scanning
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
