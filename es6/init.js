"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createContext = void 0;
const UserController_1 = require("./controllers/UserController");
const SqlUserService_1 = require("./services/sql/SqlUserService");
const google_drive_1 = require("./services/cloud/google_drive");
function createContext(pool, provider) {
    var storageService;
    if (provider == 'google-drive') {
        storageService = new google_drive_1.GoogleDriveService(process.env.GOOGLE_DRIVE_CLIENT_ID, process.env.GOOGLE_DRIVE_CLIENT_SECRET, process.env.GOOGLE_DRIVE_REDIRECT_URI, process.env.GOOGLE_DRIVE_REFRESH_TOKEN);
    }
    const userService = new SqlUserService_1.SqlUserService(pool);
    const userController = new UserController_1.UserController(userService, storageService);
    const ctx = { userController };
    return ctx;
}
exports.createContext = createContext;
//# sourceMappingURL=init.js.map