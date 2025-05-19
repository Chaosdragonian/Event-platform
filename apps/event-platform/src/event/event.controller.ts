import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { CreateEventDto } from './dto/create-event.dto';
import { EventService } from './event.service';

@Controller('event')
export class EventController {
  constructor(private readonly eventService: EventService) {}

  @Post('create')
  create(@Body() dto: CreateEventDto) {
    return this.eventService.create(dto);
  }
  @Get()
  list() {
    return this.eventService.findAll();
  }
  @Get(':id')
  get(@Param('id') id: string) {
    return this.eventService.findById(id);
  }
}
