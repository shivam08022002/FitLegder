import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import type { MembershipStatus } from '@gym-saas/types';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getMembershipStatus(endDate: string | Date | undefined | null): MembershipStatus {
  if (!endDate) return 'none';
  const end = new Date(endDate);
  const now = new Date();
  const daysLeft = Math.ceil((end.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

  if (daysLeft < 0) return 'expired';
  if (daysLeft <= 3) return 'critical';
  if (daysLeft <= 7) return 'expiring_soon';
  return 'active';
}

export function getStatusLabel(status: MembershipStatus): string {
  switch (status) {
    case 'active': return 'Active';
    case 'expiring_soon': return 'Expiring Soon';
    case 'critical': return 'Critical';
    case 'expired': return 'Expired';
    case 'none': return 'No Plan';
  }
}

export function getStatusClass(status: MembershipStatus): string {
  switch (status) {
    case 'active': return 'status-active';
    case 'expiring_soon': return 'status-expiring';
    case 'critical': return 'status-critical';
    case 'expired': return 'status-expired';
    case 'none': return 'status-none';
  }
}

export function formatMoney(amount: number, currency = 'INR'): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatDate(date: string | Date, timezone = 'Asia/Kolkata'): string {
  return new Intl.DateTimeFormat('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    timeZone: timezone,
  }).format(new Date(date));
}

export function formatDateTime(date: string | Date, timezone = 'Asia/Kolkata'): string {
  return new Intl.DateTimeFormat('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    timeZone: timezone,
  }).format(new Date(date));
}

export function getDaysLeft(endDate: string | Date): number {
  const end = new Date(endDate);
  const now = new Date();
  return Math.ceil((end.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
}
