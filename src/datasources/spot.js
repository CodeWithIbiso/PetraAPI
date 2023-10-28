import { MongoDataSource } from "apollo-datasource-mongodb";

export default class Spots extends MongoDataSource {
  async getSpots() {
    return await this.model.find();
  }
}
