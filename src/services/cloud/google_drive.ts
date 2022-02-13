import { json } from "body-parser";
import fs from "fs";
// file system

import { google } from "googleapis";

type PartialDriveFile = {
  id: string;
  name: string;
};

export interface StorageService {
  upload(
    directory: string,
    name: string,
    data: string | Buffer
  ): Promise<string>;
  delete(directory: string, name: string): Promise<boolean>;
}

export class GoogleDriveService implements StorageService {
  private driveClient;

  public constructor(
    clientId: string,
    clientSecret: string,
    redirectUri: string,
    refreshToken: string
  ) {
    // this.driveClient = this.createDriveClient(clientId, clientSecret, redirectUri, refreshToken);
    this.upload = this.upload.bind(this);
    this.delete = this.delete.bind(this);
  }

  // createDriveClient(clientId: string, clientSecret: string, redirectUri: string, refreshToken: string): google.drive_v3.Drive {
  //   const client = new google.auth.OAuth2(clientId, clientSecret, redirectUri);
  //   client.setCredentials({ refresh_token: refreshToken });
  //   return google.drive({
  //     version: 'v3',
  //     auth: client,
  //   });
  // }

  upload(directory: string, name: string, data: string | Buffer): Promise<string> {
    // create drive client
    const client = new google.auth.OAuth2(
      process.env.GOOGLE_DRIVE_CLIENT_ID,
      process.env.GOOGLE_DRIVE_CLIENT_SECRET,
      process.env.GOOGLE_DRIVE_REDIRECT_URI
    );
    client.setCredentials({
      refresh_token:
      process.env.GOOGLE_DRIVE_REFRESH_TOKEN,
    });
    const drive = google.drive({
      version: "v3",
      auth: client,
    });

    // create buffer stream
    let stream = require("stream");
    let bufferStream = new stream.PassThrough();
    bufferStream.end(data);

    // get file type
    var mime = require("mime-types");
    var contentType = mime.lookup(name);

    return drive.files.create({
          requestBody: {
            name: name,
            mimeType: contentType,
            description: 'upload with nodejs server',
          },
          media: {
            mimeType: contentType,
            body: bufferStream,
          },
      }).then(r => {
        return drive.files.get({
            fileId: r.data.id,
            fields: 'webViewLink',
          }).then(r => JSON.stringify(r.data.webViewLink))
      })

    // => JSON.stringify("https://drive.google.com/file/d/"+ r.data.id +"/view?usp=sharing")
    // // change file permisions to public.
    // this.driveClient.permissions.create({
    //     fileId: fileId,
    //     requestBody: {
    //     role: 'reader',
    //     type: 'anyone',
    //   },
    // });
  }

  delete(directory: string, name: string): Promise<boolean> {
    const client = new google.auth.OAuth2(
      process.env.GOOGLE_DRIVE_CLIENT_ID,
      process.env.GOOGLE_DRIVE_CLIENT_SECRET,
      process.env.GOOGLE_DRIVE_REDIRECT_URI
    );
    client.setCredentials({
      refresh_token:
      process.env.GOOGLE_DRIVE_REFRESH_TOKEN,
    });
    
    const drive = google.drive({
      version: "v3",
      auth: client,
    });

    return drive.files.list({
      q: `name = "${name}" and mimeType != 'application/vnd.google-apps.folder' and trashed = false`,
    }).then(r => {
      return drive.files.delete({
          fileId: r.data.files[0].id,
      }).then(() => {
        return true
      }).catch((err) => {
        return false
      })
    })
  }
}
