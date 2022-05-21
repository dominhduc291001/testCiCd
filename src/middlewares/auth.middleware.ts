import config from 'config';
import { NextFunction, Response } from 'express';
import jwt from 'jsonwebtoken';
import { getRepository } from 'typeorm';
import { UserEntity } from '@entity/users.entity';
import { HttpException } from '@/exceptions/httpException';
import { DataStoredInToken, RequestWithUser } from '@interfaces/auth.interface';
import httpStatus from 'http-status';

//Don't use anymore
const authMiddleware = async (req: RequestWithUser, res: Response, next: NextFunction) => {
  try {
    const Authorization = req.cookies['Authorization'] || req.header('Authorization').split('Bearer ')[1] || null;

    if (Authorization) {
      const secretKey: string = config.get('secretKey');
      const verificationResponse = (await jwt.verify(Authorization, secretKey)) as DataStoredInToken;
      const userId = verificationResponse.id;

      const userRepository = getRepository(UserEntity);
      const findUser = await userRepository.findOne(userId, { select: ['id', 'email', 'password'] });

      if (findUser) {
        req.user = findUser;
        next();
      } else {
        next(new HttpException(httpStatus.UNAUTHORIZED, 'Wrong authentication token'));
      }
    } else {
      next(new HttpException(httpStatus.NOT_FOUND, 'Authentication token missing'));
    }
  } catch (error) {
    next(new HttpException(httpStatus.UNAUTHORIZED, 'Wrong authentication token'));
  }
};

export default authMiddleware;
