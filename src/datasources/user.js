import { MongoDataSource } from "apollo-datasource-mongodb";

export default class Users extends MongoDataSource {
  async getUsers() {
    return await this.model.find();
  }
}
