import { MongoMemoryServer } from "mongodb-memory-server";
import mongoose from "mongoose";

let mongod: MongoMemoryServer;

export const connect = async () => {
    // Don't create a new connection if one already exists
    if (mongoose.connection.readyState !== 0) return;
    mongod = await MongoMemoryServer.create();
    process.env.MONGODB_URI = mongod.getUri();
    await mongoose.connect(mongod.getUri());
};

export const disconnect = async () => {
    if (mongoose.connection.readyState === 0) return;
    await mongoose.connection.dropDatabase();
    await mongoose.connection.close();
    await mongod.stop();
};

export const clearCollections = async () => {
    if (mongoose.connection.readyState === 0) return;
    const collections = mongoose.connection.collections;
    for (const key in collections) {
        await collections[key].deleteMany({});
    }
};
