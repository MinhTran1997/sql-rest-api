import {User} from '../../models/User';

var Request = require("request");

export class ClientService {
  constructor(private url: string) {}

  healthcheck(): Promise<string> {
    var requestUrl = this.url + "/health"
    return Request.get(requestUrl, (error, response, body) => {
      if(error) {
        console.log(error)
        return error;
      }
      var result = JSON.stringify(body)
      console.log("result:", result)
      return result
    });
  }

  all(): Promise<User[]> {
    var requestUrl = this.url + "/users"
    return Request.get(requestUrl, (error, response, body) => {
      if(error) {
        console.log(error)
        return error;
      }
      var result = JSON.parse(body)
      console.log("result:", result)
      return result
    });
  }

  load(id: string): Promise<User> {
    var requestUrl = this.url + "/users/" + id
    return Request.get(requestUrl, (error, response, body) => {
      if(error) {
        console.log(error)
        return error;
      }
      var result = JSON.parse(body)
      console.log("result:", result)
      return result
    });
  }

  insert(user: User): Promise<number> {
    var requestUrl = this.url + "/users"
    return Request.post({
      "headers": { "content-type": "application/json" },
      "url": requestUrl,
      "body": JSON.stringify(user)
    }, (error, response, body) => {
      if(error) {
        console.log(error)
        return error;
      } 
      var result = JSON.parse(body)
      console.log("result:", result)
      return result.status
    });
  }

  update(user: User): Promise<number> {
    var requestUrl = this.url + "/users/" + user.id
    return Request.put({
      "headers": { "content-type": "application/json" },
      "url": requestUrl,
      "body": JSON.stringify(user)
    }, (error, response, body) => {
      if(error) {
        console.log(error)
        return error;
      } 
      var result = JSON.parse(body)
      console.log("result:", result)
      return result.status
    });
  }

  delete(id: string): Promise<number> {
    var requestUrl = this.url + "/users/" + id
    return Request.delete(requestUrl, (error, response, body) => {
      if(error) {
        console.log(error)
        return error;
      } 
      var result = JSON.parse(body)
      console.log("result:", result)
      return result
    });
  }

  transaction(users: User[]): Promise<number> {
    return
  }
}