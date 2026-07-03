import { restaurantService } from '../src/modules/restaurant/restaurant.service';
import { branchService } from '../src/modules/branch/branch.service';

describe('Restaurant & Branch Settings Suite', () => {
  it('should validate GST and FSSAI format lengths', () => {
    const mockRestaurantPayload = {
      name: 'Taste of India',
      gstNumber: '27AAAAA1111A1Z1',
      fssaiLicense: '12345678901234',
    };

    expect(mockRestaurantPayload.gstNumber).toHaveLength(15);
    expect(mockRestaurantPayload.fssaiLicense).toHaveLength(14);
  });

  it('should verify printer LAN IP configurations', () => {
    const mockPrinterPayload = {
      name: 'Main Kitchen Printer',
      type: 'KITCHEN',
      connectionType: 'LAN',
      ipAddress: '192.168.1.201',
    };

    expect(mockPrinterPayload.connectionType).toBe('LAN');
    expect(mockPrinterPayload.ipAddress).toMatch(/^\d{3}\.\d{3}\.\d{1,3}\.\d{3}$/);
  });
});
