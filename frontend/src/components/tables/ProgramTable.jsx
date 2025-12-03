import { useEffect, useState } from "react";
import { getPrograms, softDeleteProgram } from "../../api/programs";
import { getUserByClerkId } from "../../api/users";
import { Link, useParams } from "react-router-dom";
import { FaTrashCan, FaEye } from "react-icons/fa6";
export default function ProgramTable() {
  const { clientId } = useParams();
  const [programs, setPrograms] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchPrograms = async () => {
    try {
      const userClerk = await getUserByClerkId(clientId);
      const res = await getPrograms(userClerk[0].clientProfile["id"]);
      const activePrograms = res.filter(
        (program) => program.status === "active"
      );
      setPrograms(activePrograms || []);
    } catch (error) {
      console.error("Failed to fetch users:", error);
    } finally {
      setIsLoading(false);
    }
  };
  useEffect(() => {
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
    <div>
      {" "}
      <div className="container mx-auto">
        <ul className="list bg-base-100 rounded-box shadow-md mt-8">
          {programs.length != null ? (
            programs.map((x) => (
              <li key={x.id} className="list-row">
                <div></div>
                <div>
                  <div className="font-bold">{x.title}</div>
                  <div className="text-xs  font-semibold opacity-60">
                    {x.email}
                  </div>
                </div>
                <div>
                  <Link
                    className="btn btn-square btn-ghost"
                    key={x.id}
                    to={`/program/${x.id}`}
                  >
                    <FaEye />
                  </Link>
                </div>
                <div>
                  <button
                    className="btn btn-square btn-ghost"
                    onClick={async () => {
                      const deleteProgram = confirm(
                        `Would you like to delete ${x.title}?`
                      );

                      try {
                        if (deleteProgram) {
                          const programDelete = await softDeleteProgram(x.id);
                          console.log(
                            `Program ${x.title} successfully archived`,
                            programDelete
                          );
                          alert(`Program ${x.title} has been deleted.`);
                          fetchPrograms();
                        }
                      } catch (error) {
                        console.log(error);
                        alert(`Error Deleting ${x.title}!`);
                      }
                    }}
                  >
                    <FaTrashCan />
                  </button>
                </div>
              </li>
            ))
          ) : (
            <li className="list-row">
              <div className="mt-2">isn't assigned to a trainer</div>
              <div>
                <div></div>
                <div></div>
              </div>
            </li>
          )}
        </ul>
      </div>
    </div>
  );
}
