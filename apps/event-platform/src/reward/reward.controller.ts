import { Body, Controller, Get, Post, Query, Req } from '@nestjs/common';
import { ClaimRewardDto } from '../../../../libs/common/src/dto/claim-reward.dto';
import { JwtPayload, Role } from '@app/common';
import { ListClaimsDto } from '../../../../libs/common/src/dto/list-claim.dto';
import { RewardService } from './reward.service';
import { CreateRewardDto } from '@app/common/dto/create-reward.dto';

@Controller('reward')
export class RewardController {
  constructor(private readonly rewardService: RewardService) {}
  @Post()
  async create(@Body() dto: CreateRewardDto) {
    return this.rewardService.create(dto);
  }
  @Post('claim')
  claim(@Req() req, @Body() dto: ClaimRewardDto) {
    return this.rewardService.claim(req.user, dto);
  }

  @Get('claim')
  listClaims(@Req() req: any, @Query() dto: ListClaimsDto) {
    const user = req.user as JwtPayload;
    const roles = user.roles;

    // 1) filter 객체 조립
    const filter: {
      userId?: string;
      rewardId?: string;
      status?: 'PENDING' | 'REJECTED' | 'APPROVED';
    } = {};

    // rewardId/status 필터
    if (dto.rewardId) filter.rewardId = dto.rewardId;
    if (dto.status) filter.status = dto.status;

    // 유저 권한에 따라 userId 필터 결정
    if (
      [Role.OPERATOR, Role.AUDITOR, Role.ADMIN].some((r) => roles.includes(r))
    ) {
      // 운영자 이상 → ?
      if (dto.userId) {
        filter.userId = dto.userId; // 특정 유저 이력
      }
      // dto.userId 없으면 전체 조회 → filter.userId undefined
    } else {
      // 일반 유저 → 본인만
      filter.userId = user.sub;
    }

    return this.rewardService.findClaims(filter);
  }
}
