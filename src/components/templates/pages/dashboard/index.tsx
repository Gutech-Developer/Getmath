import React from "react";

/**
 * DashboardPageTemplate
 * Reusable static dashboard page structure.
 * Replace the static stat values and cards with real data hooks as needed.
 */

const stats = [
  { label: "Total Users", value: "0", description: "Registered users" },
  { label: "Active Sessions", value: "0", description: "This month" },
  { label: "Pending Tasks", value: "0", description: "Awaiting action" },
  { label: "Completed", value: "0", description: "All time" },
];

const DashboardPageTemplate = () => {
  return (
    <div className="w-full flex flex-col gap-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-semibold text-neutral-02">Dashboard</h1>
        <p className="text-sm text-grey mt-1">
          Welcome back! Here&apos;s an overview of your data.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="bg-white border border-grey-stroke rounded-xl p-5 flex flex-col gap-2"
          >
            <p className="text-sm text-grey font-medium">{stat.label}</p>
            <p className="text-3xl font-semibold text-neutral-02">{stat.value}</p>
            <p className="text-xs text-grey">{stat.description}</p>
          </div>
        ))}
      </div>

      {/* Content Placeholder */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-white border border-grey-stroke rounded-xl p-5 min-h-[200px] flex items-center justify-center">
          <p className="text-grey text-sm">Chart / Content Area</p>
        </div>
        <div className="bg-white border border-grey-stroke rounded-xl p-5 min-h-[200px] flex items-center justify-center">
          <p className="text-grey text-sm">Recent Activity / List</p>
        </div>
      </div>
    </div>
  );
};

export default DashboardPageTemplate;
