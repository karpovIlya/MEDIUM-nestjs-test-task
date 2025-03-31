import {
  PaginationPageDto,
  PaginationResDto,
} from './dto/pagination-response.dto'
import { PaginationReqDto } from './dto/pagination-request.dto'

export class Pagination {
  private readonly _limit: number
  private readonly _page: number
  private readonly _totalCount: number
  private get _pageInfo(): PaginationPageDto {
    const totalCountPage = Math.max(
      Math.ceil(this._totalCount / this._limit),
      1,
    )

    return {
      currentPage: Math.min(this._page, totalCountPage),
      totalCount: this._totalCount,
      totalCountPage,
    }
  }

  public get offset(): number {
    return (this._pageInfo.currentPage - 1) * this._limit
  }
  public get limit(): number {
    return this._limit
  }
  public get pageData(): PaginationResDto {
    return {
      limit: this.limit,
      offset: this.offset,
      pageInfo: this._pageInfo,
    }
  }

  constructor(paginationReq: PaginationReqDto) {
    this._limit = this._checkNumericParamCorrectness({
      param: paginationReq.limit,
      minValue: 1,
    })
    this._page = this._checkNumericParamCorrectness({
      param: paginationReq.page,
      minValue: 1,
    })
    this._totalCount = this._checkNumericParamCorrectness({
      param: paginationReq.totalCount,
      minValue: 0,
    })
  }

  private _checkNumericParamCorrectness(paramData: {
    param: number
    minValue: number
  }) {
    return Math.round(Math.max(paramData.minValue, paramData.param))
  }
}
