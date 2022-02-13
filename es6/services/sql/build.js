"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.toString = exports.buildToSaveBatch = exports.buildToSave = exports.metadata = exports.params = exports.param = void 0;
function param(i) {
    return '$' + i;
}
exports.param = param;
function params(length, from) {
    if (from === undefined || from == null) {
        from = 0;
    }
    const ps = [];
    for (let i = 1; i <= length; i++) {
        ps.push(param(i + from));
    }
    return ps;
}
exports.params = params;
function metadata(attrs) {
    const mp = {};
    const ks = Object.keys(attrs);
    const ats = [];
    const bools = [];
    const fields = [];
    let ver;
    let isMap = false;
    for (const k of ks) {
        const attr = attrs[k];
        attr.name = k;
        if (attr.key) {
            ats.push(attr);
        }
        if (!attr.ignored) {
            fields.push(k);
        }
        if (attr.type === 'boolean') {
            bools.push(attr);
        }
        if (attr.version) {
            ver = k;
        }
        const field = (attr.field ? attr.field : k);
        const s = field.toLowerCase();
        if (s !== k) {
            mp[s] = k;
            isMap = true;
        }
    }
    const m = { keys: ats, fields, version: ver };
    if (isMap) {
        m.map = mp;
    }
    if (bools.length > 0) {
        m.bools = bools;
    }
    return m;
}
exports.metadata = metadata;
function buildToSave(obj, table, attrs, ver, buildParam, i) {
    if (!i) {
        i = 1;
    }
    if (!buildParam) {
        buildParam = param;
    }
    const ks = Object.keys(attrs);
    const pks = [];
    const cols = [];
    const values = [];
    const args = [];
    let isVersion = false;
    for (const k of ks) {
        const attr = attrs[k];
        attr.name = k;
        if (attr.key) {
            pks.push(attr);
        }
        let v = obj[k];
        if (v === undefined || v == null) {
            v = attr.default;
        }
        if (v !== undefined && v != null && !attr.ignored && !attr.noinsert) {
            const field = (attr.field ? attr.field : k);
            cols.push(field);
            if (k === ver) {
                isVersion = true;
                values.push(`${1}`);
            }
            else {
                if (v === '') {
                    values.push(`''`);
                }
                else if (typeof v === 'number') {
                    values.push(toString(v));
                }
                else if (typeof v === 'boolean') {
                    if (attr.true === undefined) {
                        if (v === true) {
                            values.push(`true`);
                        }
                        else {
                            values.push(`false`);
                        }
                    }
                    else {
                        const p = buildParam(i++);
                        values.push(p);
                        if (v === true) {
                            const v2 = (attr.true ? attr.true : '1');
                            args.push(v2);
                        }
                        else {
                            const v2 = (attr.false ? attr.false : '0');
                            args.push(v2);
                        }
                    }
                }
                else {
                    const p = buildParam(i++);
                    values.push(p);
                    args.push(v);
                }
            }
        }
    }
    if (!isVersion && ver && ver.length > 0) {
        const attr = attrs[ver];
        const field = (attr.field ? attr.field : ver);
        cols.push(field);
        values.push(`${1}`);
    }
    if (pks.length === 0) {
        if (cols.length === 0) {
            return null;
        }
        else {
            const q = `insert into ${table}(${cols.join(',')})values(${values.join(',')})`;
            return { query: q, params: args };
        }
    }
    else {
        const colSet = [];
        for (const k of ks) {
            const v = obj[k];
            if (v !== undefined) {
                const attr = attrs[k];
                if (attr && !attr.key && !attr.ignored && !attr.noupdate) {
                    const field = (attr.field ? attr.field : k);
                    let x;
                    if (v == null) {
                        x = 'null';
                    }
                    else if (v === '') {
                        x = `''`;
                    }
                    else if (typeof v === 'number') {
                        x = toString(v);
                    }
                    else if (typeof v === 'boolean') {
                        if (attr.true === undefined) {
                            if (v === true) {
                                x = `true`;
                            }
                            else {
                                x = `false`;
                            }
                        }
                        else {
                            x = buildParam(i++);
                            if (v === true) {
                                const v2 = (attr.true ? attr.true : '1');
                                args.push(v2);
                            }
                            else {
                                const v2 = (attr.false ? attr.false : '0');
                                args.push(v2);
                            }
                        }
                    }
                    else {
                        x = buildParam(i++);
                        args.push(v);
                    }
                    colSet.push(`${field}=${x}`);
                }
            }
        }
        const fks = [];
        for (const pk of pks) {
            const field = (pk.field ? pk.field : pk.name);
            fks.push(field);
        }
        if (colSet.length === 0) {
            const q = `insert into ${table}(${cols.join(',')})values(${values.join(',')}) on conflict(${fks.join(',')}) do nothing`;
            return { query: q, params: args };
        }
        else {
            const q = `insert into ${table}(${cols.join(',')})values(${values.join(',')}) on conflict(${fks.join(',')}) do update set ${colSet.join(',')}`;
            return { query: q, params: args };
        }
    }
}
exports.buildToSave = buildToSave;
function buildToSaveBatch(objs, table, attrs, ver, buildParam) {
    if (!buildParam) {
        buildParam = param;
    }
    const sts = [];
    const meta = metadata(attrs);
    const pks = meta.keys;
    if (!pks || pks.length === 0) {
        return null;
    }
    const ks = Object.keys(attrs);
    for (const obj of objs) {
        let i = 1;
        const cols = [];
        const values = [];
        const args = [];
        let isVersion = false;
        for (const k of ks) {
            const attr = attrs[k];
            let v = obj[k];
            if (v === undefined || v == null) {
                v = attr.default;
            }
            if (v != null && v !== undefined && !attr.ignored && !attr.noinsert) {
                const field = (attr.field ? attr.field : k);
                cols.push(field);
                if (k === ver) {
                    isVersion = true;
                    values.push(`${1}`);
                }
                else {
                    if (v === '') {
                        values.push(`''`);
                    }
                    else if (typeof v === 'number') {
                        values.push(toString(v));
                    }
                    else if (typeof v === 'boolean') {
                        if (attr.true === undefined) {
                            if (v === true) {
                                values.push(`true`);
                            }
                            else {
                                values.push(`false`);
                            }
                        }
                        else {
                            const p = buildParam(i++);
                            values.push(p);
                            if (v === true) {
                                const v2 = (attr.true ? attr.true : '1');
                                args.push(v2);
                            }
                            else {
                                const v2 = (attr.false ? attr.false : '0');
                                args.push(v2);
                            }
                        }
                    }
                    else {
                        const p = buildParam(i++);
                        values.push(p);
                        args.push(v);
                    }
                }
            }
        }
        if (!isVersion && ver && ver.length > 0) {
            const attr = attrs[ver];
            const field = (attr.field ? attr.field : ver);
            cols.push(field);
            values.push(`${1}`);
        }
        const colSet = [];
        for (const k of ks) {
            const v = obj[k];
            if (v !== undefined) {
                const attr = attrs[k];
                if (attr && !attr.key && !attr.ignored && k !== ver && !attr.noupdate) {
                    const field = (attr.field ? attr.field : k);
                    let x;
                    if (v == null) {
                        x = 'null';
                    }
                    else if (v === '') {
                        x = `''`;
                    }
                    else if (typeof v === 'number') {
                        x = toString(v);
                    }
                    else if (typeof v === 'boolean') {
                        if (attr.true === undefined) {
                            if (v === true) {
                                x = `true`;
                            }
                            else {
                                x = `false`;
                            }
                        }
                        else {
                            x = buildParam(i++);
                            if (v === true) {
                                const v2 = (attr.true ? attr.true : '1');
                                args.push(v2);
                            }
                            else {
                                const v2 = (attr.false ? attr.false : '0');
                                args.push(v2);
                            }
                        }
                    }
                    else {
                        x = buildParam(i++);
                        args.push(v);
                    }
                    colSet.push(`${field}=${x}`);
                }
            }
        }
        const fks = [];
        for (const pk of pks) {
            const field = (pk.field ? pk.field : pk.name);
            fks.push(field);
        }
        if (colSet.length === 0) {
            const q = `insert into ${table}(${cols.join(',')})values(${values.join(',')}) on conflict(${fks.join(',')}) do nothing`;
            const smt = { query: q, params: args };
            sts.push(smt);
        }
        else {
            const q = `insert into ${table}(${cols.join(',')})values(${values.join(',')}) on conflict(${fks.join(',')}) do update set ${colSet.join(',')}`;
            const smt = { query: q, params: args };
            sts.push(smt);
        }
    }
    return sts;
}
exports.buildToSaveBatch = buildToSaveBatch;
const n = 'NaN';
function toString(v) {
    let x = '' + v;
    if (x === n) {
        x = 'null';
    }
    return x;
}
exports.toString = toString;
//# sourceMappingURL=build.js.map