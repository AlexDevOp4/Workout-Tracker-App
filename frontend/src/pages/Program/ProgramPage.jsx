import { useEffect, useState } from "react";
import { getProgram } from "../../api/programs";
import { getUserByClerkId } from "../../api/users";
import { getExerciseById } from "../../api/exercises";
import { Link, useParams } from "react-router-dom";

export default function ProgramPage() {
  const { programId } = useParams();
  const [programs, setPrograms] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchPrograms() {
      try {
        const res = await getProgram(programId);
        setPrograms(res || []); // fallback to empty array if undefined
      } catch (error) {
        console.error("Failed to fetch users:", error);
      } finally {
        setIsLoading(false);
      }
    }
    fetchPrograms();
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-gray-700 text-lg font-medium">Loading...</div>
      </div>
    );
  }
  return (
    <div className="min-h-screen bg-base-200">
      {/* Header */}
      <div className="hero bg-base-100 shadow-sm">
        <div className="hero-content flex-col lg:flex-row justify-between w-full max-w-6xl">
          <div>
            <h1 className="text-3xl font-bold">
              {programs.title}
              <span className="ml-2 badge badge-primary uppercase">
                {programs.status}
              </span>
            </h1>
            <p className="mt-2 text-sm opacity-80">
              Client:{" "}
              <span className="font-semibold">
                {programs.client.firstName} {programs.client.lastName}
              </span>{" "}
              | Trainer:{" "}
              <span className="font-semibold">
                {programs.trainer.trainerProfile["firstName"]}{" "}
                {programs.trainer.trainerProfile["lastName"]}
              </span>
            </p>
            <p className="text-sm opacity-80">
              Start date:{" "}
              {new Date(programs.startDate).toLocaleDateString("en-US")} |
              Duration: {programs.weeks.length} weeks
            </p>
          </div>

          <div className="stats shadow mt-4 lg:mt-0">
            <div className="stat">
              <div className="stat-title">Total Weeks</div>
              <div className="stat-value text-primary">
                {programs.weeks.length}
              </div>
            </div>
            <div className="stat">
              <div className="stat-title">Deload Weeks</div>
              <div className="stat-value text-secondary">
                {programs.weeks.filter((w) => w.isDeload).length}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-6xl mx-auto py-6 px-4 lg:px-0">
        <div className="grid lg:grid-cols-4 gap-4">
          {/* Week list (side) */}
          <aside className="lg:col-span-1">
            <div className="card bg-base-100 shadow-md">
              <div className="card-body">
                <h2 className="card-title text-sm uppercase tracking-wide">
                  Weeks Overview
                </h2>
                <ul className="menu menu-sm">
                  {programs.weeks.map((week) => (
                    <li key={week.id}>
                      <div className="flex items-center justify-between">
                        <span>
                          Week {week.weekNumber}
                          {week.isDeload && (
                            <span className="ml-2 badge badge-outline badge-warning">
                              Deload
                            </span>
                          )}
                        </span>
                        <span className="badge badge-ghost badge-sm">
                          {week.days.length} days
                        </span>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </aside>

          {/* Week details */}
          <main className="lg:col-span-3 space-y-4">
            {programs.weeks.map((week, i) => (
              <div
                key={week.id}
                className="collapse collapse-arrow bg-base-100 shadow-md"
              >
                <input type="checkbox" defaultChecked={!week.isDeload} />
                <div className="collapse-title text-lg font-semibold flex items-center gap-2">
                  <span>Week {week.weekNumber}</span>
                  {week.isDeload && (
                    <span className="badge badge-warning badge-sm uppercase">
                      Deload
                    </span>
                  )}
                  <span className="badge badge-outline badge-sm ml-auto">
                    {week.days.length} days
                  </span>
                </div>

                <div className="collapse-content space-y-4">
                  {week.days.map((row) =>
                    row.rows.map((r) => (
                      <div
                        key={r.id}
                        className="card bg-base-100 border border-base-300"
                      >
                        <div className="card-body p-4">
                          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-2">
                            <div>
                              <h3 className="font-semibold text-sm">
                                Day {row.dayNumber}
                              </h3>
                            </div>
                            <div className="mt-2 md:mt-0"></div>
                          </div>
                          <div className="overflow-x-auto">
                            <table className="table table-sm">
                              <thead>
                                <tr className="text-xs uppercase">
                                  <th>Exercise</th>
                                  <th className="text-center">Sets</th>
                                  <th className="text-center">Target Reps</th>
                                  <th className="text-center">RIR</th>
                                  <th className="text-center">Weight (lbs)</th>
                                  <th className="text-center">Rest (sec)</th>
                                </tr>
                              </thead>
                              <tbody>
                                <tr key={r.id}>
                                  <td className="whitespace-nowrap">
                                    {r.exercise.name}
                                  </td>
                                  <td className="text-center">{r.sets}</td>
                                  <td className="text-center">
                                    {r.targetRepsMin} - {r.targetRepsMax}
                                  </td>
                                  <td className="text-center">{r.rir}</td>
                                  <td className="text-center">{r.weightLbs}</td>
                                  <td className="text-center">{r.restSec}</td>
                                </tr>
                              </tbody>
                            </table>
                          </div>
                        </div>
                      </div>
                    ))
                  )}

                  {week.days.length === 0 && (
                    <p className="text-sm opacity-70 italic">
                      No days defined for this week yet.
                    </p>
                  )}
                </div>
              </div>
            ))}
          </main>
        </div>
      </div>
    </div>
  );
}
