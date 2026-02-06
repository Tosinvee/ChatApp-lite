import * as bcrypt from 'bcrypt';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { User } from './schema/user.schema';
import { Model } from 'mongoose';
import { CreateUserDto } from './dto/create-user.dto';

@Injectable()
export class UserService {
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<User>,
  ) {}

  async hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, await bcrypt.genSalt());
  }

  async create(body: CreateUserDto): Promise<User> {
    const user = await this.userModel.create({
      ...body,
      password: await this.hashPassword(body.password),
    });
    return await user.save();
  }

  async getUser(query: Record<string, any>) {
    return this.userModel.findOne(query);
  }
}
