import { Controller, Get, Query } from '@nestjs/common';
import { GraphService } from './graph.service';
import { PinoLogger } from 'nestjs-pino';

@Controller({
  path: 'graphs',
  version: '1',
})
export class GraphController {
  constructor(
    private readonly graphService: GraphService,
    private readonly logger: PinoLogger,
  ) {}

  @Get('setup')
  async setup() {
    return this.graphService.setup();
  }

  @Get('shortestPath')
  async getShortestPath(
    @Query('start') start: string,
    @Query('end') end: string,
    @Query('type') type: string,
  ): Promise<any> {
    this.logger.info('Finding shortest path');
    if (!start || !end) {
      return {
        error: 'Starting and ending airports are required as query parameters.',
      };
    }

    if (!type) {
      return {
        error: 'Type of shortest path is required as query parameter.',
      };
    }

    return this.graphService.findShortestPath(start, end, type);
  }
}
