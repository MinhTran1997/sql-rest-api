"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SqlUserService = exports.dateMap = void 0;
const postgresql_1 = require("./postgresql");
exports.dateMap = {
    date_of_birth: 'dateOfBirth',
};
class SqlUserService {
    constructor(pool) {
        this.pool = pool;
    }
    all() {
        return postgresql_1.query(this.pool, 'select * from userstest order by id asc', undefined, exports.dateMap);
    }
    load(id) {
        return postgresql_1.queryOne(this.pool, 'select * from userstest where id = $1', [id], exports.dateMap);
    }
    insert(user) {
        return postgresql_1.exec(this.pool, `insert into userstest (id, username, email, phone, date_of_birth) values ($1, $2, $3, $4, $5)`, [user.id, user.username, user.email, user.phone, user.dateOfBirth]);
    }
    update(user) {
        return postgresql_1.exec(this.pool, `update userstest set username=$2, email=$3, phone=$4, date_of_birth= $5 where id = $1`, [user.id, user.username, user.email, user.phone, user.dateOfBirth]);
    }
    delete(id) {
        return postgresql_1.exec(this.pool, `delete from userstest where id = $1`, [id]);
    }
    transaction(users) {
        const statements = users.map((item) => {
            return { query: `insert into userstest (id, username, email) values ($1, $2, $3)`, params: [item.id, item.username, item.email] };
        });
        return postgresql_1.execBatch(this.pool, statements, true);
    }
}
exports.SqlUserService = SqlUserService;
//# sourceMappingURL=SqlUserService.js.map