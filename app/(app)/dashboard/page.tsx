"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { getDashboardStats } from "@/services/dashboardService";

export default function DashboardPage() {
  const [stats, setStats] = useState({
    personnel: 0,
    companies: 0,
    users: 0,
    activeTasks: 0,
  });

  useEffect(() => {
    async function load() {
      const data = await getDashboardStats();
      setStats(data);
    }

    load();
  }, []);

  const cards = [
    {
      title: "Personnel",
      value: stats.personnel,
      color: "bg-blue-600",
      link: "/personnel",
    },
    {
      title: "Active Tasks",
      value: stats.activeTasks,
      color: "bg-orange-600",
      link: "/tasks",
    },
    {
      title: "Companies",
      value: stats.companies,
      color: "bg-green-600",
      link: "/settings",
    },
    {
      title: "Users",
      value: stats.users,
      color: "bg-purple-600",
      link: "/users",
    },
  ];

  return (
    <div className="space-y-8">

      <div>
        <h1 className="text-3xl font-bold text-gray-900">
          BANRDB-9
        </h1>

        <p className="text-gray-600 mt-2">
          Personnel & Task Management System
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-4">

        {cards.map((card) => (
          <Link
            key={card.title}
            href={card.link}
            className={`${card.color} rounded-xl p-6 text-white shadow transition hover:scale-105`}
          >
            <p className="text-sm opacity-80">
              {card.title}
            </p>

            <h2 className="mt-2 text-4xl font-bold">
              {card.value}
            </h2>
          </Link>
        ))}

      </div>

      <div className="rounded-xl border bg-white p-6 shadow">

        <h2 className="mb-4 text-xl font-semibold">
          Quick Actions
        </h2>

        <div className="flex flex-wrap gap-4">

          <Link
            href="/personnel/add"
            className="rounded bg-emerald-700 px-5 py-3 text-white hover:bg-emerald-800"
          >
            Add Personnel
          </Link>

          <Link
            href="/tasks"
            className="rounded bg-blue-700 px-5 py-3 text-white hover:bg-blue-800"
          >
            Assign Task
          </Link>

          <Link
            href="/users"
            className="rounded bg-purple-700 px-5 py-3 text-white hover:bg-purple-800"
          >
            Manage Users
          </Link>

          <Link
            href="/reports"
            className="rounded bg-gray-700 px-5 py-3 text-white hover:bg-gray-800"
          >
            Reports
          </Link>

        </div>

      </div>

    </div>
  );
}