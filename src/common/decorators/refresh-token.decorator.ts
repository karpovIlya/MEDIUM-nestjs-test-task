import { createParamDecorator, ExecutionContext } from '@nestjs/common'
import { IRequestWithUser } from 'src/features/auth/guards/jwt-auth.guard'

export const RefreshToken = createParamDecorator(
  (data: unknown, context: ExecutionContext) => {
    const req = context.switchToHttp().getRequest<IRequestWithUser>()

    return typeof req.cookies?.refreshToken === 'string'
      ? (req.cookies.refreshToken as string)
      : ''
  },
)
