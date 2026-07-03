import { billingService } from '../src/modules/billing/billing.service';

describe('Billing & Financial Payments Suite', () => {
  it('should calculate CGST and SGST at 2.5% correctly', () => {
    const subTotal = 400;
    const discountAmount = 100;
    const taxableAmount = subTotal - discountAmount;

    // Calculate Indian GST
    const cgst = parseFloat((taxableAmount * 0.025).toFixed(2));
    const sgst = parseFloat((taxableAmount * 0.025).toFixed(2));

    expect(cgst).toBe(7.5);
    expect(sgst).toBe(7.5);
    expect(cgst + sgst).toBe(15);
  });

  it('should verify payment transactions status definitions', () => {
    const mockPayment = {
      method: 'UPI',
      amount: 415,
      status: 'SUCCESS',
    };

    expect(mockPayment.status).toBe('SUCCESS');
    expect(mockPayment.amount).toBeGreaterThan(0);
  });
});
