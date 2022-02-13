"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PostgreSQLChecker = exports.PostgreSQLBatchWriter = exports.PostgreSQLWriter = exports.version = exports.StringService = exports.isEmpty = exports.getMapField = exports.buildFields = exports.getFields = exports.mapArray = exports.map = exports.handleBool = exports.handleResults = exports.toArray = exports.saveBatchWithClient = exports.saveBatch = exports.save = exports.execBatchWithClient = exports.execBatch = exports.count = exports.execScalar = exports.queryOne = exports.query = exports.exec = exports.PoolClientManager = exports.PoolManager = exports.resource = void 0;
const build_1 = require("./build");
__exportStar(require("./metadata"), exports);
__exportStar(require("./build"), exports);
// tslint:disable-next-line:class-name
class resource {
}
exports.resource = resource;
class PoolManager {
    constructor(pool) {
        this.pool = pool;
        this.exec = this.exec.bind(this);
        this.execBatch = this.execBatch.bind(this);
        this.query = this.query.bind(this);
        this.queryOne = this.queryOne.bind(this);
        this.execScalar = this.execScalar.bind(this);
        this.count = this.count.bind(this);
    }
    exec(sql, args) {
        return exec(this.pool, sql, args);
    }
    execBatch(statements, firstSuccess) {
        return execBatch(this.pool, statements, firstSuccess);
    }
    query(sql, args, m, bools) {
        return query(this.pool, sql, args, m, bools);
    }
    queryOne(sql, args, m, bools) {
        return queryOne(this.pool, sql, args, m, bools);
    }
    execScalar(sql, args) {
        return execScalar(this.pool, sql, args);
    }
    count(sql, args) {
        return count(this.pool, sql, args);
    }
}
exports.PoolManager = PoolManager;
// tslint:disable-next-line:max-classes-per-file
class PoolClientManager {
    constructor(client) {
        this.client = client;
        this.exec = this.exec.bind(this);
        this.execBatch = this.execBatch.bind(this);
        this.query = this.query.bind(this);
        this.queryOne = this.queryOne.bind(this);
        this.execScalar = this.execScalar.bind(this);
        this.count = this.count.bind(this);
    }
    exec(sql, args) {
        return exec(this.client, sql, args);
    }
    execBatch(statements, firstSuccess) {
        return execBatchWithClient(this.client, statements, firstSuccess);
    }
    query(sql, args, m, bools) {
        return query(this.client, sql, args, m, bools);
    }
    queryOne(sql, args, m, bools) {
        return queryOne(this.client, sql, args, m, bools);
    }
    execScalar(sql, args) {
        return execScalar(this.client, sql, args);
    }
    count(sql, args) {
        return count(this.client, sql, args);
    }
}
exports.PoolClientManager = PoolClientManager;
function buildError(err) {
    if (err.code === '23505') {
        err.error = 'duplicate';
    }
    return err;
}
function exec(client, sql, args) {
    const p = toArray(args);
    return new Promise((resolve, reject) => {
        return client.query(sql, p, (err, results) => {
            if (err) {
                buildError(err);
                return reject(err);
            }
            else {
                return resolve(results.rowCount);
            }
        });
    });
}
exports.exec = exec;
function query(client, sql, args, m, bools) {
    const p = toArray(args);
    return new Promise((resolve, reject) => {
        return client.query(sql, p, (err, results) => {
            if (err) {
                return reject(err);
            }
            else {
                return resolve(handleResults(results.rows, m, bools));
            }
        });
    });
}
exports.query = query;
function queryOne(client, sql, args, m, bools) {
    return query(client, sql, args, m, bools).then(r => {
        return (r && r.length > 0 ? r[0] : null);
    });
}
exports.queryOne = queryOne;
function execScalar(client, sql, args) {
    return queryOne(client, sql, args).then(r => {
        if (!r) {
            return null;
        }
        else {
            const keys = Object.keys(r);
            return r[keys[0]];
        }
    });
}
exports.execScalar = execScalar;
function count(client, sql, args) {
    return execScalar(client, sql, args);
}
exports.count = count;
function execBatch(pool, statements, firstSuccess) {
    return __awaiter(this, void 0, void 0, function* () {
        if (!statements || statements.length === 0) {
            return Promise.resolve(0);
        }
        else if (statements.length === 1) {
            return exec(pool, statements[0].query, toArray(statements[0].params));
        }
        const client = yield pool.connect();
        let c = 0;
        if (firstSuccess) {
            try {
                yield client.query('begin');
                const result0 = yield client.query(statements[0].query, toArray(statements[0].params));
                if (result0 && result0.rowCount !== 0) {
                    const subs = statements.slice(1);
                    const arrPromise = subs.map(item => {
                        return client.query(item.query, item.params ? item.params : []);
                    });
                    yield Promise.all(arrPromise).then(results => {
                        for (const obj of results) {
                            c += obj.rowCount;
                        }
                    });
                    c += result0.rowCount;
                    yield client.query('commit');
                    return c;
                }
            }
            catch (e) {
                buildError(e);
                yield client.query('rollback');
                throw e;
            }
            finally {
                client.release();
            }
        }
        else {
            try {
                yield client.query('begin');
                const arrPromise = statements.map((item, i) => {
                    return client.query(item.query, toArray(item.params));
                });
                yield Promise.all(arrPromise).then(results => {
                    for (const obj of results) {
                        c += obj.rowCount;
                    }
                });
                yield client.query('commit');
                return c;
            }
            catch (e) {
                yield client.query('rollback');
                throw e;
            }
            finally {
                client.release();
            }
        }
    });
}
exports.execBatch = execBatch;
function execBatchWithClient(client, statements, firstSuccess) {
    return __awaiter(this, void 0, void 0, function* () {
        if (!statements || statements.length === 0) {
            return Promise.resolve(0);
        }
        else if (statements.length === 1) {
            return exec(client, statements[0].query, statements[0].params);
        }
        let c = 0;
        if (firstSuccess) {
            try {
                yield client.query('begin');
                const result0 = yield client.query(statements[0].query, toArray(statements[0].params));
                if (result0 && result0.rowCount !== 0) {
                    const subs = statements.slice(1);
                    const arrPromise = subs.map((item, i) => {
                        return client.query(item.query, item.params ? item.params : []);
                    });
                    yield Promise.all(arrPromise).then(results => {
                        for (const obj of results) {
                            c += obj.rowCount;
                        }
                    });
                    c += result0.rowCount;
                    yield client.query('commit');
                    return c;
                }
            }
            catch (e) {
                yield client.query('rollback');
                throw e;
            }
            finally {
                client.release();
            }
        }
        else {
            try {
                yield client.query('begin');
                const arrPromise = statements.map((item, i) => {
                    return client.query(item.query, toArray(item.params));
                });
                yield Promise.all(arrPromise).then(results => {
                    for (const obj of results) {
                        c += obj.rowCount;
                    }
                });
                yield client.query('commit');
                return c;
            }
            catch (e) {
                yield client.query('rollback');
                throw e;
            }
            finally {
                client.release();
            }
        }
    });
}
exports.execBatchWithClient = execBatchWithClient;
function save(client, obj, table, attrs, ver, buildParam, i) {
    const s = build_1.buildToSave(obj, table, attrs, ver, buildParam);
    if (typeof client === 'function') {
        return client(s.query, s.params);
    }
    else {
        return exec(client, s.query, s.params);
    }
}
exports.save = save;
function saveBatch(pool, objs, table, attrs, ver, buildParam) {
    const s = build_1.buildToSaveBatch(objs, table, attrs, ver, buildParam);
    return execBatch(pool, s);
}
exports.saveBatch = saveBatch;
function saveBatchWithClient(client, objs, table, attrs, ver, buildParam) {
    const s = build_1.buildToSaveBatch(objs, table, attrs, ver, buildParam);
    return execBatchWithClient(client, s);
}
exports.saveBatchWithClient = saveBatchWithClient;
function toArray(arr) {
    if (!arr || arr.length === 0) {
        return [];
    }
    const p = [];
    const l = arr.length;
    for (let i = 0; i < l; i++) {
        if (arr[i] === undefined || arr[i] == null) {
            p.push(null);
        }
        else {
            if (typeof arr[i] === 'object') {
                if (arr[i] instanceof Date) {
                    p.push(arr[i]);
                }
                else {
                    if (resource.string) {
                        const s = JSON.stringify(arr[i]);
                        p.push(s);
                    }
                    else {
                        p.push(arr[i]);
                    }
                }
            }
            else {
                p.push(arr[i]);
            }
        }
    }
    return p;
}
exports.toArray = toArray;
function handleResults(r, m, bools) {
    if (m) {
        const res = mapArray(r, m);
        if (bools && bools.length > 0) {
            return handleBool(res, bools);
        }
        else {
            return res;
        }
    }
    else {
        if (bools && bools.length > 0) {
            return handleBool(r, bools);
        }
        else {
            return r;
        }
    }
}
exports.handleResults = handleResults;
function handleBool(objs, bools) {
    if (!bools || bools.length === 0 || !objs) {
        return objs;
    }
    for (const obj of objs) {
        for (const field of bools) {
            const v = obj[field.name];
            if (typeof v !== 'boolean' && v != null && v !== undefined) {
                const b = field.true;
                if (b == null || b === undefined) {
                    // tslint:disable-next-line:triple-equals
                    obj[field.name] = ('true' == v || '1' == v || 't' == v || 'y' == v || 'on' == v);
                }
                else {
                    // tslint:disable-next-line:triple-equals
                    obj[field.name] = (v == b ? true : false);
                }
            }
        }
    }
    return objs;
}
exports.handleBool = handleBool;
function map(obj, m) {
    if (!m) {
        return obj;
    }
    const mkeys = Object.keys(m);
    if (mkeys.length === 0) {
        return obj;
    }
    const obj2 = {};
    const keys = Object.keys(obj);
    for (const key of keys) {
        let k0 = m[key];
        if (!k0) {
            k0 = key;
        }
        obj2[k0] = obj[key];
    }
    return obj2;
}
exports.map = map;
function mapArray(results, m) {
    if (!m) {
        return results;
    }
    const mkeys = Object.keys(m);
    if (mkeys.length === 0) {
        return results;
    }
    const objs = [];
    const length = results.length;
    for (let i = 0; i < length; i++) {
        const obj = results[i];
        const obj2 = {};
        const keys = Object.keys(obj);
        for (const key of keys) {
            let k0 = m[key];
            if (!k0) {
                k0 = key;
            }
            obj2[k0] = obj[key];
        }
        objs.push(obj2);
    }
    return objs;
}
exports.mapArray = mapArray;
function getFields(fields, all) {
    if (!fields || fields.length === 0) {
        return undefined;
    }
    const ext = [];
    if (all) {
        for (const s of fields) {
            if (all.includes(s)) {
                ext.push(s);
            }
        }
        if (ext.length === 0) {
            return undefined;
        }
        else {
            return ext;
        }
    }
    else {
        return fields;
    }
}
exports.getFields = getFields;
function buildFields(fields, all) {
    const s = getFields(fields, all);
    if (!s || s.length === 0) {
        return '*';
    }
    else {
        return s.join(',');
    }
}
exports.buildFields = buildFields;
function getMapField(name, mp) {
    if (!mp) {
        return name;
    }
    const x = mp[name];
    if (!x) {
        return name;
    }
    if (typeof x === 'string') {
        return x;
    }
    return name;
}
exports.getMapField = getMapField;
function isEmpty(s) {
    return !(s && s.length > 0);
}
exports.isEmpty = isEmpty;
// tslint:disable-next-line:max-classes-per-file
class StringService {
    constructor(pool, table, column) {
        this.pool = pool;
        this.table = table;
        this.column = column;
        this.load = this.load.bind(this);
        this.save = this.save.bind(this);
    }
    load(key, max) {
        const s = `select ${this.column} from ${this.table} where ${this.column} ilike $1 order by ${this.column} fetch next ${max} rows only`;
        return query(this.pool, s, ['' + key + '%']).then(arr => {
            return arr.map(i => i[this.column]);
        });
    }
    save(values) {
        if (!values || values.length === 0) {
            return Promise.resolve(0);
        }
        const arr = [];
        for (let i = 1; i <= values.length; i++) {
            arr.push('($' + i + ')');
        }
        const s = `insert into ${this.table}(${this.column})values${arr.join(',')} on conflict do nothing`;
        return exec(this.pool, s, values);
    }
}
exports.StringService = StringService;
function version(attrs) {
    const ks = Object.keys(attrs);
    for (const k of ks) {
        const attr = attrs[k];
        if (attr.version) {
            attr.name = k;
            return attr;
        }
    }
    return undefined;
}
exports.version = version;
// tslint:disable-next-line:max-classes-per-file
class PostgreSQLWriter {
    constructor(pool, table, attributes, toDB, buildParam) {
        this.table = table;
        this.attributes = attributes;
        this.write = this.write.bind(this);
        if (typeof pool === 'function') {
            this.exec = pool;
        }
        else {
            this.pool = pool;
        }
        this.param = buildParam;
        this.map = toDB;
        const x = version(attributes);
        if (x) {
            this.version = x.name;
        }
    }
    write(obj) {
        if (!obj) {
            return Promise.resolve(0);
        }
        let obj2 = obj;
        if (this.map) {
            obj2 = this.map(obj);
        }
        const stmt = build_1.buildToSave(obj2, this.table, this.attributes, this.version, this.param);
        if (stmt) {
            if (this.exec) {
                return this.exec(stmt.query, stmt.params);
            }
            else {
                return exec(this.pool, stmt.query, stmt.params);
            }
        }
        else {
            return Promise.resolve(0);
        }
    }
}
exports.PostgreSQLWriter = PostgreSQLWriter;
// tslint:disable-next-line:max-classes-per-file
class PostgreSQLBatchWriter {
    constructor(pool, table, attributes, toDB, buildParam) {
        this.table = table;
        this.attributes = attributes;
        this.write = this.write.bind(this);
        if (typeof pool === 'function') {
            this.execute = pool;
        }
        else {
            this.pool = pool;
        }
        this.param = buildParam;
        this.map = toDB;
        const x = version(attributes);
        if (x) {
            this.version = x.name;
        }
    }
    write(objs) {
        if (!objs || objs.length === 0) {
            return Promise.resolve(0);
        }
        let list = objs;
        if (this.map) {
            list = [];
            for (const obj of objs) {
                const obj2 = this.map(obj);
                list.push(obj2);
            }
        }
        const stmts = build_1.buildToSaveBatch(list, this.table, this.attributes, this.version, this.param);
        if (stmts && stmts.length > 0) {
            if (this.execute) {
                return this.execute(stmts);
            }
            else {
                return execBatch(this.pool, stmts);
            }
        }
        else {
            return Promise.resolve(0);
        }
    }
}
exports.PostgreSQLBatchWriter = PostgreSQLBatchWriter;
// tslint:disable-next-line:max-classes-per-file
class PostgreSQLChecker {
    constructor(pool, service, timeout) {
        this.pool = pool;
        this.service = service;
        this.timeout = timeout;
        if (!this.timeout) {
            this.timeout = 4200;
        }
        if (!this.service) {
            this.service = 'sql';
        }
        this.check = this.check.bind(this);
        this.name = this.name.bind(this);
        this.build = this.build.bind(this);
    }
    check() {
        return __awaiter(this, void 0, void 0, function* () {
            const obj = {};
            yield this.pool.connect();
            const promise = new Promise((resolve, reject) => {
                this.pool.query('select now()', (err, result) => {
                    if (err) {
                        return reject(err);
                    }
                    else {
                        resolve(obj);
                    }
                });
            });
            if (this.timeout > 0) {
                return promiseTimeOut(this.timeout, promise);
            }
            else {
                return promise;
            }
        });
    }
    name() {
        return this.service;
    }
    build(data, err) {
        if (err) {
            if (!data) {
                data = {};
            }
            data['error'] = err;
        }
        return data;
    }
}
exports.PostgreSQLChecker = PostgreSQLChecker;
function promiseTimeOut(timeoutInMilliseconds, promise) {
    return Promise.race([
        promise,
        new Promise((resolve, reject) => {
            setTimeout(() => {
                reject(`Timed out in: ${timeoutInMilliseconds} milliseconds!`);
            }, timeoutInMilliseconds);
        })
    ]);
}
//# sourceMappingURL=postgresql.js.map