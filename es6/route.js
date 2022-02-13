"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.route = void 0;
const multer_1 = __importDefault(require("multer"));
function route(app, ctx) {
    const upload = multer_1.default();
    const user = ctx.userController;
    app.get('/users', user.all);
    app.get('/users/:id', user.load);
    app.post('/users', user.insert);
    app.put('/users/:id', user.update);
    app.delete('/users/:id', user.delete);
    app.post('/transactions', user.insertMany);
    app.post('/upload', upload.single('file'), user.uploadFile);
    app.delete('/upload/:', upload.single('file'), user.deleteFile);
}
exports.route = route;
//# sourceMappingURL=route.js.map