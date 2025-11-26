import { useParams } from "react-router-dom";
import { getClients } from "../../api/clients";
import { useEffect, useState } from "react";
import { FaPenToSquare } from "react-icons/fa6";
import { FaTrashCan } from "react-icons/fa6";
import { updateClient } from "../../api/clients";
import { EditModal } from "../../components/modal/editModal";

export default function TrainerPage() {
  const { id } = useParams();
  const [clients, setClients] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);

  const fetchTrainersClients = async () => {
    try {
      const clients = await getClients(id);
      setClients(clients);

      console.log(clients);
    } catch (error) {
      console.log(error);
    }
  };

  const updateClientData = async (clientId) => {
    try {
      const updatedClient = await updateClient(clientId);
      return updatedClient;
    } catch (error) {
      console.log(error);
      return;
    }
  };

  useEffect(() => {
    // const fetchClients = async () => {
    //     try {
    //         const clients = await getClients()
    //         console.log(clients)
    //         setClients()

    //     } catch (error) {
    //         console.log('Failed to fetch clients', error)

    //     } finally {
    //         setIsLoading(false)
    //     }

    // }
    fetchTrainersClients();
    // fetchClients()
  }, []);

  // fetch trainer + clients here using the id
  return (
    <div className="container mx-auto mt-8">
      <ul className="list bg-base-100 rounded-box shadow-md">
        <li className="p-4 pb-2 text-xs opacity-60 tracking-wide">Clients</li>
        {clients.map((client) => (
          <li key={client.userId} className="list-row">
            <div></div>
            <div>
              <div>{client.name}</div>
            </div>
            <button onClick={openModal} className="btn btn-square btn-ghost">
              <FaPenToSquare />
            </button>
            <EditModal
              isOpen={isModalOpen}
              onClose={closeModal}
              title={client.name}
            />
            <button className="btn btn-square btn-ghost">
              <FaTrashCan />
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
