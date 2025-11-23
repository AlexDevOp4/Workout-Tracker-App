import { useEffect, useState } from 'react';
import { getUsers, createUser } from '../../api/users';

export default function UsersPage() {
  const [users, setUsers] = useState([]);
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('TRAINER');
  const [username, setUserName] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchUsers() {
      try {
        const res = await getUsers();
        setUsers(res.users || []); // fallback to empty array if undefined
        console.log(res.users)
      } catch (error) {
        console.error('Failed to fetch users:', error);
      } finally {
        setIsLoading(false);
      }
    }
    fetchUsers();
  }, []);

  async function handleSubmit(e) {
    e.preventDefault();
    try {
      const newUser = await createUser({ email, role, username, password });
      setUsers((prev) => [...prev, newUser.user]);
      setEmail('');
      setUserName('');
      setPassword('');
    } catch (error) {
      console.error('Failed to create user:', error);
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-gray-700 text-lg font-medium">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-full flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-md bg-white shadow-2xl rounded-2xl p-8">
        <h2 className="text-2xl font-semibold text-gray-800 mb-6 text-center">
          Add User
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email"
            required
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-600 focus:outline-none"
          />

          <input
            type="text"
            value={username}
            onChange={(e) => setUserName(e.target.value)}
            placeholder="Username"
            required
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-600 focus:outline-none"
          />

          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            required
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-600 focus:outline-none"
          />

          <select
            value={role}
            onChange={(e) => setRole(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-600 focus:outline-none"
          >
            <option value="TRAINER">TRAINER</option>
            <option value="CLIENT">CLIENT</option>
          </select>

          <button
            type="submit"
            className="w-full cursor-pointer bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-md font-medium transition"
          >
            Add User
          </button>
        </form>

        <ul className="mt-8 divide-y divide-gray-200">
          {users.map((u) => (
            <li key={u.id} className="py-2 text-gray-700">
              <span className="font-medium">{u.email}</span> — {u.role}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
