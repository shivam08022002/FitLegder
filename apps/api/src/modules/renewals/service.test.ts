import { describe, it, expect, vi } from 'vitest';
import * as renewalService from './service';
import Membership from '../../models/Membership';
import Member from '../../models/Member';
import MembershipPlan from '../../models/MembershipPlan';

vi.mock('../../models/Membership');
vi.mock('../../models/Member');
vi.mock('../../models/MembershipPlan');
vi.mock('../../models/Payment');

describe('Renewal Service - Date Math', () => {
  it('should correctly calculate endDate based on plan duration in extendMembership', async () => {
    const mockMembership = {
      _id: 'membership1',
      endDate: new Date('2025-01-01T00:00:00Z'),
      save: vi.fn().mockResolvedValue(true),
    };
    
    Membership.findById = vi.fn().mockResolvedValue(mockMembership);

    const result = await renewalService.extendMembership('membership1', 30);
    
    // 30 days after Jan 1st is Jan 31st
    expect(result.endDate).toEqual(new Date('2025-01-31T00:00:00Z'));
    expect(mockMembership.save).toHaveBeenCalled();
  });
});
