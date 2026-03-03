import { Mail, Shield, UserRound, UserX } from "lucide-react";

import RoleBadge from "@/components/members/RoleBadge";
import type { User } from "@/types/user";

interface MemberListProps {
  members: User[];
  currentUserId?: string;
}

function getInitials(name: string, email: string): string {
  const normalized = name.trim();
  if (!normalized) return email.charAt(0).toUpperCase() || "U";

  const parts = normalized.split(" ").filter(Boolean);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0] ?? ""}${parts[1][0] ?? ""}`.toUpperCase();
}

export default function MemberList({ members, currentUserId }: MemberListProps) {
  if (!members.length) {
    return (
      <section className="rounded-2xl border border-dashed border-zinc-300 bg-white p-8 text-center shadow-sm">
        <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-full bg-zinc-100 text-zinc-500">
          <UserX className="h-5 w-5" />
        </div>
        <h3 className="mt-3 text-base font-semibold text-zinc-900">No members found</h3>
        <p className="mt-1 text-sm text-zinc-600">Invite members to start collaborating.</p>
      </section>
    );
  }

  return (
    <section className="space-y-3">
      <div className="grid gap-3 md:hidden">
        {members.map((member) => (
          <article
            key={member.id}
            className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm"
          >
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-zinc-900 text-xs font-semibold text-white">
                {getInitials(member.name, member.email)}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-zinc-900">{member.name}</p>
                <p className="mt-0.5 inline-flex items-center gap-1 text-xs text-zinc-600">
                  <Mail className="h-3.5 w-3.5" />
                  <span className="truncate">{member.email}</span>
                </p>
                <p className="mt-0.5 inline-flex items-center gap-1 text-xs text-zinc-500">
                  <Shield className="h-3.5 w-3.5" />
                  ID: {member.id.slice(0, 8)}
                </p>
              </div>
            </div>

            <div className="mt-3 flex items-center gap-2">
              <RoleBadge role={member.role} />
              {member.id === currentUserId ? (
                <span className="rounded-full border border-zinc-300 bg-zinc-100 px-2.5 py-1 text-xs font-medium text-zinc-700">
                  You
                </span>
              ) : (
                <button
                  type="button"
                  className="rounded-lg border border-zinc-300 px-2.5 py-1 text-xs font-medium text-zinc-700 opacity-60"
                  title="Remove endpoint is not available in current API scope."
                  disabled
                >
                  Remove
                </button>
              )}
            </div>
          </article>
        ))}
      </div>

      <section className="hidden overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm md:block">
        <ul className="divide-y divide-zinc-100">
          {members.map((member) => (
            <li
              key={member.id}
              className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 sm:px-5"
            >
              <div className="flex min-w-0 items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-zinc-900 text-xs font-semibold text-white">
                  {getInitials(member.name, member.email)}
                </div>
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-zinc-900">
                    {member.name}
                    {member.id === currentUserId ? (
                      <span className="ml-2 rounded-full border border-zinc-300 bg-zinc-100 px-2 py-0.5 text-xs font-medium text-zinc-700">
                        You
                      </span>
                    ) : null}
                  </p>
                  <p className="truncate text-sm text-zinc-600">{member.email}</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <p className="inline-flex items-center gap-1 rounded-lg border border-zinc-200 bg-zinc-50 px-2 py-1 text-xs text-zinc-500">
                  <UserRound className="h-3.5 w-3.5" />
                  {member.id.slice(0, 8)}
                </p>
                <RoleBadge role={member.role} />
                {member.id === currentUserId ? (
                  <span className="rounded-lg border border-zinc-300 bg-zinc-100 px-2.5 py-1 text-xs font-medium text-zinc-700">
                    Current User
                  </span>
                ) : (
                  <button
                    type="button"
                    className="rounded-lg border border-zinc-300 px-2.5 py-1 text-xs font-medium text-zinc-700 opacity-60"
                    title="Remove endpoint is not available in current API scope."
                    disabled
                  >
                    Remove
                  </button>
                )}
              </div>
            </li>
          ))}
        </ul>
      </section>
    </section>
  );
}
