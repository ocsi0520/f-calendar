export function methodName<
  T extends { new (...args: any[]): any }, // any class constructor
  K extends keyof InstanceType<T>, // key of prototype
>(
  aClass: T,
  methodName: K & (InstanceType<T>[K] extends Function ? K : never), // ensure it's a method
): string {
  return aClass.prototype[methodName].name;
}
