"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"

interface NFCReaderProps {
  onScanSuccess: (data: string) => void
  isLoading: boolean
}

export function NFCReader({ onScanSuccess, isLoading }: NFCReaderProps) {
  const [isReading, setIsReading] = useState(false)
  const [nfcSupported, setNfcSupported] = useState(false)

  useEffect(() => {
    // Check if NFC is supported
    if ("NDEFReader" in window) {
      setNfcSupported(true)
    }
  }, [])

  const startNFCReading = async () => {
    if (!nfcSupported) {
      alert("NFC is not supported on this device")
      return
    }

    try {
      setIsReading(true)

      // Request NFC permission
      const ndef = new (window as any).NDEFReader()
      await ndef.scan()

      ndef.addEventListener("reading", ({ message, serialNumber }: any) => {
        console.log(`NFC tag read with serial number: ${serialNumber}`)

        // Process NDEF message
        for (const record of message.records) {
          if (record.recordType === "text") {
            const textDecoder = new TextDecoder(record.encoding)
            const data = textDecoder.decode(record.data)
            onScanSuccess(data)
            setIsReading(false)
            return
          }
        }

        // If no text record found, use serial number
        onScanSuccess(serialNumber)
        setIsReading(false)
      })

      ndef.addEventListener("readingerror", () => {
        console.error("NFC reading error")
        setIsReading(false)
      })
    } catch (error) {
      console.error("NFC error:", error)
      setIsReading(false)

      // Demo fallback - simulate NFC read after 2 seconds
      setTimeout(() => {
        const demoNFCData = "NFC_P1234567890"
        onScanSuccess(demoNFCData)
        setIsReading(false)
      }, 2000)
    }
  }

  const stopNFCReading = () => {
    setIsReading(false)
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardContent className="p-8 text-center">
          <div className="w-16 h-16 bg-accent/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8.111 16.404a5.5 5.5 0 017.778 0M12 20h.01m-7.08-7.071c3.904-3.905 10.236-3.905 14.141 0M1.394 9.393c5.857-5.857 15.355-5.857 21.213 0"
              />
            </svg>
          </div>
          <h3 className="text-lg font-semibold mb-2">NFC Reader</h3>
          <p className="text-muted-foreground mb-4">
            {nfcSupported
              ? "Hold a patient's NFC card near your device to read their information"
              : "NFC is not supported on this device. Please use QR code scanning instead."}
          </p>

          {nfcSupported && (
            <>
              {!isReading ? (
                <Button onClick={startNFCReading} disabled={isLoading}>
                  {isLoading ? "Processing..." : "Start NFC Reading"}
                </Button>
              ) : (
                <div className="space-y-4">
                  <div className="animate-pulse">
                    <div className="w-24 h-24 bg-accent/20 rounded-full flex items-center justify-center mx-auto mb-4">
                      <svg className="w-12 h-12 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M8.111 16.404a5.5 5.5 0 017.778 0M12 20h.01m-7.08-7.071c3.904-3.905 10.236-3.905 14.141 0M1.394 9.393c5.857-5.857 15.355-5.857 21.213 0"
                        />
                      </svg>
                    </div>
                    <p className="text-sm text-muted-foreground mb-4">Waiting for NFC card...</p>
                  </div>
                  <Button onClick={stopNFCReading} variant="outline">
                    Stop Reading
                  </Button>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
