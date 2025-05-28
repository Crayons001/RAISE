declare module 'vision-camera-document-scanner' {
  import { Frame } from 'react-native-vision-camera';

  export interface DocumentCorners {
    topLeft: { x: number; y: number };
    topRight: { x: number; y: number };
    bottomLeft: { x: number; y: number };
    bottomRight: { x: number; y: number };
  }

  export interface DocumentQuality {
    isBlurry: boolean;
    isDark: boolean;
    hasGlare: boolean;
    confidence: number;
  }

  export interface ScanResult {
    corners: DocumentCorners;
    quality: DocumentQuality;
  }

  export function scanDocument(frame: Frame): ScanResult | null;
} 