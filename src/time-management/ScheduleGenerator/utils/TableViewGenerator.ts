import { Injectable } from '@angular/core';
import { TableCell, TableCellPart } from '../Table';

type ByDayView = TableCellPart['views']['byDay'];
type TableCells = Array<TableCell>;

@Injectable({ providedIn: 'root' })
export class TableViewGenerator {
  public generateViewsFrom(allSuitableTableCells: Array<TableCell>): TableCellPart['views'] {
    return {
      linear: allSuitableTableCells,
      byDay: this.groupCellsByDays(allSuitableTableCells),
    };
  }

  private groupCellsByDays(allSuitableTableCells: Array<TableCell>): ByDayView {
    const result: [
      never[],
      TableCells,
      TableCells,
      TableCells,
      TableCells,
      TableCells,
      TableCells,
      TableCells,
    ] = [[], [], [], [], [], [], [], []];
    for (let cell of allSuitableTableCells) result[cell.timeInterval.dayNumber].push(cell);
    return result;
  }
}
