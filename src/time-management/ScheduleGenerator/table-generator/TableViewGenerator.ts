import { Injectable } from '@angular/core';
import { OptimizedDayGroups, TableCell, TableCellPart, ViewByDay } from '../Table';

@Injectable({ providedIn: 'root' })
export class TableViewGenerator {
  public generateViewsFrom(allSuitableTableCells: Array<TableCell>): TableCellPart['views'] {
    return {
      linear: allSuitableTableCells,
      byDay: this.groupCellsByDays(allSuitableTableCells),
    };
  }

  private groupCellsByDays(allSuitableTableCells: Array<TableCell>): ViewByDay {
    const result: OptimizedDayGroups = [[], [], [], [], [], [], [], []];
    for (let cell of allSuitableTableCells) result[cell.timeInterval.dayNumber].push(cell);
    return result;
  }
}
