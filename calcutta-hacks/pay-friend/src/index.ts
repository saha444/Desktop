import { Hono } from "hono";
import { callTool } from "./agent";

const app = new Hono();

app.post("/start", async (c) => {
  const { prompt } = await c.req.json();
  try {
    if (!prompt) {
      return c.json({
        data: "Prompt is required",
        success: false,
      });
    }

    const { content } = await callTool(prompt);

    if (content) {
      return c.json({
        data: content,
        success: true,
      });
    }
  } catch (err: any) {
    return c.json({
      success: false,
      data: {
        message: "Error Occurred",
        err: err,
      },
    });
  }
});

export default {
  port: 3000,
  fetch: app.fetch,
};