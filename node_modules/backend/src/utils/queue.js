// Mock queue for development without Redis
class MockQueue {
  async add(jobName, data) {
    console.log(`Mock queue: Adding job ${jobName} with data:`, data);
    // In a real implementation, this would process the job
    // For now, just log that the job was added
    return { id: Date.now(), data };
  }
}

const ocrQueue = new MockQueue();
const redis = null; // No Redis connection

module.exports = { ocrQueue, redis };