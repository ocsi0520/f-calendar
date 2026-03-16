import { AllowedSpecificationsService } from '../AllowedSpecifications.service';

describe(AllowedSpecificationsService.name, () => {
  let unitUnderTest: AllowedSpecificationsService;

  beforeEach(() => {
    unitUnderTest = new AllowedSpecificationsService();
    localStorage.clear();
  });

  it('should return default descriptor if nothing stored', () => {
    const result = unitUnderTest.load();

    expect(result).toEqual({
      breakfast: true,
      lunch: true,
      noFollowingDayFor2Sessions: false,
    });
  });

  it('should return changed one', () => {
    const saved = {
      breakfast: false,
      lunch: true,
      noFollowingDayFor2Sessions: true,
    };
    unitUnderTest.save(saved);
    const result = unitUnderTest.load();

    expect(result).toEqual(saved);
  });
});
