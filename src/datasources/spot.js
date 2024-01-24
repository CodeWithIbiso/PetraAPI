import { MongoDataSource } from "apollo-datasource-mongodb";

export default class Spots extends MongoDataSource {
  async getSpots() {
    return await this.model.find();
  }
  async createSpot(newSpot) {
    return await this.model.create(newSpot);
  }
  async updateSpot(spot) {
    let update = { ...spot };
    delete update.id;
    const updatedSpot = await this.model.findOneAndUpdate(
      { _id: spot.id, owner: spot.creator },
      { $set: update },
      { new: true }
    );
    return updatedSpot;
  }
  async getUserSpots(creator) {
    return await this.model.find(creator);
  }
  async deleteSpots(filter) {
    return await this.model.deleteMany(filter);
  }
  async getPopularSpots() {
    return await this.model.find().sort({ _id: -1, viewsCount: -1 }).limit(10);
  }
}
