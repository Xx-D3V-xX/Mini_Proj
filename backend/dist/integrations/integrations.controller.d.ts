import { AiClientService } from './ai-client.service';
import { WeatherClientService } from './weather-client.service';
export declare class IntegrationsController {
    private readonly aiClient;
    private readonly weatherClient;
    constructor(aiClient: AiClientService, weatherClient: WeatherClientService);
    recommend(payload: any): Promise<any>;
    chat(payload: any): Promise<any>;
    travelTime(payload: any): Promise<any>;
    weather(): Promise<{
        status: any;
        description: string;
        temperature_c: any;
        humidity: number;
        icon: string;
    }>;
}
