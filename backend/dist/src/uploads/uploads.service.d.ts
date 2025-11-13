export declare class UploadsService {
    private readonly uploadDir;
    constructor();
    saveImage(file: Express.Multer.File): Promise<{
        filename: string;
        path: string;
    }>;
}
