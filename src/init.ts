import {Pool} from 'pg';
import {ApplicationContext} from './context';
import {UserController} from './controllers/UserController';
// import {SqlUserService} from './services/sql/SqlUserService';
import {ClientService} from './services/client/ClientService';
import { GoogleDriveService } from './services/cloud/google_drive';

export function createContext(pool: Pool, provider: string): ApplicationContext {
  var storageService
  if (provider == 'google-drive') {
    storageService = new GoogleDriveService(process.env.GOOGLE_DRIVE_CLIENT_ID, process.env.GOOGLE_DRIVE_CLIENT_SECRET, process.env.GOOGLE_DRIVE_REDIRECT_URI, process.env.GOOGLE_DRIVE_REFRESH_TOKEN);
  }
  // const userService = new SqlUserService(pool);
  const userService = new ClientService(process.env.SERVER_URL);
  
  const userController = new UserController(userService, storageService);
  const ctx: ApplicationContext = {userController};
  return ctx;
}
