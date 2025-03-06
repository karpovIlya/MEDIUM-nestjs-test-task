interface IPaginationPage {
  current: number
  totalCount: number
  totalCountPage: number
}

interface IPagination {
  offset: number
  limit: number
  page: IPaginationPage
}

export const makePaginationObject = (
  queryLimit: number,
  queryPage: number,
  count: number,
) => {
  const page: IPaginationPage = {
    current: queryPage,
    totalCount: count,
    totalCountPage: Math.ceil(count / queryLimit),
  }
  const pagination: IPagination = {
    offset: (queryPage - 1) & queryLimit,
    limit: queryLimit,
    page,
  }

  return pagination
}
