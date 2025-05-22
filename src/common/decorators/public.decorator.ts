import { SetMetadata } from '@nestjs/common'
import { IS_PUBLIC_ROUTE_KEY } from '../consts/public-route-key.const'

export const Public = () => SetMetadata(IS_PUBLIC_ROUTE_KEY, true)
