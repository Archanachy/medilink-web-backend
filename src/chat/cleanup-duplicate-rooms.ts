import mongoose from 'mongoose';
import { ChatRoomModel, ChatMessageModel } from './chat.model';
import dotenv from 'dotenv';

dotenv.config();

/**
 * CLEANUP SCRIPT: Remove duplicate chat rooms
 * 
 * This script finds and removes duplicate chat rooms where the same 2 participants
 * have multiple rooms. It keeps the oldest room and migrates messages from newer rooms.
 */
async function cleanupDuplicateRooms() {
  try {
    // Connect to MongoDB
    const mongoUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/medilink';
    await mongoose.connect(mongoUri);
    console.log('Connected to MongoDB');

    // Find all rooms
    const allRooms = await ChatRoomModel.find({}).sort({ created_at: 1 });
    console.log(`Total rooms found: ${allRooms.length}`);

    // Group rooms by participants (sorted)
    const roomsByParticipants = new Map<string, typeof allRooms>();
    
    for (const room of allRooms) {
      const sortedParticipants = [...room.participants]
        .map(p => p.toString())
        .sort()
        .join(',');
      
      if (!roomsByParticipants.has(sortedParticipants)) {
        roomsByParticipants.set(sortedParticipants, []);
      }
      roomsByParticipants.get(sortedParticipants)!.push(room);
    }

    // Find duplicates
    let duplicateCount = 0;
    let messagesUpdated = 0;
    let roomsDeleted = 0;

    for (const [participants, rooms] of roomsByParticipants.entries()) {
      if (rooms.length > 1) {
        duplicateCount++;
        console.log(`\n🔍 Found ${rooms.length} duplicate rooms for participants: ${participants}`);
        
        // Keep the oldest room (first in sorted array)
        const keepRoom = rooms[0];
        const duplicateRooms = rooms.slice(1);
        
        console.log(`  Keeping room: ${keepRoom._id} (created: ${keepRoom.created_at})`);
        
        // Migrate messages from duplicate rooms to the kept room
        for (const dupRoom of duplicateRooms) {
          console.log(`  Removing duplicate room: ${dupRoom._id}`);
          
          // Update messages to point to the kept room
          const updateResult = await ChatMessageModel.updateMany(
            { roomId: dupRoom._id },
            { $set: { roomId: keepRoom._id } }
          );
          
          console.log(`    Migrated ${updateResult.modifiedCount} messages`);
          messagesUpdated += updateResult.modifiedCount;
          
          // Delete the duplicate room
          await ChatRoomModel.deleteOne({ _id: dupRoom._id });
          roomsDeleted++;
        }
      }
    }

    console.log('\n CLEANUP SUMMARY:');
    console.log(`  - Duplicate room groups found: ${duplicateCount}`);
    console.log(`  - Rooms deleted: ${roomsDeleted}`);
    console.log(`  - Messages migrated: ${messagesUpdated}`);
    console.log(`  - Unique rooms remaining: ${roomsByParticipants.size}`);

    // Verify no duplicates remain
    const remainingRooms = await ChatRoomModel.find({});
    const uniqueParticipantSets = new Set(
      remainingRooms.map(r => 
        [...r.participants].map(p => p.toString()).sort().join(',')
      )
    );
    
    if (uniqueParticipantSets.size === remainingRooms.length) {
      console.log('\n SUCCESS: No duplicate rooms remain!');
    } else {
      console.log('\n WARNING: Some duplicates may still exist');
    }

  } catch (error) {
    console.error(' Error during cleanup:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\n Disconnected from MongoDB');
  }
}

// Run the cleanup
cleanupDuplicateRooms();