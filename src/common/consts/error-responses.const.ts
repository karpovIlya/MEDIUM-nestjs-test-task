import { BaseExceptionDto } from '../dto/base-exception.dto'

export const ERROR_RESPONSES = {
  UNAUTHORIZED_EXCEPTION: {
    status: 401,
    description: 'ERROR: Unauthorized Exception',
    type: BaseExceptionDto,
  },
  BAD_REQUEST_EXCEPTION: {
    status: 400,
    description: 'ERROR: Bad Request Exception',
    type: BaseExceptionDto,
  },
  INTERNAL_SERVER_ERROR_EXCEPTION: {
    status: 500,
    description: 'ERROR: Internal Server Error Exception',
    type: BaseExceptionDto,
  },
  NOT_FOUND_EXCEPTION: {
    status: 404,
    description: 'ERROR: Not Found Exception',
    type: BaseExceptionDto,
  },
  SAME_USER_EXCEPTION: {
    status: 400,
    description: 'ERROR: Same User Exception',
    type: BaseExceptionDto,
  },
}
