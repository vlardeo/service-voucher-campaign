export interface BuilderInterface<MODEL_TYPE> {
  readonly data: any;

  build(): Promise<MODEL_TYPE>;
}
