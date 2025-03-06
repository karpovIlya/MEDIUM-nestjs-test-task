import { HttpException, InternalServerErrorException } from '@nestjs/common'

export const CatchError = (
  _target: any,
  _propertyKey: string,
  descriptor: PropertyDescriptor,
) => {
  const originalMethod = descriptor.value

  descriptor.value = async function (...args: any[]) {
    try {
      return await originalMethod.apply(this, args)
    } catch (error) {
      if (error instanceof HttpException) {
        throw error
      }

      throw new InternalServerErrorException('Unknown server error(((')
    }
  }
}
