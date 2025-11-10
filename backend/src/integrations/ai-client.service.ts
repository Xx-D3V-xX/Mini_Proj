import { Injectable, Logger } from '@nestjs/common';
import axios, { AxiosInstance } from 'axios';

import { AppConfigService } from '../common/config';

@Injectable()
export class AiClientService {
  private readonly client: AxiosInstance;
  private readonly logger = new Logger(AiClientService.name);

  constructor(private readonly config: AppConfigService) {
    this.client = axios.create({
      baseURL: this.config.aiBaseUrl,
      timeout: 4000,
    });
  }

  async recommend(payload: any) {
    return this.post('/recommend', payload);
  }

  async itinerary(payload: any) {
    return this.post('/itinerary', payload);
  }

  async travelTime(payload: any) {
    return this.post('/travel-time', payload);
  }

  async chat(payload: any) {
    return this.post('/chat', payload);
  }

  async weather() {
    return this.get('/weather');
  }

  private async post(path: string, body: any) {
    try {
      const { data } = await this.client.post(path, body);
      return data;
    } catch (err) {
      this.logger.error(`AI request ${path} failed`, (err as Error).stack);
      throw err;
    }
  }

  private async get(path: string) {
    try {
      const { data } = await this.client.get(path);
      return data;
    } catch (err) {
      this.logger.error(`AI request ${path} failed`, (err as Error).stack);
      throw err;
    }
  }
}
