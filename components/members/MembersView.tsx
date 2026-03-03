"use client";

import {
  Crown,
  MailPlus,
  Search,
  ShieldCheck,
  Sparkles,
  Users2,
} from "lucide-react";
import { useMemo, useState } from "react";

import Can from "@/components/shared/Can";
import InviteModal from "@/components/members/InviteModal";
import MemberList from "@/components/members/MemberList";
import { useMembers, useInviteMemberMutation } from "@/lib/hooks/useMembers";
import { useAuthStore } from "@/lib/stores/auth.store";
import { handleApiError } from "@/lib/utils/errors";

type RoleFilter = "All" | "Admin" | "Member";

export default function MembersView() {
  const [inviteOpen, setInviteOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState<RoleFilter>("All");

  const orgId = useAuthStore((state) => state.org?.id);
  const currentUserId = useAuthStore((state) => state.user?.id);
  const orgName = useAuthStore((state) => state.org?.name);
  const currentUserRole = useAuthStore((state) => state.user?.role);

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

  const filteredMembers = useMemo(() => {
    const normalizedQuery = searchQuery.trim().toLowerCase();

    return sortedMembers.filter((member) => {
      const roleMatch = roleFilter === "All" || member.role === roleFilter;
      if (!roleMatch) return false;
      if (!normalizedQuery) return true;

      return (
        member.name.toLowerCase().includes(normalizedQuery) ||
        member.email.toLowerCase().includes(normalizedQuery)
      );
    });
  }, [roleFilter, searchQuery, sortedMembers]);

  const stats = useMemo(() => {
    const total = sortedMembers.length;
    const admins = sortedMembers.filter((member) => member.role === "Admin").length;
    const members = sortedMembers.filter((member) => member.role === "Member").length;

    return { total, admins, members };
  }, [sortedMembers]);

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
    <section className="space-y-5">
      <header className="relative overflow-hidden rounded-3xl border border-zinc-300/50 bg-[linear-gradient(135deg,#0f172a_0%,#111827_50%,#0f766e_100%)] p-6 text-zinc-50 shadow-[0_20px_80px_rgba(15,23,42,0.34)] sm:p-8">
        <div className="pointer-events-none absolute -right-10 -top-12 h-44 w-44 rounded-full bg-emerald-400/25 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-10 left-16 h-40 w-40 rounded-full bg-cyan-300/20 blur-3xl" />

        <div className="relative flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-zinc-300">
              <Sparkles className="h-3.5 w-3.5" />
              Team Directory
            </p>
            <h2 className="mt-1 text-2xl font-semibold sm:text-3xl">
              Member Control Center
            </h2>
            <p className="mt-2 max-w-2xl text-sm text-zinc-200">
              {orgName ?? "Your organization"} has {stats.total} teammates connected.
              Keep access clean and invite collaborators faster.
            </p>
          </div>

          <Can role="Admin">
            <button
              type="button"
              onClick={() => setInviteOpen(true)}
              className="inline-flex items-center gap-2 rounded-xl border border-white/35 bg-white/15 px-4 py-2.5 text-sm font-medium text-white backdrop-blur transition hover:bg-white/25"
            >
              <MailPlus className="h-4 w-4" />
              Invite Member
            </button>
          </Can>
        </div>

        <div className="relative mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <article className="rounded-xl border border-white/25 bg-white/10 p-3.5">
            <p className="text-xs uppercase tracking-[0.14em] text-zinc-300">Total Members</p>
            <p className="mt-1 text-2xl font-semibold">{stats.total}</p>
            <p className="mt-1 inline-flex items-center gap-1 text-xs text-zinc-200">
              <Users2 className="h-3.5 w-3.5" />
              Workspace seats
            </p>
          </article>
          <article className="rounded-xl border border-white/25 bg-white/10 p-3.5">
            <p className="text-xs uppercase tracking-[0.14em] text-zinc-300">Admins</p>
            <p className="mt-1 text-2xl font-semibold">{stats.admins}</p>
            <p className="mt-1 inline-flex items-center gap-1 text-xs text-zinc-200">
              <Crown className="h-3.5 w-3.5" />
              Permission owners
            </p>
          </article>
          <article className="rounded-xl border border-white/25 bg-white/10 p-3.5">
            <p className="text-xs uppercase tracking-[0.14em] text-zinc-300">Members</p>
            <p className="mt-1 text-2xl font-semibold">{stats.members}</p>
            <p className="mt-1 inline-flex items-center gap-1 text-xs text-zinc-200">
              <Users2 className="h-3.5 w-3.5" />
              Active collaborators
            </p>
          </article>
          <article className="rounded-xl border border-white/25 bg-white/10 p-3.5">
            <p className="text-xs uppercase tracking-[0.14em] text-zinc-300">Your Role</p>
            <p className="mt-1 text-2xl font-semibold">{currentUserRole ?? "-"}</p>
            <p className="mt-1 inline-flex items-center gap-1 text-xs text-zinc-200">
              <ShieldCheck className="h-3.5 w-3.5" />
              Access profile
            </p>
          </article>
        </div>
      </header>

      <section className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm sm:p-5">
        <div className="grid gap-3 md:grid-cols-[1fr_180px]">
          <label className="space-y-1.5">
            <span className="text-xs font-medium uppercase tracking-[0.08em] text-zinc-500">
              Search Member
            </span>
            <span className="relative block">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
              <input
                type="text"
                placeholder="Name or email"
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                className="w-full rounded-xl border border-zinc-700 bg-zinc-900/70 py-2.5 pl-9 pr-3 text-sm text-zinc-100 placeholder:text-zinc-400 outline-none transition focus:border-zinc-500"
              />
            </span>
          </label>

          <label className="space-y-1.5">
            <span className="text-xs font-medium uppercase tracking-[0.08em] text-zinc-500">
              Role
            </span>
            <select
              value={roleFilter}
              onChange={(event) => setRoleFilter(event.target.value as RoleFilter)}
              className="w-full rounded-xl border border-zinc-700 bg-zinc-900/70 px-3 py-2.5 text-sm text-zinc-100 outline-none transition focus:border-zinc-500"
            >
              <option value="All">All roles</option>
              <option value="Admin">Admin</option>
              <option value="Member">Member</option>
            </select>
          </label>
        </div>

        <p className="mt-3 text-sm text-zinc-600">
          Showing {filteredMembers.length} of {stats.total} members
        </p>
      </section>

      {successMessage ? (
        <section className="rounded-xl border border-emerald-200 bg-emerald-50 p-3">
          <p className="text-sm text-emerald-800">{successMessage}</p>
        </section>
      ) : null}

      {errorMessage ? (
        <section className="rounded-xl border border-red-200 bg-red-50 p-3">
          <p className="text-sm text-red-700">{errorMessage}</p>
        </section>
      ) : null}

      {membersQuery.isLoading ? (
        <section className="rounded-xl border border-zinc-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-zinc-600">Loading members...</p>
        </section>
      ) : membersQuery.isError ? (
        <section className="rounded-xl border border-red-200 bg-red-50 p-5">
          <p className="text-sm text-red-700">
            Failed to load members. Please refresh and try again.
          </p>
        </section>
      ) : (
        <MemberList members={filteredMembers} currentUserId={currentUserId} />
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
