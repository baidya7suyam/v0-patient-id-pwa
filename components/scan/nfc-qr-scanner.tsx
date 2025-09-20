"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { QRCodeScanner } from "./qr-code-scanner"
import { NFCReader } from "./nfc-reader"
import { PatientDataDisplay } from "./patient-data-display"
import { createClient } from "@/lib/supabase/client"

export function NFCQRScanner() {
  const [scannedData, setScannedData] = useState<any>(null)
  const [patientData, setPatientData] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const supabase = createClient()

  const handleScanSuccess = async (data: string) => {
    setIsLoading(true)
    setError(null)

    try {
      // Try to parse as JSON first (QR code data)
      let parsedData
      try {
        parsedData = JSON.parse(data)
      } catch {
        // If not JSON, treat as NFC ID or QR code ID
        parsedData = { id: data }
      }

      setScannedData(parsedData)

      // Look up patient data based on scanned information
      let query = supabase.from("patients").select(`
          *,
          profile:profiles!patients_id_fkey(*)
        `)

      if (parsedData.patientId) {
        query = query.eq("patient_id", parsedData.patientId)
      } else if (parsedData.nfcId) {
        query = query.eq("nfc_id", parsedData.nfcId)
      } else if (parsedData.qrCode) {
        query = query.eq("qr_code", parsedData.qrCode)
      } else if (parsedData.id) {
        // Try multiple fields
        query = query.or(`patient_id.eq.${parsedData.id},nfc_id.eq.${parsedData.id},qr_code.eq.${parsedData.id}`)
      }

      const { data: patient, error: patientError } = await query.single()

      if (patientError) {
        throw new Error("Patient not found")
      }

      setPatientData(patient)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to process scan")
    } finally {
      setIsLoading(false)
    }
  }

  const handleReset = () => {
    setScannedData(null)
    setPatientData(null)
    setError(null)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-secondary/20 to-accent/10">
      <header className="bg-card border-b border-border">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-primary">MediCard Scanner</h1>
              <p className="text-sm text-muted-foreground">NFC & QR Code Patient Identification</p>
            </div>
            <Badge variant="secondary">Staff Access</Badge>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {patientData ? (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold">Patient Information</h2>
              <Button onClick={handleReset} variant="outline">
                Scan Another
              </Button>
            </div>
            <PatientDataDisplay patient={patientData} />
          </div>
        ) : (
          <div className="max-w-2xl mx-auto">
            <Card>
              <CardHeader className="text-center">
                <CardTitle>Scan Patient ID</CardTitle>
                <CardDescription>Use NFC or QR code to quickly access patient medical information</CardDescription>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="qr" className="space-y-6">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="qr">QR Code</TabsTrigger>
                    <TabsTrigger value="nfc">NFC</TabsTrigger>
                  </TabsList>

                  <TabsContent value="qr">
                    <QRCodeScanner onScanSuccess={handleScanSuccess} isLoading={isLoading} />
                  </TabsContent>

                  <TabsContent value="nfc">
                    <NFCReader onScanSuccess={handleScanSuccess} isLoading={isLoading} />
                  </TabsContent>
                </Tabs>

                {error && (
                  <div className="mt-4 p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
                    <p className="text-destructive text-sm">{error}</p>
                  </div>
                )}

                {scannedData && (
                  <div className="mt-4 p-4 bg-muted/50 rounded-lg">
                    <h4 className="font-semibold mb-2">Scanned Data:</h4>
                    <pre className="text-xs text-muted-foreground overflow-auto">
                      {JSON.stringify(scannedData, null, 2)}
                    </pre>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  )
}
