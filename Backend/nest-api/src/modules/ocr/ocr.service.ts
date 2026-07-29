import { Injectable, Logger } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';
import { execSync } from 'child_process';
// eslint-disable-next-line @typescript-[#005ea4]/no-var-requires
const pdfParse = require('pdf-parse');

export interface OcrScanResult {
  noSertifikat?: string;
  terbit?: string;
  expired?: string;
  instansi?: string;
  namaPeralatan?: string;
  rawText?: string;
  confidence: number;
}

@Injectable()
export class OcrService {
  private readonly logger = new Logger(OcrService.name);

  private readonly monthMap: Record<string, number> = {
    januari: 0, jan: 0,
    februari: 1, feb: 1,
    maret: 2, mar: 2,
    april: 3, apr: 3,
    mei: 4,
    juni: 5, jun: 5,
    juli: 6, jul: 6,
    agustus: 7, ags: 7, agu: 7,
    september: 8, sep: 8,
    oktober: 9, okt: 9,
    november: 10, nov: 10,
    desember: 11, des: 11,
  };

  async scanPdf(fileBuffer: Buffer): Promise<OcrScanResult> {
    try {
      // 1. Coba panggil Python RapidOCR Extractor terlebih dahulu (General Extractor 4 Field)
      let projectRoot = path.resolve(process.cwd(), '..');
      let pythonScriptPath = path.join(projectRoot, 'Testing_ocr', 'test_cert_page_only.py');

      if (!fs.existsSync(pythonScriptPath)) {
        pythonScriptPath = `C:\\Users\\alvin\\Documents\\Coolyeah\\PKT\\Inventor\\Testing_ocr\\test_cert_page_only.py`;
        projectRoot = `C:\\Users\\alvin\\Documents\\Coolyeah\\PKT\\Inventor`;
      }

      const tempPdfPath = path.join(projectRoot, `temp_scan_${Date.now()}.pdf`);
      fs.writeFileSync(tempPdfPath, fileBuffer);

      if (fs.existsSync(pythonScriptPath)) {
        try {
          const pyBin = fs.existsSync(`C:\\Users\\alvin\\AppData\\Local\\Programs\\Python\\Python312\\python.exe`)
            ? `"C:\\Users\\alvin\\AppData\\Local\\Programs\\Python\\Python312\\python.exe"`
            : `python`;

          this.logger.log(`Executing Python RapidOCR Engine (${pyBin}) on: ${tempPdfPath}`);
          const pyOutput = execSync(`${pyBin} "${pythonScriptPath}" "${tempPdfPath}"`, {
            cwd: projectRoot,
            encoding: 'utf-8',
            timeout: 25000,
          });

          if (fs.existsSync(tempPdfPath)) fs.unlinkSync(tempPdfPath);

          const matchJson = pyOutput.match(/JSON_START\s*([\s\S]*?)\s*JSON_END/);
          if (matchJson && matchJson[1]) {
            const pyRes = JSON.parse(matchJson[1]);
            this.logger.log(`Python RapidOCR Extracted: ${JSON.stringify(pyRes)}`);

            const noCert = pyRes.nomor_sertifikat && pyRes.nomor_sertifikat !== 'UNKNOWN' ? pyRes.nomor_sertifikat : null;
            const terbitDate = pyRes.tanggal_terbit || pyRes.tanggal_inspeksi || null;
            const expiryDate = pyRes.tanggal_berakhir || (terbitDate ? this.addOneYear(terbitDate) : null);

            if (noCert || terbitDate || expiryDate) {
              return {
                noSertifikat: noCert || undefined,
                terbit: terbitDate || undefined,
                expired: expiryDate || undefined,
                instansi: 'Disnaker Kalimantan Timur',
                confidence: 95,
              };
            }
          }
        } catch (pyErr) {
          this.logger.warn(`Python RapidOCR execution failed, falling back to pdf-parse: ${pyErr.message}`);
          if (fs.existsSync(tempPdfPath)) fs.unlinkSync(tempPdfPath);
        }
      }

      // 2. Fallback ke pdf-parse jika Python tidak tersedia / gagal
      const parsed = await pdfParse(fileBuffer);
      const text = parsed.text || '';
      
      const noSertifikat = this.extractCertificateNumber(text);
      const terbit = this.extractIssueDate(text);
      let expired = this.extractExpiryDate(text);
      const instansi = this.extractIssuer(text);
      const namaPeralatan = this.extractEquipmentName(text);

      if (terbit && !expired) {
        expired = this.addOneYear(terbit);
      }

      return {
        noSertifikat: noSertifikat || undefined,
        terbit: terbit || undefined,
        expired: expired || undefined,
        instansi: instansi || undefined,
        namaPeralatan: namaPeralatan || undefined,
        confidence: 80,
      };
    } catch (error) {
      this.logger.error(`Error parsing PDF: ${error.message}`, error.stack);
      return {
        noSertifikat: undefined,
        terbit: undefined,
        expired: undefined,
        confidence: 50,
      };
    }
  }

