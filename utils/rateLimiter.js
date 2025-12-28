// utils/rateLimiter.js
// Global Rate Limiter for WhatsApp Bot - Prevents rate-overlimit errors

class RateLimiter {
  constructor() {
    this.queue = [];
    this.isProcessing = false;
    this.minDelay = 200; // Reduced delay to 200ms for faster message delivery
    this.lastSendTime = 0; // Track last send time
  }

  enqueue(task) {
    this.queue.push(task);
    this.processQueue();
  }

  async processQueue() {
    if (this.isProcessing || this.queue.length === 0) return;

    this.isProcessing = true;
    const task = this.queue.shift();

    try {
      // Only delay if we sent a message recently (within minDelay)
      const timeSinceLastSend = Date.now() - this.lastSendTime;
      if (timeSinceLastSend < this.minDelay) {
        await new Promise(resolve => setTimeout(resolve, this.minDelay - timeSinceLastSend));
      }
      
      await task();
      this.lastSendTime = Date.now();
    } catch (error) {
      console.error('[RateLimiter] Task failed:', error);
      this.lastSendTime = Date.now();
    }

    this.isProcessing = false;
    // Process next item immediately if queue has items
    setImmediate(() => this.processQueue());
  }
}

const rateLimiter = new RateLimiter();

const safeSend = (conn, jid, message, options) => {
  return new Promise((resolve, reject) => {
    rateLimiter.enqueue(async () => {
      try {
        const result = await conn.sendMessage(jid, message, options);
        resolve(result);
      } catch (error) {
        reject(error);
      }
    });
  });
};

const safeReply = (conn, jid, text, quoted) => {
  return safeSend(conn, jid, { text }, { quoted });
};

const safeReact = (emoji, m, conn) => {
  return safeSend(conn, m.key.remoteJid, { react: { text: emoji, key: m.key } });
};

const getRateLimiter = () => rateLimiter;

module.exports = { safeSend, safeReply, safeReact, getRateLimiter };