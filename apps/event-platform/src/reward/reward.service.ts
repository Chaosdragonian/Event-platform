import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { Model, Types } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { ClaimRewardDto } from '../../../../libs/common/src/dto/claim-reward.dto';
import { ConditionFactory } from '../common/condition/condition.factory';
import { Reward } from './schema/reward.schema';
import { Claim } from './schema/claim.schema';
import { EventConditionType, JwtPayload } from '@app/common';
import { CreateRewardDto } from '../../../../libs/common/src/dto/create-reward.dto';
import { Event } from '../event/schema/event.schema';
@Injectable()
export class RewardService {
  constructor(
    @InjectModel(Reward.name) private readonly rewardModel: Model<Reward>,
    @InjectModel(Claim.name) private readonly claimModel: Model<Claim>,
    @InjectModel(Event.name) private readonly eventModel: Model<Event>,
    private readonly condFactory: ConditionFactory,
  ) {}
  private readonly logger = new Logger(RewardService.name);
  async create(dto: CreateRewardDto) {
    this.logger.log('create :', dto);
    const eventId = new Types.ObjectId(dto.eventId);
    const event = await this.eventModel.findById(eventId);
    if (!event) {
      throw new NotFoundException('Event not found');
    }
    const reward = await this.rewardModel.create({
      type: dto.type,
      amount: dto.amount,
      eventId,
    });
    event.rewards.push(reward._id);
    await event.save();

    return reward;
  }

  findAll() {
    return this.rewardModel.find().exec();
  }

  findByEvent(eventId: string) {
    if (!Types.ObjectId.isValid(eventId)) {
      throw new NotFoundException('Invalid event ID');
    }
    return this.rewardModel.find({ eventId }).exec();
  }

  async claim(user: JwtPayload, dto: ClaimRewardDto) {
    const userId = new Types.ObjectId(user.sub);
    const eventId = new Types.ObjectId(dto.eventId);
    this.logger.log('claim :', user, eventId);
    const existing = await this.claimModel.findOne({ eventId, userId }).exec();
    if (existing) {
      this.logger.log('claim already exists :', existing);
      return existing;
    }
    let reward;
    try {
      reward = (await this.eventModel.findOne({ _id: eventId }).exec()).rewards;
      this.logger.log('reward: ', reward);
    } catch (error) {
      this.logger.error(error);
      throw new NotFoundException('Event not found');
    }

    if (!reward) {
      throw new NotFoundException('Reward not found');
    }
    const event = await this.eventModel.findById(eventId).exec();
    const checker = this.condFactory.get(
      event.conditionType.toString() as EventConditionType,
    );
    try {
      await checker.check(user, event.conditionMeta);
    } catch (error) {
      this.logger.error(error);
      return this.claimModel.create({
        eventId,
        userId,
        status: 'REJECTED',
      });
    }

    // 3) 클레임 생성
    return this.claimModel.create({
      eventId,
      userId: new Types.ObjectId(user.sub),
      status: 'PENDING',
    });
  }

  async listClaims(userId: string) {
    return this.claimModel.find({ userId }).exec();
  }

  async findClaims(filter: {
    userId?: string;
    rewardId?: string;
    status?: 'PENDING' | 'REJECTED' | 'APPROVED';
  }) {
    const query: any = {};
    if (filter.userId) query.userId = new Types.ObjectId(filter.userId);
    if (filter.rewardId) query.rewardId = new Types.ObjectId(filter.rewardId);
    if (filter.status) query.status = filter.status;

    return this.claimModel.find(query).exec();
  }
}
