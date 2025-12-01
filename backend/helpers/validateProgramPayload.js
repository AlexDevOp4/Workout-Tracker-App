export function validateProgramPayload(weeks) {
  if (!Array.isArray(weeks) || weeks.length === 0) {
    return "At least one week is required.";
  }

  for (let w = 0; w < weeks.length; w++) {
    const week = weeks[w];

    if (
      typeof week.weekNumber !== "number" ||
      !Number.isInteger(week.weekNumber) ||
      week.weekNumber <= 0
    ) {
      return `Week ${w + 1}: weekNumber must be a positive integer.`;
    }

    if (!Array.isArray(week.days) || week.days.length === 0) {
      return `Week ${week.weekNumber}: at least one day is required.`;
    }

    for (let d = 0; d < week.days.length; d++) {
      const day = week.days[d];

      if (
        typeof day.dayNumber !== "number" ||
        !Number.isInteger(day.dayNumber) ||
        day.dayNumber <= 0
      ) {
        return `Week ${week.weekNumber}, Day ${
          d + 1
        }: dayNumber must be a positive integer.`;
      }

      if (!Array.isArray(day.rows)) {
        return `Week ${week.weekNumber}, Day ${day.dayNumber}: rows must be an array.`;
      }

      for (let r = 0; r < day.rows.length; r++) {
        const row = day.rows[r];

        if (!row.exerciseId || typeof row.exerciseId !== "string") {
          return `Week ${week.weekNumber}, Day ${day.dayNumber}, Row ${
            r + 1
          }: exerciseId is required.`;
        }

        const intFields = [
          "sets",
          "weightLbs",
          "targetRepsMin",
          "targetRepsMax",
          "rir",
          "restSec",
        ];

        for (const field of intFields) {
          const value = row[field];

          if (typeof value !== "number" || !Number.isFinite(value)) {
            return `Week ${week.weekNumber}, Day ${day.dayNumber}, Row ${
              r + 1
            }: ${field} must be a number.`;
          }
          if (!Number.isInteger(value) || value < 0) {
            return `Week ${week.weekNumber}, Day ${day.dayNumber}, Row ${
              r + 1
            }: ${field} must be a non-negative integer.`;
          }
        }

        if (row.actualReps !== undefined && row.actualReps !== null) {
          if (!Array.isArray(row.actualReps)) {
            return `Week ${week.weekNumber}, Day ${day.dayNumber}, Row ${
              r + 1
            }: actualReps must be an array of numbers if provided.`;
          }

          for (let i = 0; i < row.actualReps.length; i++) {
            const rep = row.actualReps[i];
            if (typeof rep !== "number" || !Number.isFinite(rep)) {
              return `Week ${week.weekNumber}, Day ${day.dayNumber}, Row ${
                r + 1
              }: actualReps[${i}] must be a number.`;
            }
          }
        }
      }
    }
  }

  return null;
}
