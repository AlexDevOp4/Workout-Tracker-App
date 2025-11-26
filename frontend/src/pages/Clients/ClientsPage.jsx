import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { getClients, createClient } from "../../api/clients";
import { getUsers } from "../../api/users";

export default function ClientsPage() {
  const [clients, setClients] = useState([]);
  const [trainers, setTrainers] = useState([]);
  const [clientNames, setClientNames] = useState({});
  const [users, setUsers] = useState([]);
  const [name, setName] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  const fetchUsers = async () => {
    try {
      const res = await getUsers();
      const users = res.users;

      const clientsList = users.filter((r) => r.role === "CLIENT");
      const trainerlist = users.filter((user) => user.role === "TRAINER");
      setClients(clientsList);
      setTrainers(trainerlist);
    } catch (error) {
      console.error("Failed to fetch users:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchTrainersClients = async (trainerList) => {
    try {
      const trainersClients = await getClients(trainerList.id);

      console.log(trainersClients);

      return trainersClients;
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
        <section className="flex-1 bg-gray-900 text-white p-6 flex items-center justify-center">
          <div className="max-w-xl w-full">
            <h1 className="text-2xl font-bold">Upper Section</h1>
            <p className="mt-2 text-sm">
              Content goes here. This area automatically scales for mobile.
            </p>
          </div>
        </section>

        {/* Lower Section */}
        <section className="flex-1 bg-gray-100 p-6 flex items-center justify-center">
          <div className="max-w-xl w-full">
            <ul className="list bg-base-100 rounded-box shadow-md">
              <li className="p-4 pb-2 text-xs opacity-60 tracking-wide">
                Trainers
              </li>

              {trainers.map((trainer) => (
                <li className="list-row" key={trainer.id}>
                  <div>
                    <Link key={trainer.id} to={`/trainer/${trainer.id}`}>
                      {trainer.email}
                    </Link>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </section>
      </div>
      <ul role="list" className="divide-y divide-gray-100">
        {clients.map((client) => (
          <li
            key={client.id}
            className="flex items-center justify-between gap-x-6 py-5"
          >
            <div className="min-w-0">
              <div className="flex items-start gap-x-3">
                <p className="text-sm/6 font-semibold text-gray-900">
                  {client.email}
                </p>
                <p>{client.trainerId || "No trainer assigned"}</p>
              </div>
              <div className="mt-1 flex items-center gap-x-2 text-xs/5 text-gray-500">
                <p className="whitespace-nowrap">
                  <input
                    type="text"
                    value={clientNames[client.id] || ""}
                    onChange={(e) =>
                      handleNameChange(client.id, e.target.value)
                    }
                    placeholder="Name"
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-600 focus:outline-none"
                  />
                </p>
              </div>
            </div>
            <div className="flex flex-none items-center gap-x-4">
              <button
                onClick={() =>
                  addClientToTrainersProfile(
                    client.clerkId,
                    clientNames[client.id]
                  )
                }
                className="hidden rounded-md bg-white px-2.5 py-1.5 text-sm font-semibold text-gray-900 shadow-xs inset-ring inset-ring-gray-300 hover:bg-gray-50 sm:block"
              >
                Add Client<span className="sr-only">, {client.clerkId}</span>
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
