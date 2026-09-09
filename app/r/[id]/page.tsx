import type { Metadata } from "next";
import { AppShell } from "@/components/app-shell";
import { RoomExperience } from "@/components/room-experience";
import { SiteHeader } from "@/components/site-header";
import { getStore } from "@/lib/store";
import { toPublicRoom } from "@/lib/engine";

export const dynamic = "force-dynamic";

type PageProps = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ host?: string }>;
};

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { id } = await params;
  const room = await getStore().get(id);
  if (!room) {
    return { title: "없는 방" };
  }
  const publicRoom = toPublicRoom(room, Date.now());
  const cancelled = publicRoom.status === "cancelled";
  return {
    title: cancelled ? `${room.name} 파기 확정` : room.name,
    description: cancelled
      ? "모두가 가기 싫어했습니다. 상처 없이 약속이 취소됐어요."
      : "가기 싫으면 누르세요. 전원이 눌러야만 취소됩니다.",
  };
}

export default async function RoomPage({ params, searchParams }: PageProps) {
  const [{ id }, query] = await Promise.all([params, searchParams]);
  return (
    <AppShell>
      <SiteHeader />
      <RoomExperience roomId={id} isHost={query.host === "1"} />
    </AppShell>
  );
}
