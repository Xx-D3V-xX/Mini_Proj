import { PoisService } from '../pois/pois.service';
export declare class AdminController {
    private readonly poisService;
    constructor(poisService: PoisService);
    importCsv(file?: Express.Multer.File): Promise<{
        created: number;
        updated: number;
        failed: number;
        errors: string[];
    }>;
}
