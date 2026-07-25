"use client";

import { useEffect, useState } from "react";
import { getUsers } from "@/services/userService";

export default function UsersPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [search, setSearch] = useState("");

  useEffect(() => {
    async function load() {
      const data = await getUsers();
      setUsers(data);
    }

    load();
  }, []);

  const filtered = users.filter((u) =>
    u.full_name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-6">

      <div className="flex justify-between items-center mb-6">

        <div>
          <h1 className="text-3xl font-bold">
            User Management
          </h1>

          <p className="text-gray-500">
            Manage application users.
          </p>
        </div>

        <button className="bg-emerald-700 text-white px-5 py-2 rounded">
          + Add User
        </button>

      </div>

      <input
        className="border rounded-lg p-3 w-full mb-6"
        placeholder="Search User..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      <div className="rounded-lg border bg-white shadow">

        <table className="w-full">

          <thead className="bg-gray-100">

            <tr>

              <th className="p-3 text-left">Name</th>
              <th className="p-3 text-left">Role</th>
              <th className="p-3 text-left">Company</th>

            </tr>

          </thead>

          <tbody>

            {filtered.map((user) => (

              <tr
                key={user.id}
                className="border-t hover:bg-gray-50"
              >

                <td className="p-3">
                  {user.full_name}
                </td>

                <td className="p-3">
                  {user.role}
                </td>

                <td className="p-3">
                  {user.companies?.name || "-"}
                </td>

              </tr>

            ))}

          </tbody>

        </table>

      </div>

    </div>
  );
}