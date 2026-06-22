import { Provider } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AIProvider } from '../interfaces/ai-provider.interface';
import { OpenAIProvider } from './openai.provider';
import { GeminiProvider } from './gemini.provider';

export const AI_PROVIDER = 'AI_PROVIDER';

export const aiProviderFactory: Provider = {
  provide: AI_PROVIDER,
  useFactory: (configService: ConfigService): AIProvider => {
    const provider = (configService.get<string>('AI_PROVIDER') || 'openai').toLowerCase();

    if (provider === 'gemini') {
      return new GeminiProvider(configService);
    }

    return new OpenAIProvider(configService);
  },
  inject: [ConfigService],
};
