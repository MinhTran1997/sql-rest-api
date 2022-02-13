"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.pool = void 0;
const body_parser_1 = require("body-parser");
const dotenv_1 = __importDefault(require("dotenv"));
const express_1 = __importDefault(require("express"));
const http_1 = __importDefault(require("http"));
const pg_1 = require("pg");
const init_1 = require("./init");
const route_1 = require("./route");
dotenv_1.default.config();
const app = express_1.default();
const port = process.env.PORT;
const provider = process.env.PROVIDER;
app.use(body_parser_1.json());
exports.pool = new pg_1.Pool({
    user: 'postgres',
    host: 'localhost',
    password: 'bbc148562',
    database: 'public',
    port: 5432
});
exports.pool.connect().then(() => {
    const ctx = init_1.createContext(exports.pool, provider);
    route_1.route(app, ctx);
    http_1.default.createServer(app).listen(port, () => {
        console.log('Start server at port ' + port);
    });
    console.log('Connected successfully to PostgreSQL.');
})
    .catch(e => {
    console.error('Failed to connect to PostgreSQL.', e.message, e.stack);
});
//# sourceMappingURL=app.js.map