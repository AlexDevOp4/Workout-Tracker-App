import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { getClients } from "../../api/clients";
import { getTrainers, getClientUsers } from "../../api/users";

export default function ClientsPage() {
  const [clients, setClients] = useState([]);
  const [canAssign, setCanAssign] = useState([]);
  const [cantAssign, setCantAssign] = useState([]);
  const [trainerClients, setTrainerClients] = useState([]);
  const [trainerId, setTrainerId] = useState("");
  const [trainerName, setTrainerName] = useState("Select a Trainer: ");
  const [trainer, setTrainer] = useState([]);

  const [isLoading, setIsLoading] = useState(true);

  const fetchTrainers = async () => {
    try {
      const trainerData = await getTrainers();
      const mappedTrainerData = trainerData.map((x) => {
        return {
          id: x.id,
          firstName: x.trainerProfile["firstName"],
          lastName: x.trainerProfile["lastName"],
          email: x.email,
        };
      });
      setTrainer(mappedTrainerData);
    } catch (error) {
      console.error("Failed to fetch trainers:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchClientUsers = async () => {
    try {
      const clientUsers = await getClientUsers();
      const clientUsersData = clientUsers.clients;
      setClients(clientUsersData);
      const hasClientProfile = clientUsersData.filter(
        (client) => client.clientProfile
      );
      setCantAssign(hasClientProfile);
      const noClientProfile = clientUsersData.filter(
        (client) => !client.clientProfile
      );
      setCanAssign(noClientProfile);
    } catch (error) {
      console.log("Failed to fetch clients: ", error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchAvailableClients = async (id) => {
    try {
      const clients = await getClients(id);
      setTrainerClients(clients);
    } catch (error) {
      console.error("Failed to fetch users:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchClientUsers();
    fetchTrainers();
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-gray-700 text-lg font-medium">Loading...</div>
      </div>
    );
  }

  return clients.length === 0 ? (
    <div className="text-lg bold">No clients</div>
  ) : (
    <div>
      <div className="min-h-screen flex flex-col">

        <section className="flex-1 bg-gray-900 p-6 flex items-center justify-center">
          <div className="max-w-xl w-full">
            <div className="dropdown">
              <div tabIndex={0} role="button" className="btn m-1">
                {trainerName}
              </div>
              <ul
                tabIndex="-1"
                className="dropdown-content menu bg-base-100 rounded-box z-1 w-52 p-2 shadow-sm"
              >
                {trainer.map((t) => (
                  <li key={t.id}>
                    <button
                      onClick={(e) => {
                        setTrainerName(`${t.firstName} ${t.lastName}`);
                        setTrainerId(t.id);
                        fetchAvailableClients(t.id);
                        fetchClientUsers();

                        e.currentTarget.blur();
                      }}
                    >
                      {t.firstName} {t.lastName}
                    </button>
                  </li>
                ))}
              </ul>
            </div>

            <ul className="list bg-base-100 rounded-box shadow-md">
              <li className="p-4 pb-2 text-xs opacity-60 tracking-wide">
                Clients for this trainer
              </li>

              {trainerClients.map((client) => (
                <li className="list-row" key={client.id}>
                  <div>
                    <Link
                      key={client.userId}
                      to={`/client/${client.user["clerkId"]}/trainer/${client.trainerId}`}
                    >
                      {client.firstName} {client.lastName}
                    </Link>
                  </div>
                </li>
              ))}
            </ul>

            <div className="max-w-xl w-full mt-4">
              <ul className="list bg-base-100 rounded-box shadow-md">
                <li className="p-4 pb-2 text-xs opacity-60 tracking-wide">
                  Available clients to assign
                </li>

                {canAssign.length === 0 ? (
                  <li className="list-row">
                    <div>No available Clients</div>
                  </li>
                ) : (
                  canAssign.map((client) => (
                    <li className="list-row" key={client.id}>
                      <div>
                        <Link
                          className="text-black"
                          key={client.id}
                          to={`/client/${client.clerkId}/trainer/${trainerId}`}
                        >
                          {client.email}
                        </Link>
                      </div>
                    </li>
                  ))
                )}
              </ul>
            </div>
          </div>
        </section>

  
        <section className="flex-1 bg-gray-100 p-6 flex items-center justify-center">
          <div className="max-w-xl w-full">
            <ul className="list bg-base-100 rounded-box shadow-md">
              <li className="p-4 pb-2 text-xs opacity-60 tracking-wide">
                Clients
              </li>

              {cantAssign.length === 0 ? (
                <li className="list-row">
                  <div>No available Clients</div>
                </li>
              ) : (
                cantAssign.map((client) => (
                  <li className="list-row" key={client.id}>
                    <div>
                      {client.clientProfile["firstName"]}{" "}
                      {client.clientProfile["lastName"]}
                      <div className="text-xs uppercase font-semibold opacity-60">
                        {client.email}
                      </div>
                    </div>
                  </li>
                ))
              )}
            </ul>
          </div>
        </section>
      </div>
    </div>
  );
}
