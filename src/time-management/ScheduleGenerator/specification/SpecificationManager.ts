import { TimeMapper } from '../../mappers/TimeMapper';
import { Table } from '../Table';
import { ScheduleSpecification, SpecCheckResult } from './specification';

export class SpecificationManager {
  /**
   *
   * @param allSpecifications specifications to be followed. !! ORDER DOES MATTER !!
   *  Spec checks (in case of violation) return the first possible interval as a hint.
   *  The hint coming from the first failed spec check is returned in `checkSpecifications` method
   */
  constructor(
    private readonly allSpecifications: Array<ScheduleSpecification>,
    private readonly timeMapper: TimeMapper,
  ) {}

  public checkSpecifications(table: Table, currentLinearIndex: number): SpecCheckResult {
    for (let spec of this.allSpecifications) {
      const result = spec.check(table, currentLinearIndex);
      if (result) return this.timeMapper.weekTimeToNumber(result);
    }

    return -1;
  }
}
