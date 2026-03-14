import { Table } from '../Table';
import { ScheduleSpecification, NextValidStartResult } from './specification';

export class SpecificationManager {
  /**
   *
   * @param allSpecifications specifications to be followed. !! ORDER DOES MATTER !!
   *  Spec checks (in case of violation) return the first possible interval as a hint.
   *  The hint coming from the first failed spec check is returned in `checkSpecifications` method
   */
  constructor(private readonly allSpecifications: Array<ScheduleSpecification>) {}

  public checkSpecifications(table: Table, currentLinearIndex: number): NextValidStartResult {
    for (let spec of this.allSpecifications) {
      const result = spec.check(table, currentLinearIndex);
      if (result) return result;
    }

    return null;
  }
}
