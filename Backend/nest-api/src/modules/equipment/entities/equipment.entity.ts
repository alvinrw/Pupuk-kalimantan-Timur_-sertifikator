import { StatusKelayakan, StatusSertifikasi } from '../enums/permit-status.enum';

export class Equipment {
  id: string;
  tagNumber: string;
  name: string;
  category: string;
  plantUnit: string;
  location: string;
  inspectionBody: string;
  certificateNo: string;
  issueDate: string;
  expiryDate: string;
  statusKelayakan: StatusKelayakan;
  statusSertifikasi: StatusSertifikasi;
  confidenceScore: number;
  lastInspectedBy: string;
  pdfFileName?: string;
  createdAt: Date;
  updatedAt: Date;
}