  private extractCertificateNumber(text: string): string | null {
    if (!text) return null;
    const patterns = [
      /(?:Nomor|No\.|No|SK No\.|REGISTRASI NO\.?|SERI)\s*:?\s*([A-Za-z0-9\.\-\/]{4,})/i,
      /([0-9]{3,}[\.\/][A-Za-z0-9\.\/A-Za-z\-]{4,})/i,
      /(SK-[A-Za-z0-9\-]{4,})/i,
      /(CERT-[A-Za-z0-9\-]{4,})/i,
      /([A-Z0-9]{3,}\/[A-Z0-9\.\/-]{4,})/i,
    ];

    for (const pattern of patterns) {
      const match = text.match(pattern);
      if (match && match[1] && match[1].trim().length > 3) {
        const cleaned = match[1].trim().replace(/[\,\;\:\.]$/, '');
        if (!/^(tanggal|berlaku|nama|jenis|surat|sertifikat|halaman)$/i.test(cleaned)) {
          return cleaned;
        }
      }
    }
    return null;
  }

  private extractIssueDate(text: string): string | null {
    if (!text) return null;
    const patterns = [
      /(?:diterbitkan|terbit|bontang|jakarta|samarinda|tanggal|tgl)\s*,?\s*:?\s*([0-9]{1,2}\s+[A-Za-z]+\s+[0-9]{4})/i,
      /(?:diterbitkan|terbit|tanggal|tgl)\s*:?\s*([0-9]{4}[\-\/\.][0-9]{1,2}[\-\/\.][0-9]{1,2})/i,
      /(?:diterbitkan|terbit|tanggal|tgl)\s*:?\s*([0-9]{1,2}[\-\/\.][0-9]{1,2}[\-\/\.][0-9]{4})/i,
      /([0-9]{1,2}\s+(?:Januari|Februari|Maret|April|Mei|Juni|Juli|Agustus|September|Oktober|November|Desember|Jan|Feb|Mar|Apr|Mei|Jun|Jul|Ags|Agu|Sep|Okt|Nov|Des)\s+[0-9]{4})/i,
      /([0-9]{4}[\-\/\.][0-9]{2}[\-\/\.][0-9]{2})/,
      /([0-9]{2}[\-\/\.][0-9]{2}[\-\/\.][0-9]{4})/,
    ];

    for (const pattern of patterns) {
      const match = text.match(pattern);
      if (match && match[1]) {
        const formatted = this.normalizeDate(match[1]);
        if (formatted) return formatted;
      }
    }
    return null;
  }

