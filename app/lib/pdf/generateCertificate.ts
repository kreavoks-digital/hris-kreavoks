import jsPDF from 'jspdf'
import { toPng } from 'html-to-image'

export interface GeneratePdfResult {
  success: boolean
  imgData: string | null
  error?: string
}

export const generateCertificatePdf = async (
  elementId: string,
  fileName: string = 'Sertifikat.pdf'
): Promise<GeneratePdfResult> => {
  const node = document.getElementById(elementId)
  if (!node) {
    return { success: false, imgData: null, error: 'Element template sertifikat tidak ditemukan.' }
  }

  try {
    if (document.fonts) {
      await document.fonts.ready
    }

    // Capture using html-to-image (Native SVG foreignObject engine, 100% exact typography & spacing)
    const imgData = await toPng(node, {
      pixelRatio: 3,
      quality: 1,
      cacheBust: true,
      backgroundColor: '#ffffff'
    })

    // A4 Landscape dimension: 297 x 210 mm
    const pdf = new jsPDF({
      orientation: 'landscape',
      unit: 'mm',
      format: 'a4',
      compress: true
    })
    const pdfWidth = pdf.internal.pageSize.getWidth()
    const pdfHeight = pdf.internal.pageSize.getHeight()

    pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight, undefined, 'FAST')
    pdf.save(fileName)

    return { success: true, imgData }
  } catch (error: any) {
    console.error('Error generating Certificate PDF:', error)
    return { success: false, imgData: null, error: error?.message || 'Gagal membuat file PDF.' }
  }
}

export const generateCertificateImage = async (
  elementId: string,
  fileName: string = 'Sertifikat.png'
): Promise<GeneratePdfResult> => {
  const node = document.getElementById(elementId)
  if (!node) {
    return { success: false, imgData: null, error: 'Element template sertifikat tidak ditemukan.' }
  }

  try {
    if (document.fonts) {
      await document.fonts.ready
    }

    const imgData = await toPng(node, {
      pixelRatio: 3,
      quality: 1,
      cacheBust: true,
      backgroundColor: '#ffffff'
    })

    const link = document.createElement('a')
    link.href = imgData
    link.download = fileName
    link.click()

    return { success: true, imgData }
  } catch (error: any) {
    console.error('Error generating Certificate Image:', error)
    return { success: false, imgData: null, error: error?.message || 'Gagal menyimpan gambar.' }
  }
}
