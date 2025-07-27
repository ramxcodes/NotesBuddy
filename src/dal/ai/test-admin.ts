// Simple test to verify the AI admin functionality
// This can be run to test the basic DAL operations

import {
  getAdminChats,
  getAdminChatStats,
  getChatSubjects,
} from "@/dal/ai/admin-query";

export async function testAIAdminFunctionality() {
  try {
    console.log("Testing AI Admin functionality...");

    // Test getting chats with basic filters
    const chatsResult = await getAdminChats({
      page: 1,
      limit: 10,
    });
    console.log(
      "✅ getAdminChats working:",
      chatsResult.totalCount,
      "total chats",
    );

    // Test getting stats
    const statsResult = await getAdminChatStats();
    console.log("✅ getAdminChatStats working:", {
      totalChats: statsResult.totalChats,
      totalMessages: statsResult.totalMessages,
      totalUsers: statsResult.totalUsers,
    });

    // Test getting subjects
    const subjects = await getChatSubjects();
    console.log(
      "✅ getChatSubjects working:",
      subjects.length,
      "subjects found",
    );

    console.log("🎉 All AI Admin functions working correctly!");
    return true;
  } catch (error) {
    console.error("❌ Error testing AI Admin functionality:", error);
    return false;
  }
}

// Usage: Call this function from a server component or API route to test
// testAIAdminFunctionality().then(console.log);
