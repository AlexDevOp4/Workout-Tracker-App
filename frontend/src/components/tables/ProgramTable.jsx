import { useEffect, useState } from "react";
import { getPrograms } from "../../api/programs";
import { getUserByClerkId } from "../../api/users";
import { Link, useParams } from "react-router-dom";
export default function ProgramTable() {
  const { clientId } = useParams();
  const [programs, setPrograms] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchPrograms() {
      try {
        const userClerk = await getUserByClerkId(clientId);
        const res = await getPrograms(userClerk[0].clientProfile["id"]);
        console.log(res);
        setPrograms(res || []); // fallback to empty array if undefined
      } catch (error) {
        console.error("Failed to fetch users:", error);
      } finally {
        setIsLoading(false);
      }
    }
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
        <ul className="list bg-base-100 rounded-box shadow-md mt-12">
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
                    View
                  </Link>
              
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
