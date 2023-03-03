export interface BuilderInterface<Model> {
  readonly data: any;

  build(): Promise<Model>;
}
