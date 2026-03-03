"use client";

import { useMemo, useState } from "react";

import Can from "@/components/shared/Can";
import InviteModal from "@/components/members/InviteModal";
import MemberList from "@/components/members/MemberList";
import { useMembers, useInviteMemberMutation } from "@/lib/hooks/useMembers";
import { useAuthStore } from "@/lib/stores/auth.store";
import { handleApiError } from "@/lib/utils/errors";

export default function MembersView() {
  const [inviteOpen, setInviteOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const orgId = useAuthStore((state) => state.org?.id);
  const currentUserId = useAuthStore((state) => state.user?.id);

  const membersQuery = useMembers(orgId);
  const inviteMutation = useInviteMemberMutation(orgId);

  const sortedMembers = useMemo(() => {
    const items = membersQuery.data ?? [];
    return [...items].sort((a, b) => {
      if (a.role !== b.role) {
        return a.role === "Admin" ? -1 : 1;
      }
      return a.name.localeCompare(b.name);
    });
  }, [membersQuery.data]);

  const handleInvite = async ({ email }: { email: string }) => {
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      await inviteMutation.mutateAsync({ email });
      setSuccessMessage(`Invite sent to ${email}`);
      setInviteOpen(false);
    } catch (error: unknown) {
      setErrorMessage(handleApiError(error));
    }
  };

  return (
    <section className="space-y-4">
      <header className="flex items-center justify-between gap-3">
        <div>
          <h2 className="text-2xl font-semibold text-zinc-900">Members</h2>
          <p className="text-sm text-zinc-600">
            Manage your organization users and access.
          </p>
        </div>

        <Can role="Admin">
          <button
            type="button"
            onClick={() => setInviteOpen(true)}
            className="rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800"
          >
            Invite Member
          </button>
        </Can>
      </header>

      {successMessage ? (
        <section className="rounded-lg border border-emerald-200 bg-emerald-50 p-3">
          <p className="text-sm text-emerald-800">{successMessage}</p>
        </section>
      ) : null}

      {errorMessage ? (
        <section className="rounded-lg border border-red-200 bg-red-50 p-3">
          <p className="text-sm text-red-700">{errorMessage}</p>
        </section>
      ) : null}

      {membersQuery.isLoading ? (
        <section className="rounded-lg border border-zinc-200 bg-white p-4">
          <p className="text-sm text-zinc-600">Loading members...</p>
        </section>
      ) : membersQuery.isError ? (
        <section className="rounded-lg border border-red-200 bg-red-50 p-4">
          <p className="text-sm text-red-700">
            Failed to load members. Please refresh and try again.
          </p>
        </section>
      ) : (
        <MemberList members={sortedMembers} currentUserId={currentUserId} />
      )}

      {inviteOpen ? (
        <InviteModal
          onClose={() => setInviteOpen(false)}
          onSubmit={handleInvite}
        />
      ) : null}
    </section>
  );
}
