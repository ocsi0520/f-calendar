// describe(MyTimeService.name, () => {
//   let unitUnderTest: MyTimeService;

//   const interval1: TimeInterval = { dayNumber: 1, start: [9, 15], end: [13, 0] };
//   const interval2: TimeInterval = { dayNumber: 1, start: [17, 0], end: [20, 15] };
//   const interval3: TimeInterval = { dayNumber: 3, start: [11, 0], end: [15, 0] };

//   beforeEach(() => {
//     const primitiveMapper = new TimeIntervalPrimitiveMapper();
//     unitUnderTest = new MyTimeService(
//       new TimeIntervalMapper(primitiveMapper, new TimeIntervalEventMapper(primitiveMapper)),
//     );
//     localStorage.clear();
//   });
//   it('should return empty', () => {
//     expect(unitUnderTest.loadSchedule()).empty;
//   });
//   it('should return 1 saved', () => {
//     unitUnderTest.saveSchedule([interval1]);
//     expect(unitUnderTest.loadSchedule()).toEqual([interval1]);
//   });
//   it('should return 2 saved in order', () => {
//     unitUnderTest.saveSchedule([interval2, interval1]);
//     expect(unitUnderTest.loadSchedule()).toEqual([interval1, interval2]);
//   });
//   it('should delete all', () => {
//     unitUnderTest.saveSchedule([interval2, interval1]);
//     unitUnderTest.saveSchedule([]);
//     expect(unitUnderTest.loadSchedule()).toEqual([]);
//   });
//   it('should override', () => {
//     unitUnderTest.saveSchedule([interval2, interval1]);
//     unitUnderTest.saveSchedule([interval3, interval1]);
//     expect(unitUnderTest.loadSchedule()).toEqual([interval1, interval3]);
//   });

//   it('should sort properly', () => {
//     unitUnderTest.saveSchedule([interval3, interval1, interval2]);
//     expect(unitUnderTest.loadSchedule()).toEqual([interval1, interval2, interval3]);
//   });
// });
