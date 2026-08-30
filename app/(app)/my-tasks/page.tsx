"use client";

export default function MyTasksPage() {
  return (
    <div className="mx-auto max-w-7xl space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">My Tasks</h1>
          <p className="text-sm text-gray-500 mt-1">
            Tasks specifically assigned to you will appear here.
          </p>
        </div>
      </div>

      {/* Blank State Placeholder */}
      <div className="mt-8 rounded-2xl border border-gray-200 bg-white p-16 shadow-sm flex flex-col items-center justify-center text-center">
        <div className="w-20 h-20 bg-blue-50 text-blue-500 rounded-full flex items-center justify-center text-3xl mb-5">
          <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
        </div>
        <h3 className="text-xl font-bold text-gray-900">No tasks loaded yet</h3>
        <p className="text-sm text-gray-500 mt-2 max-w-md">
          This page is currently blank. It will be configured to show tasks assigned directly to your personnel profile.
        </p>
      </div>
    </div>
  );
}