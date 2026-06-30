import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { v4 as uuidv4 } from 'uuid';
import { User, UserDocument, UserRole, UserStatus } from './schemas/user.schema';
import { UpdateStatusDto } from './dto/update-status.dto';
import { UpdateCityDto } from './dto/update-city.dto';

interface FindOrCreateParams {
  email: string;
  name: string;
  avatar: string | null;
  provider: string;
  providerId: string;
}

@Injectable()
export class UsersService {
  private readonly logger = new Logger(UsersService.name);

  constructor(
    @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
  ) {}

  async findOrCreate(params: FindOrCreateParams): Promise<UserDocument> {
    const existing = await this.userModel.findOne({ email: params.email }).exec();

    if (existing) {
      return existing;
    }

    const adminEmail = process.env.ADMIN_EMAIL;
    const role = params.email === adminEmail ? UserRole.ADMIN : UserRole.USER;
    const status = role === UserRole.ADMIN ? UserStatus.APPROVED : UserStatus.PENDING;

    const created = new this.userModel({ ...params, role, status });
    await created.save();

    this.logger.log(
      `New user created: ${params.email} (role=${role}, status=${status})`,
    );

    return created;
  }

  async findById(id: string): Promise<UserDocument> {
    const user = await this.userModel.findById(id).exec();
    if (!user) {
      throw new NotFoundException(`User ${id} not found`);
    }
    return user;
  }

  async findByEmail(email: string): Promise<UserDocument | null> {
    return this.userModel.findOne({ email }).exec();
  }

  async findByTelegramLinkToken(token: string): Promise<UserDocument | null> {
    return this.userModel.findOne({ telegramLinkToken: token }).exec();
  }

  async findAll(): Promise<UserDocument[]> {
    return this.userModel.find().sort({ createdAt: -1 }).exec();
  }

  async findApprovedWithTelegram(): Promise<UserDocument[]> {
    return this.userModel
      .find({
        status: UserStatus.APPROVED,
        telegramChatId: { $ne: null },
        city: { $ne: null },
      })
      .exec();
  }

  async updateStatus(
    id: string,
    dto: UpdateStatusDto,
  ): Promise<UserDocument> {
    const user = await this.userModel
      .findByIdAndUpdate(
        id,
        {
          status: dto.status,
          ...(dto.status === UserStatus.APPROVED
            ? { telegramLinkToken: uuidv4() }
            : {}),
        },
        { new: true },
      )
      .exec();

    if (!user) {
      throw new NotFoundException(`User ${id} not found`);
    }

    this.logger.log(`User ${user.email} status changed to ${dto.status}`);
    return user;
  }

  async linkTelegram(
    userId: string,
    chatId: string,
    username: string | null,
  ): Promise<UserDocument> {
    const user = await this.userModel
      .findByIdAndUpdate(
        userId,
        {
          telegramChatId: chatId,
          telegramUsername: username,
          telegramLinkToken: null,
        },
        { new: true },
      )
      .exec();

    if (!user) {
      throw new NotFoundException(`User ${userId} not found`);
    }

    this.logger.log(`Telegram linked for user ${user.email}, chatId=${chatId}`);
    return user;
  }

  async updateCity(id: string, dto: UpdateCityDto): Promise<UserDocument> {
    const user = await this.userModel
      .findByIdAndUpdate(id, { city: dto.city }, { new: true })
      .exec();

    if (!user) {
      throw new NotFoundException(`User ${id} not found`);
    }

    return user;
  }
}
