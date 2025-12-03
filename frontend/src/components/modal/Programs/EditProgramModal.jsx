import { useEffect, useState } from "react";
import { getUserByClerkId } from "../../api/users";
import { getExercises } from "../../api/exercises";
import { updateProgram } from "../../../api/programs";

export function CreateProgramModal({ isOpen, onClose, titles }) {
  const [client, setClient] = useState([]);
  const [exercises, setExercises] = useState([]);
  const [title, setTitle] = useState("Program 1");
  const [isLoading, setIsLoading] = useState(true);
  const [startDate, setStartDate] = useState("");
  const [weeks, setWeeks] = useState([
    {
      weekNumber: 1,
      isDeload: false,
      days: [
        {
          dayNumber: 1,
          rows: [],
        },
      ],
    },
  ]);

  const fetchExercises = async () => {
    try {
      const res = await getExercises();
      setExercises(res);
    } catch (error) {
      console.error("Failed to fetch exercises:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      const res = await getUserByClerkId(titles);
      setClient(res || []);
    } catch (error) {
      console.error("Failed to fetch users:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
    fetchExercises();
  }, []);

  const handleAddWeek = () => {
    const nextWeekNumber = weeks.length + 1;
    setWeeks((prev) => [
      ...prev,
      {
        weekNumber: nextWeekNumber,
        isDeload: false,
        days: [
          {
            dayNumber: 1,
            rows: [],
          },
        ],
      },
    ]);
  };

  const handleAddDay = (weekIndex) => {
    setWeeks((prev) => {
      const updated = [...prev];
      const week = updated[weekIndex];
      const nextDayNumber = week.days.length + 1;
      week.days.push({
        dayNumber: nextDayNumber,
        rows: [],
      });
      return updated;
    });
  };

  const handleAddRow = (weekIndex, dayIndex) => {
    setWeeks((prev) => {
      const updated = [...prev];
      const day = updated[weekIndex].days[dayIndex];
      day.rows.push({
        id: crypto.randomUUID(),
        exerciseId: exercises[0].id,
        sets: 3,
        weightLbs: 135,
        targetRepsMin: 8,
        targetRepsMax: 10,
        rir: 1,
        restSec: 90,
      });
      return updated;
    });
  };

  const handleRowChange = (weekIndex, dayIndex, rowId, field, value) => {
    setWeeks((prev) => {
      const updated = [...prev];
      const day = updated[weekIndex].days[dayIndex];
      day.rows = day.rows.map((row) =>
        row.id === rowId
          ? {
              ...row,
              [field]:
                field === "sets" ||
                field === "weightLbs" ||
                field === "targetRepsMin" ||
                field === "targetRepsMax" ||
                field === "rir" ||
                field === "restSec"
                  ? Number(value)
                  : value,
            }
          : row
      );
      return updated;
    });
  };

  const handleToggleDeload = (weekIndex) => {
    setWeeks((prev) => {
      const updated = [...prev];
      updated[weekIndex].isDeload = !updated[weekIndex].isDeload;
      return updated;
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log(client[0].id);

    if (!startDate) {
      alert("Choose a start date.");
      return;
    }

    const payload = {
      clientProfileId: client[0].clientProfile["id"],
      trainerId: client[0].clientProfile["trainerId"],
      title,
      startDate,
      weeks,
    };

    const program = await updateProgram(payload);

    console.log("PROGRAM PAYLOAD:", program);
    alert("Program created!");
    onClose();
  };

  if (!isOpen) return null;

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-gray-700 text-lg font-medium">Loading...</div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/50 p-4">
      <div className="w-full max-w-6xl max-h-[90vh] overflow-y-auto bg-base-200 rounded-box shadow-xl p-6 space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Trainer Program Builder</h1>
          <button onClick={onClose} className="btn btn-sm btn-ghost">
            ✕
          </button>
        </div>

        {/* Top card: client + program meta */}
        <div className="card bg-base-100 shadow-lg">
          <div className="card-body">
            <h2 className="card-title">Program Details</h2>

            <form
              className="grid grid-cols-1 md:grid-cols-3 gap-4"
              onSubmit={handleSubmit}
            >
              <div className="form-control">
                <label className="label">
                  <span className="label-text text-lg text-black">
                    Client:{" "}
                  </span>
                </label>

                {client && (
                  <span className="mt-1 text-lg ">
                    {" "}
                    {client[0].clientProfile["firstName"]}
                  </span>
                )}
              </div>

              {/* Title */}
              <div className="form-control">
                <label className="label">
                  <span className="label-text">Program title</span>
                </label>
                <input
                  type="text"
                  className="input input-bordered"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
              </div>

              {/* Start date */}
              <div className="form-control">
                <label className="label">
                  <span className="label-text">Start date</span>
                </label>
                <input
                  type="date"
                  className="input input-bordered"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                />
              </div>

              <div className="md:col-span-3 flex justify-between items-center mt-4">
                <div className="text-sm text-base-content/60">
                  Weeks: {weeks.length}
                </div>
                <button
                  type="button"
                  className="btn btn-outline btn-sm"
                  onClick={handleAddWeek}
                >
                  + Add Week
                </button>
              </div>

              <div className="md:col-span-3 flex justify-end mt-2">
                <button type="submit" className="btn btn-primary">
                  Create Program (dummy)
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Weeks / Days / Rows */}
        <div className="space-y-4">
          {weeks.map((week, weekIndex) => (
            <div key={week.weekNumber} className="card bg-base-100 shadow-md">
              <div className="card-body">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-3">
                    <h2 className="card-title">Week {week.weekNumber}</h2>
                    <label className="label cursor-pointer flex items-center gap-2">
                      <span className="label-text text-sm">Deload</span>
                      <input
                        type="checkbox"
                        className="toggle toggle-sm"
                        checked={week.isDeload}
                        onChange={() => handleToggleDeload(weekIndex)}
                      />
                    </label>
                    {week.isDeload && (
                      <span className="badge badge-warning badge-sm">
                        Deload
                      </span>
                    )}
                  </div>
                  <button
                    type="button"
                    className="btn btn-outline btn-xs"
                    onClick={() => handleAddDay(weekIndex)}
                  >
                    + Add Day
                  </button>
                </div>

                <div className="divider my-2" />

                <div className="space-y-4">
                  {week.days.map((day, dayIndex) => (
                    <div
                      key={day.dayNumber}
                      className="collapse collapse-arrow bg-base-200"
                    >
                      <input type="checkbox" defaultChecked={dayIndex === 0} />
                      <div className="collapse-title font-medium">
                        Day {day.dayNumber}{" "}
                        <span className="text-xs text-base-content/60">
                          ({day.rows.length} exercises)
                        </span>
                      </div>
                      <div className="collapse-content space-y-3">
                        <button
                          type="button"
                          className="btn btn-sm btn-outline mb-2"
                          onClick={() => handleAddRow(weekIndex, dayIndex)}
                        >
                          + Add Exercise Row
                        </button>

                        {day.rows.length === 0 && (
                          <p className="text-sm text-base-content/60">
                            No exercises added yet.
                          </p>
                        )}

                        {day.rows.map((row) => (
                          <div
                            key={row.id}
                            className="grid grid-cols-1 md:grid-cols-6 gap-2 items-end bg-base-100 p-3 rounded-box"
                          >
                            {/* Exercise select */}
                            <div className="form-control md:col-span-2">
                              <label className="label">
                                <span className="label-text text-xs">
                                  Exercise
                                </span>
                              </label>
                              <select
                                className="select select-bordered select-sm"
                                value={row.exerciseId}
                                onChange={(e) =>
                                  handleRowChange(
                                    weekIndex,
                                    dayIndex,
                                    row.id,
                                    "exerciseId",
                                    e.target.value
                                  )
                                }
                              >
                                {exercises.map((ex) => (
                                  <option key={ex.id} value={ex.id}>
                                    {ex.name} ({ex.category})
                                  </option>
                                ))}
                              </select>
                            </div>

                            {/* Sets */}
                            <div className="form-control">
                              <label className="label">
                                <span className="label-text text-xs">Sets</span>
                              </label>
                              <input
                                type="number"
                                className="input input-bordered input-sm"
                                value={row.sets}
                                onChange={(e) =>
                                  handleRowChange(
                                    weekIndex,
                                    dayIndex,
                                    row.id,
                                    "sets",
                                    e.target.value
                                  )
                                }
                              />
                            </div>

                            {/* Weight */}
                            <div className="form-control">
                              <label className="label">
                                <span className="label-text text-xs">
                                  Weight (lbs)
                                </span>
                              </label>
                              <input
                                type="number"
                                className="input input-bordered input-sm"
                                value={row.weightLbs}
                                onChange={(e) =>
                                  handleRowChange(
                                    weekIndex,
                                    dayIndex,
                                    row.id,
                                    "weightLbs",
                                    e.target.value
                                  )
                                }
                              />
                            </div>

                            {/* Reps range */}
                            <div className="form-control">
                              <label className="label">
                                <span className="label-text text-xs">
                                  Reps (min–max)
                                </span>
                              </label>
                              <div className="flex gap-1">
                                <input
                                  type="number"
                                  className="input input-bordered input-sm w-1/2"
                                  value={row.targetRepsMin}
                                  onChange={(e) =>
                                    handleRowChange(
                                      weekIndex,
                                      dayIndex,
                                      row.id,
                                      "targetRepsMin",
                                      e.target.value
                                    )
                                  }
                                />
                                <input
                                  type="number"
                                  className="input input-bordered input-sm w-1/2"
                                  value={row.targetRepsMax}
                                  onChange={(e) =>
                                    handleRowChange(
                                      weekIndex,
                                      dayIndex,
                                      row.id,
                                      "targetRepsMax",
                                      e.target.value
                                    )
                                  }
                                />
                              </div>
                            </div>

                            {/* RIR */}
                            <div className="form-control">
                              <label className="label">
                                <span className="label-text text-xs">RIR</span>
                              </label>
                              <input
                                type="number"
                                className="input input-bordered input-sm"
                                value={row.rir}
                                onChange={(e) =>
                                  handleRowChange(
                                    weekIndex,
                                    dayIndex,
                                    row.id,
                                    "rir",
                                    e.target.value
                                  )
                                }
                              />
                            </div>

                            {/* Rest */}
                            <div className="form-control">
                              <label className="label">
                                <span className="label-text text-xs">
                                  Rest (sec)
                                </span>
                              </label>
                              <input
                                type="number"
                                className="input input-bordered input-sm"
                                value={row.restSec}
                                onChange={(e) =>
                                  handleRowChange(
                                    weekIndex,
                                    dayIndex,
                                    row.id,
                                    "restSec",
                                    e.target.value
                                  )
                                }
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="flex justify-end">
          <button onClick={onClose} className="btn">
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
