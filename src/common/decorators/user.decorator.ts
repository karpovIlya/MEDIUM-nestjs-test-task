import { createParamDecorator, ExecutionContext } from '@nestjs/common'
import { IRequestWithUser } from 'src/modules/auth/guards/jwt-auth.guard'

export const User = createParamDecorator(
  (data: unknown, context: ExecutionContext) => {
    const req = context.switchToHttp().getRequest<IRequestWithUser>()
    return req.user
  },
)
