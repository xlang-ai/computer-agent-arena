import * as pako from 'pako';

/**
 * Compresses a JavaScript object to a base64 string using pako/zlib
 * @param data The data object to compress
 * @returns Base64 encoded compressed string
 */
export const compressData = (data: any): string => {
  const jsonString = JSON.stringify(data);
  const compressedUint8Array = pako.deflate(jsonString);
  return btoa(Array.from(compressedUint8Array).map(byte => String.fromCharCode(byte)).join(''));
};

/**
 * Decompresses a base64 string back to a JavaScript object
 * @param base64Data The compressed base64 string
 * @returns The decompressed JavaScript object
 */
export const decompressData = (base64Data: string): any => {
  try {
    const binaryString = atob(base64Data);
    const bytes = new Uint8Array(binaryString.length);
    
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    
    const decompressed = pako.inflate(bytes, { to: 'string' });
    return JSON.parse(decompressed as string);
  } catch (error) {
    console.error('Error decompressing data:', error);
    throw new Error('Failed to decompress data');
  }
}; 