/**
 * Service for barcode and ticket generation API calls
 */

import { apiRequest, API_ENDPOINTS, HTTP_METHODS, AuthService } from './apiService';

export interface BarcodeResponse {
  id: string;
  code: string;
  barcode_type: string;
  is_primary: boolean;
  created_at: string;
}

export interface BulkTicketRequest {
  product_ids: string[];
  tickets_per_page?: number;
}

export interface BulkBarcodeRequest {
  product_ids?: string[];
  barcodes_per_page?: number;
}

class BarcodeService {
  /**
   * Generate barcode image for a product
   */
  async generateBarcodeImage(
    productId: string, 
    type: string = 'CODE128', 
    format: string = 'PNG'
  ): Promise<Blob> {
    const url = `${API_ENDPOINTS.INVENTORY.PRODUCT_BARCODE(productId)}?type=${type}&format=${format}`;
    return apiRequest(url, {
      method: HTTP_METHODS.GET,
      token: AuthService.getToken() || undefined
    });
  }

  /**
   * Create barcode record for a product
   */
  async createBarcode(productId: string, barcodeType: string = 'CODE128'): Promise<BarcodeResponse> {
    return apiRequest(API_ENDPOINTS.INVENTORY.PRODUCT_BARCODE(productId), {
      method: HTTP_METHODS.POST,
      body: { barcode_type: barcodeType },
      token: AuthService.getToken() || undefined
    });
  }

  /**
   * Generate product ticket PDF
   */
  async generateTicket(productId: string, includeQR: boolean = true): Promise<Blob> {
    const url = `${API_ENDPOINTS.INVENTORY.PRODUCT_TICKET(productId)}?include_qr=${includeQR}`;
    return apiRequest(url, {
      method: HTTP_METHODS.GET,
      token: AuthService.getToken() || undefined
    });
  }

  /**
   * Generate bulk tickets PDF
   */
  async generateBulkTickets(request: BulkTicketRequest): Promise<Blob> {
    return apiRequest(API_ENDPOINTS.INVENTORY.BULK_TICKETS, {
      method: HTTP_METHODS.POST,
      body: request,
      token: AuthService.getToken() || undefined
    });
  }

  /**
   * Generate bulk barcodes PDF
   */
  async generateBulkBarcodes(request: BulkBarcodeRequest): Promise<Blob> {
    return apiRequest(API_ENDPOINTS.INVENTORY.BULK_BARCODES, {
      method: HTTP_METHODS.POST,
      body: request,
      token: AuthService.getToken() || undefined
    });
  }

  /**
   * Generate new barcode for existing product
   */
  async regenerateBarcode(productId: string): Promise<any> {
    return apiRequest(API_ENDPOINTS.INVENTORY.GENERATE_BARCODE(productId), {
      method: HTTP_METHODS.POST,
      token: AuthService.getToken() || undefined
    });
  }

  /**
   * Download file from blob
   */
  downloadBlob(blob: Blob, filename: string): void {
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  }

  /**
   * Download barcode image for a product
   */
  async downloadBarcodeImage(productId: string, productName: string): Promise<void> {
    try {
      const blob = await this.generateBarcodeImage(productId);
      this.downloadBlob(blob, `${productName}_barcode.png`);
    } catch (error) {
      console.error('Error downloading barcode:', error);
      throw error;
    }
  }

  /**
   * Download ticket PDF for a product
   */
  async downloadTicketPDF(productId: string, productName: string, includeQR: boolean = true): Promise<void> {
    try {
      const blob = await this.generateTicket(productId, includeQR);
      this.downloadBlob(blob, `${productName}_ticket.pdf`);
    } catch (error) {
      console.error('Error downloading ticket:', error);
      throw error;
    }
  }

  /**
   * Download bulk tickets PDF
   */
  async downloadBulkTickets(productIds: string[], ticketsPerPage: number = 8): Promise<void> {
    try {
      const blob = await this.generateBulkTickets({
        product_ids: productIds,
        tickets_per_page: ticketsPerPage
      });
      this.downloadBlob(blob, `product_tickets_${new Date().toISOString().split('T')[0]}.pdf`);
    } catch (error) {
      console.error('Error downloading bulk tickets:', error);
      throw error;
    }
  }

  /**
   * Download bulk barcodes PDF
   */
  async downloadBulkBarcodes(productIds?: string[], barcodesPerPage: number = 20): Promise<void> {
    try {
      const blob = await this.generateBulkBarcodes({
        product_ids: productIds,
        barcodes_per_page: barcodesPerPage
      });
      this.downloadBlob(blob, `product_barcodes_${new Date().toISOString().split('T')[0]}.pdf`);
    } catch (error) {
      console.error('Error downloading bulk barcodes:', error);
      throw error;
    }
  }
}

export const barcodeService = new BarcodeService();
export default barcodeService;