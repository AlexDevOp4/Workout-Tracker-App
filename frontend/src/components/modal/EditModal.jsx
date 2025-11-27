import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { updateClient } from "../../api/clients";
import { getUserByClerkId } from "../../api/users";

export function EditModal({ isOpen, onClose, title }) {
  const { clientId, trainerId } = useParams();
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [archived, setArchived] = useState();
  const [notes, setNotes] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchUsers() {
      try {
        const res = await getUserByClerkId(clientId);
        setFirstName(res[0].clientProfile["firstName"]);
        setLastName(res[0].clientProfile["lastName"]);
        setNotes(res[0].clientProfile["notes"]);
        setArchived(res[0].clientProfile["archived"]);
      } catch (error) {
        console.error("Failed to fetch users:", error);
      } finally {
        setIsLoading(false);
      }
    }
    fetchUsers();
  }, []);

  async function handleSubmit(e) {
    e.preventDefault();
    const clerkId = clientId;

    try {
      const res = await getUserByClerkId(clerkId);
      const userId = res[0].id;
      await updateClient(userId, {
        firstName,
        lastName,
        notes,
        trainerId,
        archived,
      });
      onClose();
    } catch (error) {
      console.error("Failed to create user:", error);
    }
  }
  if (!isOpen) return null;

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-gray-700 text-lg font-medium">Loading...</div>
      </div>
    );
  }
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md rounded-lg bg-base-300 p-6 shadow-lg"
        onClick={(e) => e.stopPropagation()}
      >
        <form className="pl-10 mx-auto container" onSubmit={handleSubmit}>
          <fieldset className="fieldset bg-base-200 border-base-300 rounded-box w-xs border p-4">
            {title && (
              <legend className="fieldset-legend text-lg">{title}</legend>
            )}

            <label className="label">First Name</label>
            <input
              onChange={(e) => setFirstName(e.target.value)}
              type="text"
              className="input"
              placeholder={firstName || ""}
            />

            <label className="label">Last Name</label>
            <input
              onChange={(e) => setLastName(e.target.value)}
              type="text"
              className="input"
              placeholder={lastName || ""}
            />

            <label className="label">Notes</label>
            <input
              onChange={(e) => setNotes(e.target.value)}
              type="text"
              className="input mb-4"
              placeholder="Notes"
            />
            <label className="label">Archived</label>
            <input
              type="checkbox"
              onChange={(e) => setArchived(e.target.checked)}
              defaultChecked={archived}
              className="toggle border-indigo-600 bg-gray-400 checked:bg-blue-500 checked:bg-blue-500 checked:text-black"
            />
          </fieldset>

          <div className="flex justify-end gap-2 mt-4">
            <button
              type="submit"
              className="rounded-md border border-gray-300 px-4 py-2 text-gray-700 hover:bg-gray-100"
            >
              Update
            </button>
            <button
              onClick={onClose}
              className="rounded-md border border-gray-300 px-4 py-2 text-gray-700 hover:bg-gray-100"
            >
              Close
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
