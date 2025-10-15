import { DashboardJobs } from "@/components/bi";

export default function BiJobsDemo() {
  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Jobs By Component BI Dashboard - Demo</h1>
      
      <div className="grid grid-cols-1 gap-4">
        <DashboardJobs />
      </div>
      
      <div className="mt-6 p-4 bg-slate-100 rounded-lg">
        <h2 className="text-lg font-semibold mb-2">📋 About This Dashboard</h2>
        <p className="text-sm text-slate-700">
          This dashboard displays completed maintenance jobs aggregated by component, 
          showing both job count and average completion duration. The data is fetched 
          from the <code className="bg-slate-200 px-1 rounded">/api/bi/jobs-by-component</code> endpoint.
        </p>
      </div>
    </div>
  );
}
