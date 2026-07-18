import { describe, it, expect, vi } from 'vitest';
import * as paymentService from './service';
import Membership from '../../models/Membership';
import Payment from '../../models/Payment';

vi.mock('../../models/Membership');
vi.mock('../../models/Payment');

describe('Payment Service - Balance Due Calculation', () => {
  it('should calculate correct balance due when total paid is less than plan price', async () => {
    // Mock Membership.findById().populate()
    const mockMembership = {
      _id: 'membership1',
      plan: { price: 1000 },
    };
    
    Membership.findById = vi.fn().mockReturnValue({
      populate: vi.fn().mockResolvedValue(mockMembership),
    });

    // Mock Payment.aggregate to return total paid
    Payment.aggregate = vi.fn().mockResolvedValue([{ total: 400 }]);

    const result = await paymentService.getBalanceDue('membership1');
    
    expect(result.planPrice).toBe(1000);
    expect(result.totalPaid).toBe(400);
    expect(result.balanceDue).toBe(600);
  });

  it('should handle zero payments correctly', async () => {
    const mockMembership = {
      _id: 'membership1',
      plan: { price: 800 },
    };
    
    Membership.findById = vi.fn().mockReturnValue({
      populate: vi.fn().mockResolvedValue(mockMembership),
    });

    // No payments found
    Payment.aggregate = vi.fn().mockResolvedValue([]);

    const result = await paymentService.getBalanceDue('membership1');
    
    expect(result.planPrice).toBe(800);
    expect(result.totalPaid).toBe(0);
    expect(result.balanceDue).toBe(800);
  });
});
