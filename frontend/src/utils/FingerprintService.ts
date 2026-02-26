import FingerprintJS from '@fingerprintjs/fingerprintjs';

class FingerprintService {
  private static instance: FingerprintService;
  private fingerprint: string | null = null;
  private fpPromise = FingerprintJS.load();

  private constructor() {}

  public static getInstance(): FingerprintService {
    if (!FingerprintService.instance) {
      FingerprintService.instance = new FingerprintService();
    }
    return FingerprintService.instance;
  }

  public async getFingerprint(): Promise<string> {
    if (this.fingerprint) {
      return this.fingerprint;
    }
    
    try {
      const fp = await this.fpPromise;
      const result = await fp.get();
      this.fingerprint = result.visitorId;
      return this.fingerprint;
    } catch (error) {
      console.error('Error getting fingerprint:', error);
      return '';
    }
  }
}

export default FingerprintService; 