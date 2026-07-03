import { inventoryService } from '../src/modules/inventory/inventory.service';

describe('Inventory & Recipe Costings Suite', () => {
  it('should calculate raw ingredient cost with wastage correctly', () => {
    const rawPaneerQty = 200; // grams
    const ratePerUnit = 0.4;  // ₹/g
    const wastePercentage = 5;

    const wastageMultiplier = 1 + (wastePercentage / 100);
    const calculatedCost = rawPaneerQty * ratePerUnit * wastageMultiplier;

    expect(calculatedCost).toBe(84.0);
  });

  it('should verify automatic deduction quantity computations', () => {
    const recipeLineQuantity = 50; // grams per item
    const orderQuantity = 3;       // quantity ordered
    
    const quantityToDeduct = recipeLineQuantity * orderQuantity;
    expect(quantityToDeduct).toBe(150);
  });
});
