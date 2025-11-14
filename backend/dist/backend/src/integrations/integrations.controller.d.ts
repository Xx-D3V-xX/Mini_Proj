import { AiClientService } from './ai-client.service';
import { WeatherClientService } from './weather-client.service';
import { PrismaService } from '../prisma/prisma.service';
export declare class IntegrationsController {
    private readonly aiClient;
    private readonly weatherClient;
    private readonly prisma;
    constructor(aiClient: AiClientService, weatherClient: WeatherClientService, prisma: PrismaService);
    recommend(payload: any): Promise<any>;
    chat(payload: any): Promise<any>;
    travelTime(payload: any): Promise<any>;
    weather(): Promise<{
        summary: string;
        advice: string;
        status: any;
        temperature_c: any;
        humidity: number;
        icon: string;
    }>;
}
