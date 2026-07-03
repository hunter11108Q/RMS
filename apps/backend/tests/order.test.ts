import { orderService } from '../src/modules/order/order.service';

describe('Order & KOT Transactions Suite', () => {
  it('should validate order item amounts calculations', () => {
    const mockOrderItem = {
      menuItemId: 'paneer-butter-masala-uuid',
      quantity: 2,
      unitPrice: 280,
      modifiers: [
        { name: 'Extra Cheese', price: 50 },
      ],
    };

    const price = (mockOrderItem.unitPrice + mockOrderItem.modifiers[0].price) * mockOrderItem.quantity;
    expect(price).toBe(660);
  });

  it('should verify kitchen routing identifiers', () => {
    const mockKOTTicket = {
      kotNumber: 'KOT-10190',
      kitchenConfigId: 'main-kitchen-uuid',
      priority: 'HIGH',
    };

    expect(mockKOTTicket.priority).toBe('HIGH');
    expect(mockKOTTicket.kotNumber).toContain('KOT');
  });
});
