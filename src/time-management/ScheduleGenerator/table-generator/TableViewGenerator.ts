import { Injectable } from '@angular/core';
import { TableCell, TableCellPart, ViewByDay } from '../Table';

@Injectable({ providedIn: 'root' })
export class TableViewGenerator {
  public generateViewsFrom(allSuitableTableCells: Array<TableCell>): TableCellPart['views'] {
    return {
      linear: allSuitableTableCells,
      byDay: this.groupCellsByDays(allSuitableTableCells),
    };
  }

  private groupCellsByDays(allSuitableTableCells: Array<TableCell>): ViewByDay {
    const res = new Array<number>(6).fill(-1) as ViewByDay;

    let nextDayToFill = 1;

    for (let i = 0; i < allSuitableTableCells.length && nextDayToFill <= 6; i++) {
      const day = allSuitableTableCells[i].timeInterval.dayNumber;

      while (nextDayToFill < day && nextDayToFill <= 6) {
        res[nextDayToFill - 1] = i - 1;
        nextDayToFill++;
      }
    }

    const lastIdx = allSuitableTableCells.length - 1;

    while (nextDayToFill <= 6) {
      res[nextDayToFill - 1] = lastIdx;
      nextDayToFill++;
    }

    return res;
  }
}
