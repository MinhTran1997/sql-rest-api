"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.GoogleDriveService = void 0;
const fs_1 = __importDefault(require("fs"));
// file system
const { google } = require('googleapis');
class GoogleDriveService {
    constructor(clientId, clientSecret, redirectUri, refreshToken) {
        this.driveClient = this.createDriveClient(clientId, clientSecret, redirectUri, refreshToken);
        this.upload = this.upload.bind(this);
        this.delete = this.delete.bind(this);
    }
    createDriveClient(clientId, clientSecret, redirectUri, refreshToken) {
        const client = new google.auth.OAuth2(clientId, clientSecret, redirectUri);
        client.setCredentials({ refresh_token: refreshToken });
        return google.drive({
            version: 'v3',
            auth: client,
        });
    }
    createFolder(folderName) {
        return this.driveClient.files.create({
            resource: {
                name: folderName,
                mimeType: 'application/vnd.google-apps.folder',
            },
            fields: 'id, name',
        });
    }
    upload(directory, name, data) {
        const file = this.driveClient.files.create({
            requestBody: {
                name: name,
                mimeType: "image/jpeg",
            },
            media: {
                mimeType: "image/jpeg",
                body: fs_1.default.createReadStream(data),
            },
        });
        const fileId = file.Id;
        //change file permisions to public.
        this.driveClient.permissions.create({
            fileId: fileId,
            requestBody: {
                role: 'reader',
                type: 'anyone',
            },
        });
        //get webview link
        const result = this.driveClient.files.get({
            fileId: fileId,
            fields: 'webViewLink',
        });
        return result.WebViewLink;
    }
    ;
    delete(directory, name) {
        const list = this.driveClient.files.list({
            q: `name = ${name} and mimeType != 'application/vnd.google-apps.folder' and trashed = false`
        });
        const fileId = list.Files[0].Id;
        return this.driveClient.files.delete({
            requestBody: {
                fileId: fileId,
            },
        });
    }
}
exports.GoogleDriveService = GoogleDriveService;
//# sourceMappingURL=google_drive.js.map