export interface CertificateScoreData {
  attendance: number
  workPerformance: number
  teamWork: number
  communication: number
}

export interface CertificateFormData {
  serialNumber: string
  dateOfCompletion: string
  recipientName: string
  position: string
  durationMonths: string | number
  statementText: string
  signatoryName: string
  signatoryRole: string
  scores: CertificateScoreData
  customGrade: string
}
