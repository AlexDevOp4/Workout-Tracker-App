import { useParams } from "react-router-dom";
import { deleteClient } from "../../api/clients";
import { getUserByClerkId } from "../../api/users";

export function DeleteModal({ isOpen, onClose, title }) {
  const { clientId } = useParams();
  if (!isOpen) return null;
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md rounded-lg bg-base-300 p-6 shadow-lg"
        onClick={(e) => e.stopPropagation()}
      >
        <div>
          <h3 className="font-bold text-lg">Delete {title}?</h3>
          <p className="py-4">Confrim you would like to archive client.</p>
          <div className="modal-action">
            <button
              onClick={async () => {
                try {
                  const res = await getUserByClerkId(clientId);
                  const userId = res[0].id;
                  await deleteClient(userId);

                  onClose();
                } catch (error) {
                  console.log(error);
                  return;
                }
              }}
              className="btn bg-red-300"
            >
              Delete
            </button>
            <button className="btn bg-gray-200">Close</button>
          </div>
        </div>
      </div>
    </div>
  );
}
