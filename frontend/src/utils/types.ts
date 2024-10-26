export type IntervalType = ReturnType<typeof setInterval>

export type ArrayElement<ArrayType> = ArrayType extends (infer ElementType)[] ? ElementType : never
