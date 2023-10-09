import { MongoDataSource } from "apollo-datasource-mongodb";

export default class spot extends MongoDataSource {
  async getSpots() {
    return await this.model.find();
  }
}
