declare module 'react-native-pdf-lib' {
  export interface PDFPage {
    path: string;
    width: number;
    height: number;
  }

  export interface PDFDocument {
    path: string;
    pages: PDFPage[];
  }

  export interface PDFOptions {
    pageWidth?: number;
    pageHeight?: number;
    outputPath?: string;
  }

  export default class PDFLib {
    static createPDF(options: PDFOptions): Promise<PDFDocument>;
    static addPage(document: PDFDocument, page: PDFPage): Promise<PDFDocument>;
    static savePDF(document: PDFDocument, path: string): Promise<string>;
  }
} 