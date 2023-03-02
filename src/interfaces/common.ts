export type OffsetPagination = {
  page: number;
  pageSize: number;
};

export interface Page<TEntity> {
  results: TEntity[];
  total: number;
}
