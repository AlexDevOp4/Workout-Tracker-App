import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { FaPenToSquare } from "react-icons/fa6";
import { FaTrashCan } from "react-icons/fa6";
import { FaC } from "react-icons/fa6";
import { EditModal } from "../../components/modal/EditModal";
import { getUserByClerkId } from "../../api/users";
import { DeleteModal } from "../../components/modal/DeleteModal";
import ProgramTable from "../../components/tables/ProgramTable";
import { CreateProgramModal } from "../../components/modal/CreateProgramModal";

export default function ClientPage() {
  const { clientId } = useParams();
  const [client, setClient] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [clientProfileData, setClientProfileData] = useState([]);
  const [archived, setArchived] = useState();
  const [modalType, setModalType] = useState(null);
  const [hasClientProfile, setHasClientProfile] = useState(false);

  const openEditModal = () => setModalType("edit");
  const openCreateProgramModal = () => setModalType("create");
  const openDeleteModal = () => setModalType("delete");
  const closeModal = () => {
    setModalType(null);
    fetchUsers();
  };

  const fetchUsers = async () => {
    try {
      const res = await getUserByClerkId(clientId);
      setClient(res || []);
      if (res[0].clientProfile) {
        setHasClientProfile(true);
        setClientProfileData(Object.keys(res[0].clientProfile).length === 0);
        setArchived(res[0].clientProfile["archived"]);
        setHasClientProfile(true);
      }
    } catch (error) {
      console.error("Failed to fetch users:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-gray-700 text-lg font-medium">Loading...</div>
      </div>
    );
  }

  if (!hasClientProfile) {
    return (
      <div className="container mx-auto">
        <ul className="list bg-base-100 rounded-box shadow-md mt-12">
          {" "}
          <li className="list-row">
            <div>
              <FaC className="text-xl  w-full h-full" />
            </div>
            <div className="mt-2">
              {client[0].email} isn't assigned to a trainer
            </div>
            <div>
              <div></div>
              <div></div>
            </div>
            <button
              onClick={openEditModal}
              className="btn btn-square btn-ghost"
            >
              <FaPenToSquare />
            </button>
            <EditModal
              title={client[0].email}
              isOpen={modalType === "edit"}
              onClose={closeModal}
            />
          </li>
        </ul>
      </div>
    );
  }
  return (
    <div className="container mx-auto">
      <ul className="list bg-base-100 rounded-box shadow-md mt-12">
        {clientProfileData || !archived ? (
          client.map((x) => (
            <li key={x.id} className="list-row">
              <div>
                <FaC className="text-xl  w-full h-full" />
              </div>
              <div>
                <div className="font-bold">
                  {x.clientProfile["firstName"]} {x.clientProfile["lastName"]}
                </div>
                <div className="text-xs  font-semibold opacity-60">
                  {x.email}
                </div>
              </div>
              <div>
                <button
                  onClick={openEditModal}
                  className="btn btn-square btn-ghost"
                >
                  <FaPenToSquare />
                </button>
                <EditModal
                  isOpen={modalType === "edit"}
                  onClose={closeModal}
                  title={`${x.clientProfile["firstName"]} ${x.clientProfile["lastName"][0]}.`}
                />
                <button
                  onClick={openDeleteModal}
                  className="btn btn-square btn-ghost"
                >
                  <FaTrashCan />
                </button>
                <DeleteModal
                  isOpen={modalType === "delete"}
                  onClose={closeModal}
                  title={`${x.clientProfile["firstName"]} ${x.clientProfile["lastName"][0]}.`}
                />
              </div>
            </li>
          ))
        ) : (
          <li className="list-row">
            <div className="mt-2">
              {client[0].email} isn't assigned to a trainer
            </div>
            <div>
              <div></div>
              <div></div>
            </div>
            <button
              onClick={openEditModal}
              className="btn btn-square btn-ghost"
            >
              <FaPenToSquare />
            </button>
            <EditModal isOpen={modalType === "edit"} onClose={closeModal} />
          </li>
        )}
      </ul>
      <button
        className="btn btn-square btn-ghost"
        onClick={openCreateProgramModal}
      >
        Create Program
      </button>
      <CreateProgramModal
        className="overflow-scroll"
        isOpen={modalType === "create"}
        onClose={closeModal}
        titles={clientId}
      />
      <ProgramTable />
    </div>
  );
}
