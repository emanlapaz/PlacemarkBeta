import { Placemark } from "./placemark.js";
import { pointMongoStore } from "./point-mongo-store.js";

export const placemarkMongoStore = {
  async getAllPlacemarks() {
    console.log("Getting all placemarks...");
    const placemarks = await Placemark.find().lean();
    console.log("Placemarks retrieved:", placemarks);
    return placemarks;
  },

  async getPlacemarkById(id) {
    console.log("Getting placemark by ID:", id);
    if (id) {
      const placemark = await Placemark.findOne({ _id: id }).lean();
      console.log("Placemark retrieved:", placemark);
      if (placemark) {
        placemark.points = await pointMongoStore.getPointsByPlacemarkId(placemark._id);
        console.log("Placemark points retrieved:", placemark.points);
      }
      return placemark;
    }
    return null;
  },

  async addPlacemark(placemark) {
    console.log("Adding placemark:", placemark);
    const newPlacemark = new Placemark(placemark);
    const placemarkObj = await newPlacemark.save();
    console.log("New placemark added:", placemarkObj);
    return this.getPlacemarkById(placemarkObj._id);
  },

  async getUserPlacemarks(id) {
    console.log("Getting user placemarks for user ID:", id);
    const placemark = await Placemark.find({ userid: id }).lean();
    console.log("User placemarks retrieved:", placemark);
    return placemark;
  },

  async deletePlacemarkById(id) {
    console.log("Deleting placemark by ID:", id);
    try {
      await Placemark.deleteOne({ _id: id });
      console.log("Placemark deleted");
    } catch (error) {
      console.log("Failed to delete placemark with ID:", id);
    }
  },

  async deleteAllPlacemarks() {
    console.log("Deleting all placemarks...");
    await Placemark.deleteMany({});
    console.log("All placemarks deleted");
  },

  async updatePlacemark(updatedPlacemark) {
    const placemark = await Placemark.findOne({ _id: updatedPlacemark._id });
    placemark.placeMark = updatedPlacemark.placeMark;
    placemark.lat = updatedPlacemark.lat;
    placemark.long = updatedPlacemark.long;
    placemark.img = updatedPlacemark.img;
    await placemark.save();
  },
};