  private extractExpiryDate(text: string): string | null {
    if (!text) return null;
    const patterns = [
      /(?:berlaku\s+s\/?d|sampai\s+dengan|expired|berakhir|hingga|s\/d)\s*:?\s*([0-9]{1,2}\s+[A-Za-z]+\s+[0-9]{4})/i,
      /(?:berlaku\s+s\/?d|sampai\s+dengan|expired|berakhir|hingga|s\/d)\s*:?\s*([0-9]{4}[\-\/\.][0-9]{1,2}[\-\/\.][0-9]{1,2})/i,
      /(?:berlaku\s+s\/?d|sampai\s+dengan|expired|berakhir|hingga|s\/d)\s*:?\s*([0-9]{1,2}[\-\/\.][0-9]{1,2}[\-\/\.][0-9]{4})/i,
    ];

    for (const pattern of patterns) {
      const match = text.match(pattern);
      if (match && match[1]) {
        const formatted = this.normalizeDate(match[1]);
        if (formatted) return formatted;
      }
    }
    return null;
  }

  private extractIssuer(text: string): string | null {
    if (/disnaker|dinas tenaga kerja/i.test(text)) return 'Disnaker RI / Kaltim';
    if (/kementerian\s+lh|klhk|lingkungan\s+hidup/i.test(text)) return 'Kementerian LHK RI';
    if (/kemenperin|kementerian\s+perindustrian/i.test(text)) return 'Kementerian Perindustrian RI';
    if (/kemenkumham|hak\s+cipta|direktorat\s+jenderal\s+kekayaan\s+intelektual/i.test(text)) return 'DJKI Kemenkumham RI';
    if (/sucofindo/i.test(text)) return 'PT Sucofindo';
    if (/bureau\s+veritas/i.test(text)) return 'Bureau Veritas';
    return null;
  }

  private extractEquipmentName(text: string): string | null {
    const patterns = [
      /(?:nama\s+alat|jenis\s+pesawat|pesawat|peralatan|nama\s+ciptaan)\s*:?\s*([^\n]+)/i,
    ];
    for (const pattern of patterns) {
      const match = text.match(pattern);
      if (match && match[1] && match[1].trim().length > 3) {
        return match[1].trim().substring(0, 100);
      }
    }
    return null;
  }

  private normalizeDate(dateStr: string): string | null {
    try {
      const clean = dateStr.trim();
      // YYYY-MM-DD
      if (/^[0-9]{4}\-[0-9]{2}\-[0-9]{2}$/.test(clean)) return clean;

      // DD/MM/YYYY or DD-MM-YYYY
      const partsNum = clean.split(/[\/\-\s]+/);
      if (partsNum.length === 3 && !isNaN(Number(partsNum[0])) && !isNaN(Number(partsNum[2]))) {
        let day = parseInt(partsNum[0], 10);
        let month = parseInt(partsNum[1], 10);
        let year = parseInt(partsNum[2], 10);

        if (year < 100) year += 2000;
        if (day > 31 && year <= 31) {
          // Swapped YYYY/MM/DD
          const temp = day; day = year; year = temp;
        }

        const dStr = String(day).padStart(2, '0');
        const mStr = String(month).padStart(2, '0');
        return `${year}-${mStr}-${dStr}`;
      }

      // DD Month YYYY (e.g. 23 Juli 2024)
      const partsWord = clean.split(/\s+/);
      if (partsWord.length >= 3) {
        const day = parseInt(partsWord[0], 10);
        const monthName = partsWord[1].toLowerCase();
        const year = parseInt(partsWord[2], 10);

        if (!isNaN(day) && !isNaN(year) && this.monthMap[monthName] !== undefined) {
          const monthNum = this.monthMap[monthName] + 1;
          const dStr = String(day).padStart(2, '0');
          const mStr = String(monthNum).padStart(2, '0');
          return `${year}-${mStr}-${dStr}`;
        }
      }
    } catch {
      return null;
    }
    return null;
  }

  private addOneYear(dateIso: string): string | null {
    try {
      const d = new Date(dateIso);
      if (isNaN(d.getTime())) return null;
      d.setFullYear(d.getFullYear() + 1);
      return d.toISOString().split('T')[0];
    } catch {
      return null;
    }
  }
}
