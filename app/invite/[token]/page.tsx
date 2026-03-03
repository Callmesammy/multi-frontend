import InviteAcceptView from "@/components/members/InviteAcceptView";

interface InvitePageProps {
  params: Promise<{ token: string }>;
}

export default async function InvitePage({ params }: InvitePageProps) {
  const { token } = await params;
  return <InviteAcceptView token={token} />;
}
