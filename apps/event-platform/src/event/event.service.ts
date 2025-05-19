import { Injectable, NotFoundException } from '@nestjs/common';
import { Model, Types } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { CreateEventDto } from './dto/create-event.dto';

@Injectable()
export class EventService {
  constructor(
    @InjectModel(Event.name) private readonly eventModel: Model<Event>,
  ) {}

  create(dto: CreateEventDto) {
    return this.eventModel.create({
      ...dto,
      startAt: new Date(dto.startAt),
      endAt: new Date(dto.endAt),
    });
  }
  findAll() {
    return this.eventModel.find().exec();
  }

  async findById(id: string) {
    if (!Types.ObjectId.isValid(id)) {
      throw new NotFoundException('Invalid event ID');
    }
    const ev = await this.eventModel.findById(id).exec();
    if (!ev) throw new NotFoundException('Event not found');
    return ev;
  }
}
