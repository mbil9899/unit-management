"use client";

import { useEffect, useState } from "react";
import { getUsers } from "@/services/userService";

export default function UsersPage() {
  const [users, setUsers] = useState<any[]>([]);

  useEffect(() => {
    async function load() {
      setUsers(await getUsers());
    }

    load();
  }, []);

  return (
    <div>

      <div className="mb-6 flex items-center justify-between">

        <h1 className="text-3xl font-bold">
          System Users
        </h1>

      </div>

      <div className="overflow-hidden rounded-lg border bg-white">

        <table className="w-full">

          <thead className="bg-gray-100">

            <tr>

              <th className="p-3 text-left">Name</th>

              <th className="p-3 text-left">Appointment</th>

              <th className="p-3 text-left">Company</th>

              <th className="p-3 text-left">Role</th>

              <th className="p-3 text-left">Status</th>

            </tr>

          </thead>

          <tbody>

            {users.map((user) => (

              <tr
                key={user.id}
                className="border-t"
              >

                <td className="p-3">
                  {user.full_name}
                </td>

                <td className="p-3">
                  {user.appointments?.appointment_name}
                </td>

                <td className="p-3">
                  {user.companies?.name}
                </td>

                <td className="p-3">
                  {user.role}
                </td>

                <td className="p-3">
                  {user.status}
                </td>

              </tr>

            ))}

          </tbody>

        </table>

      </div>

    </div>
  );
}