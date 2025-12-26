// utils/rateLimiter.js
// Global Rate Limiter for WhatsApp Bot - Prevents rate-overlimit errors

class RateLimiter {
  constructor() {
    this.queue = [];
    this.isProcessing = false;
    this.minDelay = 1500; // Default delay of 1.5 seconds
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
      await task();
    } catch (error) {
      console.error('[RateLimiter] Task failed:', error);
    }

    setTimeout(() => {
      this.isProcessing = false;
      this.processQueue();
    }, this.minDelay);
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