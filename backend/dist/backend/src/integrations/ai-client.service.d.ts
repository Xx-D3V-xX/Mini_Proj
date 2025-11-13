import { AppConfigService } from '../common/config';
export declare class AiClientService {
    private readonly config;
    private readonly client;
    private readonly logger;
    constructor(config: AppConfigService);
    recommend(payload: any): Promise<any>;
    itinerary(payload: any): Promise<any>;
    travelTime(payload: any): Promise<any>;
    chat(payload: any): Promise<any>;
    weather(): Promise<any>;
    private post;
    private get;
}
