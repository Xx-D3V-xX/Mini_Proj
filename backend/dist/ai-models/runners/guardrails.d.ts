export declare function ensureEvidence<T extends {
    evidence?: string[];
}>(items: T[]): T[];
export declare function ensurePoiReferences(mentioned: string[], allowed: Set<string>): string[];
