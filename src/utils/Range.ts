export type NumberRange<
  N extends number,
  Acc extends number[] = []
> = Acc['length'] extends N
  ? N | Acc[number]
  : NumberRange<N, [...Acc, Acc['length']]>;