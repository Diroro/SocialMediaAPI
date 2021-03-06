import { dbPool } from './databasePool';
import { IUser } from '../models/user';
import { ApiError } from '../models/errors';

class UserTable {
  public static async addUser(user: IUser): Promise<number> {
    try {
      const data = await dbPool.query(`
        INSERT INTO users(username, "passwordHash")
            VALUES( $[username], $[passwordHash])
            RETURNING id, username, name, description;
        `,
        { ...user });
      console.log('ADDING USER: ', data);
      return data[0];
    } catch (err) {
      // throw new DB ERROR
      throw new ApiError('Something went wrong');
    }
  }

  public static async getUserAuthDataByUsername(username: string): Promise<IUser> {
    try {
      const users = await dbPool.query(`
        SELECT id, "passwordHash", "sessionId" FROM users
        WHERE username = $1
      `,
        username
      );
      return !!users.length && users[0];
    } catch (err) {
      throw new ApiError('Something went wrong');
    }
  }

  public static async getUserById(id: string): Promise<IUser> {
    try {
      const users = await dbPool.query(`
        SELECT
          id,
          username,
          name,
          description,
        FROM users
        WHERE id  = $1
      `,
        id
      );
      return users[0];
    } catch (err) {
      throw new ApiError('Something went wrong');
    }
  }

  public static async getUsers(): Promise<IUser[]> {
    try {
      const users = await dbPool.query(`
        SELECT
          id,
          username,
          name,
          description,
        FROM users
      `);
      return users;
    } catch (err) {
      throw new ApiError('Something went wrong');
    }
  }

  public static async deleteUser(id: number): Promise<number> {
    try {
      await dbPool.result(`
      DELETE
      FROM users
      WHERE id = $[id]`,
        { id }
      );
      return id;
    } catch (err) {
      throw new ApiError('Something went wrong');
    }
  }

  public static async updateSessionId(data: { sessionId: string, username: string }) {
    const { sessionId, username } = data;
    try {
      await dbPool.query(`
        UPDATE users
        SET "sessionId" = $1
        WHERE username = $2`, [sessionId, username]);
    } catch (err) {
      throw new ApiError('Something went wrong');
    }
  }
}

export default UserTable;
