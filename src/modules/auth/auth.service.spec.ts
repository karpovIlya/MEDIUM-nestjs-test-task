import { Test, TestingModule } from '@nestjs/testing'
import * as bcrypt from 'bcryptjs'

import { AuthService } from './auth.service'
import { UsersService } from '../users/users.service'
import { UsersRepository } from '../users/users.repository'

import { SessionRepository } from './sessions.repository'
import { JwtTokensSevice, TToken, IJwtPayload } from './jwt-tokens.service'

import { GetUserResDto } from '../users/dto/get-user-res.dto'
import { CreateUserDto } from '../users/dto/create-user.dto'
import { SignInDto } from './dto/sign-in.dto'

jest.mock('bcryptjs', () => ({
  compare: jest.fn(),
}))

describe('AuthService', () => {
  let authService: AuthService
  let usersService: UsersService
  let usersRepository: UsersRepository
  let sessionRepository: SessionRepository

  const MOCK_TIMESTAMP = '2025-03-24T13:35:04.579Z'
  const MOCK_ID = 1
  const MOCK_USER_DTO: CreateUserDto = {
    login: 'Karpov Ilya',
    age: 20,
    description: 'Hello my name is Ilya Karpov, I am a worker',
    email: 'karpov.ilya05@gmail.com',
    password: 'PastPast1221',
  }
  const MOCK_SIGN_IN_USER_DTO: SignInDto = {
    email: MOCK_USER_DTO.email,
    password: MOCK_USER_DTO.password,
  }
  const MOCK_USER_WITHOUT_PASSWORD: GetUserResDto = {
    id: MOCK_ID,
    login: MOCK_USER_DTO.login,
    age: MOCK_USER_DTO.age,
    description: MOCK_USER_DTO.description,
    email: MOCK_USER_DTO.email,
    createdAt: MOCK_TIMESTAMP,
    updatedAt: MOCK_TIMESTAMP,
  }
  const MOCK_USER_FROM_ACCESS_TOKEN: IJwtPayload = {
    id: MOCK_ID,
    login: MOCK_USER_DTO.login,
    age: MOCK_USER_DTO.age,
    description: MOCK_USER_DTO.description,
    email: MOCK_USER_DTO.email,
    createdAt: MOCK_TIMESTAMP,
    updatedAt: MOCK_TIMESTAMP,
    deletedAt: null,
    iat: MOCK_TIMESTAMP,
    exp: MOCK_TIMESTAMP,
  }
  const MOCK_TOKEN = {
    ACCESS_TOKEN: 'mock-access-token',
    REFRESH_TOKEN: 'mock-refresh-token',
  }

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: UsersService,
          useValue: {
            createUser: jest.fn().mockResolvedValue({
              toJSON: jest.fn().mockReturnValue({
                ...MOCK_USER_WITHOUT_PASSWORD,
                password: MOCK_USER_DTO.password,
              }),
            }),
          },
        },
        {
          provide: UsersRepository,
          useValue: {
            getUserByEmail: jest.fn().mockResolvedValue({
              toJSON: jest.fn().mockReturnValue({
                ...MOCK_USER_WITHOUT_PASSWORD,
                password: MOCK_USER_DTO.password,
              }),
            }),
          },
        },
        {
          provide: SessionRepository,
          useValue: {
            addSession: jest.fn(),
            destroySession: jest.fn(),
            getSessionById: jest.fn().mockResolvedValue({
              toJSON: jest.fn().mockReturnValue({
                id: 1,
                refreshToken: MOCK_TOKEN.REFRESH_TOKEN,
                userId: MOCK_USER_WITHOUT_PASSWORD.id,
              }),
            }),
          },
        },
        {
          provide: JwtTokensSevice,
          useValue: {
            generateToken: jest.fn().mockImplementation((tokenType: TToken) => {
              return tokenType === 'access'
                ? MOCK_TOKEN.ACCESS_TOKEN
                : MOCK_TOKEN.REFRESH_TOKEN
            }),
            verifyToken: jest.fn().mockReturnValue(MOCK_USER_FROM_ACCESS_TOKEN),
          },
        },
      ],
    }).compile()

    authService = module.get<AuthService>(AuthService)
    usersService = module.get<UsersService>(UsersService)
    usersRepository = module.get<UsersRepository>(UsersRepository)
    sessionRepository = module.get<SessionRepository>(SessionRepository)
  })

  it('should sign-up user and return access and refresh tokens', async () => {
    const result = await authService.signUp(MOCK_USER_DTO)

    expect(usersService.createUser).toHaveBeenCalledWith(MOCK_USER_DTO)
    expect(sessionRepository.addSession).toHaveBeenCalledWith(
      MOCK_USER_WITHOUT_PASSWORD.id,
      MOCK_TOKEN.REFRESH_TOKEN,
    )
    expect(result).toEqual({
      accessToken: MOCK_TOKEN.ACCESS_TOKEN,
      refreshToken: MOCK_TOKEN.REFRESH_TOKEN,
    })
  })

  it('should sign-in user and return access and refresh tokens', async () => {
    jest.spyOn(bcrypt, 'compare').mockResolvedValue(true as never)

    const result = await authService.signIn(MOCK_SIGN_IN_USER_DTO)

    expect(usersRepository.getUserByEmail).toHaveBeenCalledWith(
      MOCK_USER_DTO.email,
    )
    expect(sessionRepository.destroySession).toHaveBeenCalledWith(
      MOCK_USER_WITHOUT_PASSWORD.id,
    )
    expect(sessionRepository.addSession).toHaveBeenCalledWith(
      MOCK_USER_WITHOUT_PASSWORD.id,
      MOCK_TOKEN.REFRESH_TOKEN,
    )
    expect(result).toEqual({
      accessToken: MOCK_TOKEN.ACCESS_TOKEN,
      refreshToken: MOCK_TOKEN.REFRESH_TOKEN,
    })
  })

  it('should logout user and return them', async () => {
    const result = await authService.logout(MOCK_USER_FROM_ACCESS_TOKEN)

    expect(sessionRepository.getSessionById).toHaveBeenCalledWith(
      MOCK_USER_FROM_ACCESS_TOKEN.id,
    )
    expect(sessionRepository.destroySession).toHaveBeenCalledWith(
      MOCK_USER_FROM_ACCESS_TOKEN.id,
    )
    expect(result).toEqual(MOCK_USER_WITHOUT_PASSWORD)
  })

  it('should update access token and return them', async () => {
    const result = await authService.updateToken(MOCK_TOKEN.REFRESH_TOKEN)

    expect(sessionRepository.getSessionById).toHaveBeenCalledWith(
      MOCK_USER_FROM_ACCESS_TOKEN.id,
    )
    expect(result).toEqual(MOCK_TOKEN.ACCESS_TOKEN)
  })
})
