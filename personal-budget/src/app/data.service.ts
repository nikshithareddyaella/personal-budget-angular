import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export interface BudgetItem {
  title: string;
  budget: number;
}

@Injectable({
  providedIn: 'root',
})
export class DataService {
  private budgetData: BudgetItem[] = []; // To store data from the budget API

  private budgetSubject: BehaviorSubject<BudgetItem[]> = new BehaviorSubject<BudgetItem[]>([]);

  constructor(private http: HttpClient) {}

  fetchBudgetDataIfNeeded(): void {
    if (this.budgetData.length === 0) {
      this.http.get<{ myBudget: BudgetItem[] }>('http://localhost:3000/budget')
        .pipe(
          map(res => {
            this.budgetData = res.myBudget; // Store the fetched data
            this.budgetSubject.next(this.budgetData); // Update the BehaviorSubject
            return this.budgetData; // Return the data if needed
          })
        )
        .subscribe();
    }
  }

  // Return the budget data as an Observable
  getBudgetData(): Observable<BudgetItem[]> {
    return this.budgetSubject.asObservable();
  }

}
