import { ConfigService } from '@nestjs/config';
export declare class WeatherClientService {
    private readonly config;
    constructor(config: ConfigService);
    current(lat?: number, lng?: number): Promise<{
        summary: string;
        advice: string;
        status: any;
        temperature_c: any;
        humidity: number;
        icon: string;
    }>;
}
