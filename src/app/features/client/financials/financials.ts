import { DecimalPipe } from '@angular/common';
import { Component } from '@angular/core';
interface Installment {
  id: number;
  amount: number;
  dueDate: string;
  status: 'paid' | 'pending';
}
@Component({
  selector: 'app-financials',
  imports: [DecimalPipe],
  templateUrl: './financials.html',
  styleUrl: './financials.css',
})
export class Financials {
  totalAgreedAmount = 150000; // المبلغ الكلي
  currency = 'EGP';

  // قائمة الدفعات التفصيلية
  installments: Installment[] = [
    { id: 1, amount: 30000, dueDate: '2025-12-01', status: 'paid' },
    { id: 2, amount: 30000, dueDate: '2026-01-15', status: 'paid' },
    { id: 3, amount: 30000, dueDate: '2026-02-15', status: 'paid' },
    { id: 4, amount: 30000, dueDate: '2026-03-15', status: 'pending' },
    { id: 5, amount: 30000, dueDate: '2026-04-15', status: 'pending' },
  ];

  // حسابات تلقائية
  get paidAmount() {
    return this.installments
      .filter((i) => i.status === 'paid')
      .reduce((sum, current) => sum + current.amount, 0);
  }

  get remainingAmount() {
    return this.totalAgreedAmount - this.paidAmount;
  }
}
