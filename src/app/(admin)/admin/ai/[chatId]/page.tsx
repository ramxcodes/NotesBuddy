import { Suspense } from "react";
import { notFound } from "next/navigation";
import AdminChatDetailView from "@/components/admin/ai/AdminChatDetailView";
import { getAdminChatDetailsAction } from "@/components/admin/actions/admin-ai";

interface AdminChatDetailPageProps {
  params: Promise<{
    chatId: string;
  }>;
}

export default async function AdminChatDetailPage({
  params,
}: AdminChatDetailPageProps) {
  const { chatId } = await params;
  const result = await getAdminChatDetailsAction(chatId);

  if (!result.success || !result.data) {
    notFound();
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Suspense fallback={<div>Loading chat details...</div>}>
        <AdminChatDetailView chat={result.data} />
      </Suspense>
    </div>
  );
}

export async function generateMetadata({ params }: AdminChatDetailPageProps) {
  const { chatId } = await params;
  const result = await getAdminChatDetailsAction(chatId);

  if (!result.success || !result.data) {
    return {
      title: "Chat Not Found - Admin",
      description: "The requested chat could not be found.",
    };
  }

  return {
    title: `${result.data.name} - AI Chat Details`,
    description: `Chat details for ${result.data.name} by ${result.data.user.name}`,
  };
}
