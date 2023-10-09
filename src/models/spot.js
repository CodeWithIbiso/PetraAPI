import mongoose from "mongoose";

export default mongoose.model("spot", {
  title: String,
  creator: mongoose.Schema.Types.ObjectId,
  publicKey: String,
  contactNumber: String,
  location: {
    name: String,
    latitude: Number,
    longitude: Number,
  },
  category: String,
  about: String,
  description: String,
  categories: [
    {
      name: String,
      image: String,
    },
  ],
  popularCategories: [
    {
      name: String,
      image: String,
      price: String,
      currency: String,
    },
  ],
  image: String,
  video: String,
  rating: Number,
  likes: [String],
  likesCount: Number,
  views: [String],
  viewsCount: Number,
});
