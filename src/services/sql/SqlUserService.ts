import {Pool} from 'pg';
import {User} from '../../models/User';
import {exec, query, queryOne, StringMap} from './postgresql';

export const dateMap: StringMap = {
  date_of_birth: 'dateOfBirth',
};
export class SqlUserService {
  constructor(private pool: Pool) {
  }
  all(): Promise<User[]> {
    return query<User>(this.pool, 'select * from users order by id asc', undefined, dateMap);
  }
  load(id: string): Promise<User> {
    return queryOne(this.pool, 'select * from users where id = $1', [id], dateMap);
  }
  insert(user: User): Promise<number> {
    return exec(this.pool, `insert into users (id, username, email, phone, date_of_birth) values ($1, $2, $3, $4, $5)`,
     [user.id, user.username, user.email, user.phone, user.dateOfBirth]);
  }
  update(user: User): Promise<number> {
    return exec(this.pool, `update users set username=$2, email=$3, phone=$4, date_of_birth= $5 where id = $1`,
     [user.id, user.username, user.email, user.phone, user.dateOfBirth]);
  }
  delete(id: string): Promise<number> {
    return exec(this.pool, `delete from users where id = $1`, [id]);
  }
}
