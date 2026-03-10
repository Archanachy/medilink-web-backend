import mongoose from 'mongoose';

// Global test database URI for integration tests
export const TEST_MONGODB_URI = process.env.TEST_MONGODB_URI || 'mongodb://localhost:27017/medilink_test';

// Helper function for integration tests that need database connection
export const connectToTestDB = async () => {
    if (mongoose.connection.readyState === 0) {
        try {
            await mongoose.connect(TEST_MONGODB_URI, {
                serverSelectionTimeoutMS: 10000,
                connectTimeoutMS: 10000,
                socketTimeoutMS: 45000,
            });
            console.log('Connected to test database');
        } catch (error) {
            console.warn('Warning: Could not connect to MongoDB:', error);
            throw error;
        }
    }
};

export const disconnectFromTestDB = async () => {
    if (mongoose.connection.readyState === 1) {
        try {
            await mongoose.connection.dropDatabase();
            await mongoose.connection.close();
            console.log('Test database cleaned and connection closed');
        } catch (error) {
            console.warn('Could not cleanup database:', error);
        }
    }
};

// Set global timeout for all tests
jest.setTimeout(60000);
