import type { Team } from "../types/contact";

type Props = {
  search: string;
  status: boolean | undefined;
  teamId: number | undefined;
  teams: Team[];
  ordering: string;
  onSearchChange: (value: string) => void;
  onStatusChange: (value: boolean | undefined) => void;
  onTeamChange: (value: number | undefined) => void;
  onOrderingChange: (value: string) => void;
  onReset: () => void;
};

export default function ContactFilters({
  search,
  status,
  teamId,
  teams,
  ordering,
  onSearchChange,
  onStatusChange,
  onTeamChange,
  onOrderingChange,
  onReset,
}: Props) {
  return (
    <div className="grid gap-4 md:grid-cols-5">
      <input
        value={search}
        onChange={(e) => onSearchChange(e.target.value)}
        placeholder="Search by name / phone / email"
        className="rounded-lg bg-white p-3 outline-none"
      />

      <select
        value={status === undefined ? "" : status ? "true" : "false"}
        onChange={(e) => {
            const value = e.target.value;

            onStatusChange(
            value === "" ? undefined : value === "true"
            );
        }}
        className="w-full rounded-lg bg-white p-3 outline-none">
            <option value="">All Statuses</option>
            <option value="true">Active</option>
            <option value="false">Inactive</option>
        </select>

      <select
        value={teamId || ""}
        onChange={(e) => {
          const value = e.target.value;
          onTeamChange(value === "" ? undefined : Number(value));
        }}
        className="w-full rounded-lg bg-white p-3 outline-none"
      >
        <option value="">All Teams</option>
        {teams.map((team) => (
          <option key={team.id} value={team.id}>
            {team.name}
          </option>
        ))}
      </select>

      <select
        value={ordering}
        onChange={(e) => onOrderingChange(e.target.value)}
        className="rounded-lg bg-white p-3 outline-none"
      >
        <option value="-created_at">Newest first</option>
        <option value="created_at">Oldest first</option>
        <option value="username">Name A-Z</option>
        <option value="-username">Name Z-A</option>
      </select>

      <button
        type="button"
        onClick={onReset}
        className="rounded-lg bg-white px-4 py-3 hover:bg-gray-100 transition-colors"
      >
        Reset
      </button>
    </div>
  );
}