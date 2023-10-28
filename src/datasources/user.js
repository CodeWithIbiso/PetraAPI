import { MongoDataSource } from "apollo-datasource-mongodb";

export default class Users extends MongoDataSource {
  async getUsers() {
    return await this.model.find();
  }
  async getUserByParams(query) {
    return await this.model.findOne(query);
  }
  async addUser(newUser) {
    const user = new this.model(newUser);
    await user.save();
    return user;
  }
  async updateUser(user) {
    const update = {
      ...user,
    };
    delete update?._id;
    const newUser = await this.model.findOneAndUpdate(
      { _id: user?._id },
      { $set: update },
      { returnOriginal: false }
    );
    return newUser;
  }
}
