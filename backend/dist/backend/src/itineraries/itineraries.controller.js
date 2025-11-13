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
exports.ItinerariesController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const current_user_decorator_1 = require("../common/decorators/current-user.decorator");
const jwt_auth_guard_1 = require("../common/guards/jwt-auth.guard");
const zod_validation_pipe_1 = require("../common/validation/zod-validation.pipe");
const create_itinerary_dto_1 = require("./dto/create-itinerary.dto");
const itineraries_service_1 = require("./itineraries.service");
let ItinerariesController = class ItinerariesController {
    constructor(itinerariesService) {
        this.itinerariesService = itinerariesService;
    }
    generate(dto) {
        return this.itinerariesService.create(dto);
    }
    create(user, dto) {
        var _a;
        const enriched = { ...dto, user_id: (_a = user === null || user === void 0 ? void 0 : user.userId) !== null && _a !== void 0 ? _a : dto.user_id };
        return this.itinerariesService.create(enriched);
    }
    list(user) {
        return this.itinerariesService.list(user.userId);
    }
    get(id) {
        return this.itinerariesService.get(id);
    }
};
exports.ItinerariesController = ItinerariesController;
__decorate([
    (0, common_1.Post)('generate'),
    __param(0, (0, common_1.Body)(new zod_validation_pipe_1.ZodValidationPipe(create_itinerary_dto_1.createItinerarySchema))),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], ItinerariesController.prototype, "generate", null);
__decorate([
    (0, common_1.Post)(),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Body)(new zod_validation_pipe_1.ZodValidationPipe(create_itinerary_dto_1.createItinerarySchema))),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", void 0)
], ItinerariesController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], ItinerariesController.prototype, "list", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], ItinerariesController.prototype, "get", null);
exports.ItinerariesController = ItinerariesController = __decorate([
    (0, swagger_1.ApiTags)('itineraries'),
    (0, common_1.Controller)('itineraries'),
    __metadata("design:paramtypes", [itineraries_service_1.ItinerariesService])
], ItinerariesController);
//# sourceMappingURL=itineraries.controller.js.map