export function getPagination(query: Record<string, string | string[] | undefined>) {
  const page = Number(query.page ?? 1);
  const pageSize = Number(query.limit ?? query.pageSize ?? 10);
  const pageNumber = Number.isFinite(page) && page > 0 ? page : 1;
  const size = Number.isFinite(pageSize) && pageSize > 0 ? pageSize : 10;
  const skip = (pageNumber - 1) * size;
  const take = size;
  return { pageNumber, pageSize: size, skip, take };
}



