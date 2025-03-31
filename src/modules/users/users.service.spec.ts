import { Test, TestingModule } from '@nestjs/testing'
import { ConflictException } from '@nestjs/common'
import * as bcrypt from 'bcryptjs'

import { UsersService } from './users.service'
import { UsersRepository } from './users.repository'
import { SessionRepository } from '../auth/sessions.repository'
import { User } from './users.model'
import { GetUserResDto } from './dto/get-user-res.dto'
import { CreateUserDto } from './dto/create-user.dto'
import { UsersFiltersQueryDto } from './dto/users-filters-query.dto'

import { Pagination } from 'src/common/helpers/pagination/pagination.helper'
import { IJwtPayload } from '../auth/jwt-tokens.service'

jest.mock('bcryptjs', () => ({
  hash: jest.fn(),
}))

describe('UsersService', () => {
  const TIMESTAMP = '2025-03-24T13:35:04.579Z'
  const USER_DTO: CreateUserDto = {
    login: 'Ilya Karpov',
    age: 20,
    description: 'Hi, my name is Jarpov Ilya, I am a worker',
    email: 'karpov.ilya05@gmail.com',
    password: 'TestPassword123321',
  }
  const USER_FROM_ACCESS_TOKEN: IJwtPayload = {
    id: 1,
    login: USER_DTO.login,
    age: USER_DTO.age,
    description: USER_DTO.description,
    email: USER_DTO.email,
    createdAt: TIMESTAMP,
    updatedAt: TIMESTAMP,
    deletedAt: null,
    iat: '',
    exp: '',
  }
  const RETURNED_USER: GetUserResDto = {
    id: USER_FROM_ACCESS_TOKEN.id,
    login: USER_FROM_ACCESS_TOKEN.login,
    age: USER_FROM_ACCESS_TOKEN.age,
    description: USER_FROM_ACCESS_TOKEN.description,
    email: USER_FROM_ACCESS_TOKEN.email,
    createdAt: USER_FROM_ACCESS_TOKEN.createdAt,
    updatedAt: USER_FROM_ACCESS_TOKEN.updatedAt,
  }

  let usersService: UsersService
  let usersRepository: UsersRepository
  let sessionRepository: SessionRepository

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: UsersRepository,
          useValue: {
            destroyUser: jest.fn(),
            checkUserAlreadyExist: jest.fn(),
            addUser: jest.fn(),
            getUserCount: jest.fn(),
            getPaginatedUsers: jest.fn(),
          },
        },
        {
          provide: SessionRepository,
          useValue: { destroySession: jest.fn() },
        },
      ],
    }).compile()

    usersService = module.get<UsersService>(UsersService)
    usersRepository = module.get<UsersRepository>(UsersRepository)
    sessionRepository = module.get<SessionRepository>(SessionRepository)
  })

  it('should return user', () => {
    const result = usersService.getUser(USER_FROM_ACCESS_TOKEN)
    expect(result).toEqual(RETURNED_USER)
  })

  it('should delete user and return them', async () => {
    const result = await usersService.deleteUser(USER_FROM_ACCESS_TOKEN)

    expect(result).toEqual(RETURNED_USER)
    expect(usersRepository.destroyUser).toHaveBeenCalledWith(
      USER_FROM_ACCESS_TOKEN.id,
    )
    expect(sessionRepository.destroySession).toHaveBeenCalledWith(
      USER_FROM_ACCESS_TOKEN.id,
    )
  })

  it('should create user and return them', async () => {
    const hashedPassword = 'hashedPassword'

    jest
      .spyOn(usersRepository, 'checkUserAlreadyExist')
      .mockResolvedValue(false)
    jest
      .spyOn(usersRepository, 'addUser')
      .mockResolvedValue(RETURNED_USER as User)
    jest.spyOn(bcrypt, 'hash').mockResolvedValue(hashedPassword as never)

    const result = await usersService.createUser(USER_DTO)

    expect(bcrypt.hash).toHaveBeenCalledWith(USER_DTO.password, 10)
    expect(usersRepository.checkUserAlreadyExist).toHaveBeenCalledWith(
      USER_DTO.email,
    )
    expect(usersRepository.addUser).toHaveBeenCalledWith({
      ...USER_DTO,
      password: hashedPassword,
    })
    expect(result).toEqual(RETURNED_USER)
  })

  it('should throw ConflictException if user already exists', async () => {
    jest.spyOn(usersRepository, 'checkUserAlreadyExist').mockResolvedValue(true)

    await expect(usersService.createUser(USER_DTO)).rejects.toThrow(
      ConflictException,
    )
    expect(usersRepository.checkUserAlreadyExist).toHaveBeenCalledWith(
      USER_DTO.email,
    )
    expect(usersRepository.addUser).not.toHaveBeenCalled()
  })

  it('should return a paginated users array', async () => {
    const mockLimit = 1
    const mockPage = 1
    const mockFilters: UsersFiltersQueryDto = { login: undefined }
    const mockUsers = [RETURNED_USER] as User[]
    const mockUsersCount = 1

    const mockPagination = new Pagination({
      limit: mockLimit,
      page: mockPage,
      totalCount: mockUsersCount,
    })

    jest
      .spyOn(usersRepository, 'getUserCount')
      .mockResolvedValue(mockUsersCount)
    jest
      .spyOn(usersRepository, 'getPaginatedUsers')
      .mockResolvedValue({ rows: mockUsers, count: mockUsersCount })

    const result = await usersService.getAllUsers(
      mockLimit,
      mockPage,
      mockFilters,
    )

    expect(usersRepository.getUserCount).toHaveBeenCalled()
    expect(usersRepository.getPaginatedUsers).toHaveBeenCalledWith(
      mockPagination.limit,
      mockPagination.offset,
      mockFilters,
    )
    expect(result).toEqual({
      users: mockUsers,
      pagination: mockPagination.pageData,
    })
  })
})
