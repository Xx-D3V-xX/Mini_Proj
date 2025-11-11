"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PoiSearchController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const zod_validation_pipe_1 = require("../common/validation/zod-validation.pipe");
const query_poi_dto_1 = require("./dto/query-poi.dto");
const pois_service_1 = require("./pois.service");
let PoiSearchController = class PoiSearchController {
    constructor(poisService) {
        this.poisService = poisService;
    }
    search(query) {
        return this.poisService.search(query);
    }
};
exports.PoiSearchController = PoiSearchController;
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Query)(new zod_validation_pipe_1.ZodValidationPipe(query_poi_dto_1.searchPoiSchema))),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], PoiSearchController.prototype, "search", null);
exports.PoiSearchController = PoiSearchController = __decorate([
    (0, swagger_1.ApiTags)('search'),
    (0, common_1.Controller)('search'),
    __metadata("design:paramtypes", [pois_service_1.PoisService])
], PoiSearchController);
//# sourceMappingURL=search.controller.js.map