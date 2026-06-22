import { IsString, IsNotEmpty, IsOptional, MaxLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class AiChatDto {
  @ApiProperty({
    description: 'The user message to the AI coach',
    example: 'Can you help me design a chest and back workout for tomorrow?',
    maxLength: 4000,
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(4000)
  message!: string;

  @ApiPropertyOptional({
    description: 'Optional conversation history for context',
    example: [{ role: 'user', content: 'I want to focus on hypertrophy' }],
  })
  @IsOptional()
  history?: { role: 'user' | 'assistant'; content: string }[];
}
