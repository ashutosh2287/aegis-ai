import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

export type EndpointType = 'chat' | 'workout' | 'nutrition' | 'analysis';

@Injectable()
export class ModelRouter {
  private readonly logger = new Logger(ModelRouter.name);
  private readonly model: string;

  constructor(private readonly configService: ConfigService) {
    this.model = this.configService.get<string>('AI_MODEL') || 'qwen3:8b';
    this.logger.log(`ModelRouter: single model for all endpoints: ${this.model}`);
  }

  getModelForEndpoint(_endpoint: EndpointType): string {
    return this.model;
  }

  getModels(): Record<EndpointType, string> {
    return {
      chat: this.model,
      workout: this.model,
      nutrition: this.model,
      analysis: this.model,
    };
  }
}
