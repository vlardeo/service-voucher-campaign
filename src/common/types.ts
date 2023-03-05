export type OffsetPagination = {
  page: number;
  pageSize: number;
};

export type Page<Entity> = {
  results: Entity[];
  total: number;
};

export type SqlCount = {
  count: number;
};
