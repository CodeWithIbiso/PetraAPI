import { MongoDataSource } from "apollo-datasource-mongodb";
import { RESTDataSource } from '@apollo/datasource-rest';

console.log({MongoDataSource})

export default class Spot extends RESTDataSource {
  constructor(props) {
    super(); // Call the constructor of the parent class
    this.props = props; // Store the props as an instance variable

    // Log the props immediately upon creating an instance
    console.log(this.props);
  }
  async getSpots() {
    return await this.model.find();
  }
}
