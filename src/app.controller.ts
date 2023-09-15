import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';

@ApiTags('Server')
@Controller()
export class AppController {
  @ApiOperation({ summary: '서버 상태 확인' })
  @Get('health-check')
  healthCheck() {
    return;
  }
}
