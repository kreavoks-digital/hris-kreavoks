import jsPDF from 'jspdf'
import html2canvas from 'html2canvas'

export interface GeneratePdfResult {
  success: boolean
  imgData: string | null
  error?: string
}

export const generateCertificatePdf = async (
  elementId: string,
  fileName: string = 'Sertifikat.pdf'
): Promise<GeneratePdfResult> => {
  const input = document.getElementById(elementId)
  if (!input) {
    return { success: false, imgData: null, error: 'Element template sertifikat tidak ditemukan.' }
  }

  try {
    if (document.fonts) {
      await document.fonts.ready
    }

    const canvas = await html2canvas(input, {
      scale: 2, // High resolution crisp export
      useCORS: true,
      allowTaint: false,
      logging: false,
      backgroundColor: '#ffffff',
      windowWidth: 842.25,
      windowHeight: 595.5,
      imageTimeout: 0
    })

    const imgData = canvas.toDataURL('image/png')

    // A4 Landscape dimension: 297 x 210 mm
    const pdf = new jsPDF('l', 'mm', 'a4')
    const pdfWidth = pdf.internal.pageSize.getWidth()
    const pdfHeight = pdf.internal.pageSize.getHeight()

    pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight)
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
  const input = document.getElementById(elementId)
  if (!input) {
    return { success: false, imgData: null, error: 'Element template sertifikat tidak ditemukan.' }
  }

  try {
    if (document.fonts) {
      await document.fonts.ready
    }

    const canvas = await html2canvas(input, {
      scale: 2,
      useCORS: true,
      allowTaint: false,
      logging: false,
      backgroundColor: '#ffffff',
      windowWidth: 842.25,
      windowHeight: 595.5,
      imageTimeout: 0
    })

    const imgData = canvas.toDataURL('image/png')
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
