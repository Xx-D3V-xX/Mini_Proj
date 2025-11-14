import { ConfigService } from '@nestjs/config';
import { Strategy } from 'passport-jwt';
import { AppConfigService } from '../../common/config';
import { Role } from '../../common/decorators/roles.decorator';
declare const JwtStrategy_base: new (...args: [opt: import("@types/passport-jwt").StrategyOptionsWithRequest] | [opt: import("@types/passport-jwt").StrategyOptionsWithoutRequest]) => Strategy & {
    validate(...args: any[]): unknown;
};
export declare class JwtStrategy extends JwtStrategy_base {
    private readonly appConfig;
    constructor(configService: ConfigService, appConfig: AppConfigService);
    validate(payload: {
        sub: string;
        email: string;
        role: Role;
    }): Promise<{
        userId: string;
        email: string;
        role: Role;
    }>;
}
export {};
