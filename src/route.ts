import {Application} from 'express';
import multer from 'multer';
import {ApplicationContext} from './context';

export function route(app: Application, ctx: ApplicationContext): void {
  const upload = multer();  
  const user = ctx.userController;
  app.get('/health', user.healthcheck)

  app.get('/users', user.all);
  app.get('/users/:id', user.load);
  app.post('/users', user.insert);
  app.put('/users/:id', user.update);
  app.delete('/users/:id', user.delete);
  app.post('/transactions', user.insertMany);

  app.post('/upload', upload.single('file'), user.uploadFile);
  app.delete('/delete/:name', user.deleteFile);
}
