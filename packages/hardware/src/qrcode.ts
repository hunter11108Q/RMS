export class QrCodeGenerator {
  public static buildEscPosQrCode(data: string, size = 6): Buffer {
    const dataBuffer = Buffer.from(data);
    const dataLength = dataBuffer.length + 3; // data + function headers (3 bytes)
    
    const pL = dataLength & 0xff;
    const pH = (dataLength >> 8) & 0xff;

    // 1. Model selection (Model 2)
    const cmdModel = Buffer.from([0x1d, 0x28, 0x6b, 0x04, 0x00, 0x31, 0x41, 0x32, 0x00]);
    // 2. Set dot size
    const cmdSize = Buffer.from([0x1d, 0x28, 0x6b, 0x03, 0x00, 0x31, 0x45, size]);
    // 3. Store data in symbol area
    const cmdStoreHeader = Buffer.from([0x1d, 0x28, 0x6b, pL, pH, 0x31, 0x50, 0x30]);
    const cmdStore = Buffer.concat([cmdStoreHeader, dataBuffer]);
    // 4. Print stored symbol
    const cmdPrint = Buffer.from([0x1d, 0x28, 0x6b, 0x03, 0x00, 0x31, 0x51, 0x30]);

    return Buffer.concat([cmdModel, cmdSize, cmdStore, cmdPrint]);
  }
}
export default QrCodeGenerator;
