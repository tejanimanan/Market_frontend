import React, { useEffect, useState } from "react";
import CounterCard from "../component/CounterCard";
import DashboardChart from "../component/DashboardChart";
import { User, Share2, SubscriptIcon } from "lucide-react";
import { getAllUsersCount } from "../services/dashboardService";

const AdminDashboard: React.FC = () => {
  const [counts, setCounts] = useState({ users: 0, scripts: 0, shareData: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCounts = async () => {
      setLoading(true);
      try {
        const result = await getAllUsersCount();
        if (result) {
          setCounts({
            users: result.users || 0,
            scripts: result.scripts || 0,
            shareData: result.shareData || 0,
          });
        }
      } catch (error) {
        setCounts({ users: 0, scripts: 0, shareData: 0 });
      } finally {
        setLoading(false);
      }
    };
    fetchCounts();
  }, []);

  return (
    <div className="p-6 space-y-6 rounded-xl" style={{background:"#2E8B57"}}>
      <h1 className="text-2xl font-bold">Dashboard</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <CounterCard title="Users" count={loading ? 0 : counts.users} icon={<User />} />
        <CounterCard title="Script" count={loading ? 0 : counts.scripts} icon={<SubscriptIcon />} />
        <CounterCard title="Share" count={loading ? 0 : counts.shareData} icon={<Share2 />} />
      </div>

      <DashboardChart />
    </div>
  );
};

export default AdminDashboard;
