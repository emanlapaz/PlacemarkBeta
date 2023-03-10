import { Point } from "./point.js";

export const pointMongoStore = {
  async getAllPoints() {
    const points = await Point.find().lean();
    return points;
  },

  async addPoint(placemarkId, point) {
    point.placemarktid = placemarkId;
    const newPoint = new Point(point);
    const pointObj = await newPoint.save();
    return this.getPointById(pointObj._id);
  },

  async getPointsByPlacemarkId(id) {
    const points = await Point.find({ placemarkid: id }).lean();
    return points;
  },

  async getPointById(id) {
    if (id) {
      const point = await Point.findOne({ _id: id }).lean();
      return point;
    }
    return null;
  },

  async deletePoint(id) {
    try {
      await Point.deleteOne({ _id: id });
    } catch (error) {
      console.log("bad id");
    }
  },

  async deleteAllPoints() {
    await Point.deleteMany({});
  },

  async updatePoint(point, updatedPoint) {
    point.pointName = updatedPoint.pointName;
    point.category = updatedPoint.category;
    track.location = updatedPoint.location;
    await point.save();
  },
};