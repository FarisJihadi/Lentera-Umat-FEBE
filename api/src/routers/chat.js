const express = require("express");
const router = express.Router();
const chatController = require("../controllers/chatController");
router.post("/", chatController.createChatSession);
router.get("/user/:userId", chatController.getChatSessionsByUser);
router.get("/:sessionId", chatController.getChatSessionById);
router.put("/:sessionId/message", chatController.addMessageToSession);
router.delete("/:sessionId", chatController.deleteChatSession);

module.exports = router;
