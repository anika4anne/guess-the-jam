export const config = {
  webhook: {
    secret:
      process.env.WEBHOOK_SECRET ||
      "your-super-secret-webhook-key-change-this-in-production",
  },

  isDevelopment: process.env.NODE_ENV === "development",
};
