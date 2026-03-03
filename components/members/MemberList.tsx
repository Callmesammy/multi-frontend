import RoleBadge from "@/components/members/RoleBadge";
import type { User } from "@/types/user";

interface MemberListProps {
  members: User[];
  currentUserId?: string;
}

export default function MemberList({ members, currentUserId }: MemberListProps) {
  if (!members.length) {
    return (
      <section className="rounded-lg border border-dashed border-zinc-300 bg-white p-8 text-center">
        <h3 className="text-base font-semibold text-zinc-900">No members found</h3>
        <p className="mt-1 text-sm text-zinc-600">
          Invite members to start collaborating.
        </p>
      </section>
    );
  }

  return (
    <section className="overflow-hidden rounded-lg border border-zinc-200 bg-white">
      <ul className="divide-y divide-zinc-100">
        {members.map((member) => (
          <li
            key={member.id}
            className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 sm:px-5"
          >
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-zinc-900">
                {member.name}
                {member.id === currentUserId ? (
                  <span className="ml-1 text-xs font-normal text-zinc-500">(You)</span>
                ) : null}
              </p>
              <p className="truncate text-sm text-zinc-600">{member.email}</p>
            </div>

            <div className="flex items-center gap-2">
              <RoleBadge role={member.role} />
              {member.id !== currentUserId ? (
                <button
                  type="button"
                  className="rounded-md border border-zinc-300 px-2.5 py-1 text-xs font-medium text-zinc-700 opacity-60"
                  title="Remove endpoint is not available in current API scope."
                  disabled
                >
                  Remove
                </button>
              ) : null}
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
