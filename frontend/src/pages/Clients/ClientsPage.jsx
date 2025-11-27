import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { getClients, createClient, getAllClients } from "../../api/clients";
import { getTrainers, getUsers } from "../../api/users";

export default function ClientsPage() {
  const [clients, setClients] = useState([]);
  const [availableClients, setAvailableClients] = useState([]);
  const [trainers, setTrainers] = useState([]);
  const [trainerId, setTrainerId] = useState("");
  const [trainerName, setTrainerName] = useState("Select a Trainer: ");
  const [trainer, setTrainer] = useState([]);
  const [clientNames, setClientNames] = useState({});
  const [clientList, setClientList] = useState([]);
  const [users, setUsers] = useState([]);
  const [name, setName] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  const fetchUsers = async () => {
    try {
      const res = await getUsers();
      const clients = await getAllClients();
      console.log(clients, "clients");
      const filteredClients = clients.filter(
        (c) => !c.archived && c.trainerId === null
      );
      setClientList(filteredClients);
      const users = res.users;
      const clientsFiltered = users.filter((r) => r.role === "CLIENT");
      const intersectionClients = clients.filter(x => !clientsFiltered.includes(x.userId))
      console.log(intersectionClients, 'inter')
      setAvailableClients(clientsFiltered);


      const trainerData = await getTrainers();
      console.log(trainerData.trainers, "data");
      const mappedTrainerData = trainerData.trainers.map((x) => {
        return {
          id: x.id,
          firstName: x.trainerProfile["firstName"],
          lastName: x.trainerProfile["lastName"],
          email: x.email,
        };
      });

      console.log(typeof mappedTrainerData);
      setTrainer(mappedTrainerData);

      const clientsList = users.filter((r) => r.role === "CLIENT");
      console.log(clientList, "client");
      const trainerlist = users.filter((user) => user.role === "TRAINER");
      setClients(clientsList);
      setTrainers(trainerlist);
    } catch (error) {
      console.error("Failed to fetch users:", error);
    } finally {
      setIsLoading(false);
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
    fetchUsers();
    // fetchClients()
  }, []);

  const handleNameChange = (id, value) => {
    setClientNames((prev) => ({
      ...prev,
      [id]: value,
    }));
  };

  const addClientToTrainersProfile = async (id, names) => {
    const data = {
      name: names,
      trainerId: "4e441a71-4599-49bf-94e0-ff3dd17f4252",
    };
    try {
      console.log(id, names);

      const addClient = await createClient(id, data);

      console.log(addClient);

      fetchUsers();
    } catch (error) {
      console.log(error);
      return error;
    }
  };

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
        {/* Upper Section */}
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
                      onClick={() => {
                        setTrainerName(`${t.firstName} ${t.lastName}`);
                        setTrainerId(`${t.id}`);
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

              {availableClients.map((client) => (
                <li className="list-row" key={client.id}>
                  <div>
                    <Link key={client.id} to={`/client/${client.id}`}>
                      {client.email}
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

                {availableClients.length === 0 ? (
                  <li className="list-row">
                    <div>No available Clients</div>
                  </li>
                ) : (
                  availableClients.map((client) => (
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

        {/* Lower Section */}
        <section className="flex-1 bg-gray-100 p-6 flex items-center justify-center">
          <div className="max-w-xl w-full">
            <ul className="list bg-base-100 rounded-box shadow-md">
              <li className="p-4 pb-2 text-xs opacity-60 tracking-wide">
                Clients
              </li>

              {clients.length === 0 ? (
                <li className="list-row">
                  <div>No available Clients</div>
                </li>
              ) : (
                clients.map((client) => (
                  <li className="list-row" key={client.id}>
                    <div>
                      <Link
                        className="text-black"
                        key={client.id}
                        to={`/client/${client.id}`}
                      >
                        {client.email}
                      </Link>
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
