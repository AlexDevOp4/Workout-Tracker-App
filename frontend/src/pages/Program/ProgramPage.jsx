import { useEffect, useState } from "react";
import { getProgram } from "../../api/programs";
import { getUserByClerkId } from "../../api/users";
import { getExerciseById } from "../../api/exercises";
import { Link, useParams } from "react-router-dom";

const dummyProgram = {
  title: "Hypertrophy Block 1",
  status: "active",
  startDate: "2025-11-01",
  clientName: "John Doe",
  trainerName: "Alex Ashtiany",
  durationWeeks: 5,
  weeks: [
    {
      id: "w1",
      weekNumber: 1,
      isDeload: false,
      days: [
        {
          id: "w1d1",
          dayNumber: 1,
          focus: "Upper",
          exercises: [
            {
              id: "e1",
              name: "Barbell Bench Press",
              sets: 4,
              targetReps: "6–8",
              rir: 1,
              weightLbs: 185,
              restSec: 120,
            },
            {
              id: "e2",
              name: "Bent-Over Row",
              sets: 4,
              targetReps: "8–10",
              rir: 1,
              weightLbs: 155,
              restSec: 120,
            },
          ],
        },
        {
          id: "w1d2",
          dayNumber: 2,
          focus: "Lower",
          exercises: [
            {
              id: "e3",
              name: "Back Squat",
              sets: 4,
              targetReps: "6–8",
              rir: 1,
              weightLbs: 245,
              restSec: 150,
            },
            {
              id: "e4",
              name: "Romanian Deadlift",
              sets: 3,
              targetReps: "8–10",
              rir: 1,
              weightLbs: 205,
              restSec: 150,
            },
          ],
        },
      ],
    },
    {
      id: "w2",
      weekNumber: 2,
      isDeload: false,
      days: [
        {
          id: "w2d1",
          dayNumber: 1,
          focus: "Upper",
          exercises: [
            {
              id: "e5",
              name: "Incline DB Press",
              sets: 4,
              targetReps: "8–10",
              rir: 1,
              weightLbs: 70,
              restSec: 120,
            },
          ],
        },
      ],
    },
    {
      id: "w5",
      weekNumber: 5,
      isDeload: true,
      days: [
        {
          id: "w5d1",
          dayNumber: 1,
          focus: "Full Body (Deload)",
          exercises: [
            {
              id: "e6",
              name: "Back Squat (Deload)",
              sets: 3,
              targetReps: "6–8",
              rir: 3,
              weightLbs: 205,
              restSec: 120,
            },
          ],
        },
      ],
    },
  ],
};

const dayLabel = (dayNumber) => {
  const labels = {
    1: "Day 1 (Monday)",
    2: "Day 2 (Tuesday)",
    3: "Day 3 (Wednesday)",
    4: "Day 4 (Thursday)",
    5: "Day 5 (Friday)",
    6: "Day 6 (Saturday)",
    7: "Day 7 (Sunday)",
  };
  return labels[dayNumber] || `Day ${dayNumber}`;
};

export default function ProgramPage() {
  const { programId } = useParams();
  const [programs, setPrograms] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const program = dummyProgram;

  useEffect(() => {
    async function fetchPrograms() {
      try {
        const res = await getProgram(programId);
        console.log(res);
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
              Duration: {program.durationWeeks} weeks
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
                          {week.rows.length} days
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
            {programs.weeks.map((week) => (
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
                    {week.rows.length} days
                  </span>
                </div>
                <div className="collapse-content space-y-4">
                  {week.rows.map((day) => (
                    <div
                      key={day.id}
                      className="card bg-base-100 border border-base-300"
                    >
                      <div className="card-body p-4">
                        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-2">
                          <div>
                            <h3 className="font-semibold text-sm">
                              {dayLabel(day.dayNumber)}
                            </h3>
                            <p className="text-xs opacity-80">{day.focus}</p>
                          </div>
                          <div className="mt-2 md:mt-0">
                            <span className="badge badge-ghost badge-sm">
                              {day.exercise.length} exercises
                            </span>
                          </div>
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
                              <tr>
                                <td className="whitespace-nowrap">
                                  {day.exercise.name}
                                </td>
                                <td className="text-center">{day.sets}</td>
                                <td className="text-center">
                                  {day.targetRepsMin} - {day.targetRepsMax}
                                </td>
                                <td className="text-center">
                                  {day.rir}
                                </td>
                                <td className="text-center">
                                  {day.weightLbs}
                                </td>
                                <td className="text-center">
                                  {day.restSec}
                                </td>
                              </tr>
                            </tbody>
                          </table>
                        </div>
                      </div>
                    </div>
                  ))}

                  {week.rows.length === 0 && (
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
