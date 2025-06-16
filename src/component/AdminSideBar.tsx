import React, { useState } from "react";
import { Layout, Menu } from "antd";
import {
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  
} from "@ant-design/icons";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  KeyIcon,
  LayoutDashboardIcon,
  LogOutIcon,
  MarsStrokeIcon,
  SettingsIcon,
  SubscriptIcon,
  User2Icon,
} from "lucide-react";
// import { useDispatch } from "react-redux";
// import { logout } from "../redux/slices/userSlice";
import { LOCAL_STORAGE } from "../Constants/STORAGE";
import { removeLocalStorage } from "../utils/helpers/localStorageHelper";
import { toast } from "react-toastify";

const { Sider } = Layout;

const AdminSideBar: React.FC = () => {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  // const dispatch = useDispatch();

  const toggleCollapsed = () => {
    setCollapsed(!collapsed);
  };

  const handleLogout = () => {
    // Clear Redux state
    // dispatch(logout());
    
    // Clear localStorage
    removeLocalStorage(LOCAL_STORAGE.TOKEN);
    removeLocalStorage(LOCAL_STORAGE.USER_ID);
    removeLocalStorage("user_email");
    
    // Show success message
    toast.success("Logged out successfully");
    
    // Redirect to login page
    navigate("/");
  };

  return (
    <Sider
      collapsible
      collapsed={collapsed}
      trigger={null}
      width={300}
      style={{
        background: "#fff",
        color: "black",
        paddingTop: 20,
        borderRight: "1px solid #f0f0f0",
      }}
    >
      <div className="flex items-center justify-between p-4">
        {!collapsed && (
          <h1 className="text-lg font-bold text-black flex items-center gap-2">
            MarketData
          </h1>
        )}
        <button
          onClick={toggleCollapsed}
          className="text-blue-600 hover:text-blue-800 text-lg"
        >
          {collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
        </button>
      </div>

      <Menu
        theme="light"
        mode="inline"
        selectedKeys={[location.pathname]}
        items={[
          {
            key: "/admin",
            icon: <LayoutDashboardIcon />,
            label: <Link to="/admin">Dashboard</Link>,
          },
          {
            key: "/admin/user",
            icon: <User2Icon />,
            label: <Link to="/admin/user">Users</Link>,
          },
          {
            key: "/admin/script",
            icon: <SubscriptIcon />,
            label: <Link to="/admin/script">Script</Link>,
          },
          {
            key: "/admin/share",
            icon: <MarsStrokeIcon />,
            label: <Link to="/admin/share">Share</Link>,
          },
          {
            key: "settings",
            icon: <SettingsIcon />,
            label: "Settings",
            children: [
              {
                key: "/reset-password",
                icon: <KeyIcon />,
                label: <Link to="/admin/reset-password">Reset Password</Link>,
              },
              {
                key: "/logout",
                icon: <LogOutIcon />,
                label: <span onClick={handleLogout}>Logout</span>,
              },
            ],
          },
        ]}
      />
    </Sider>
  );
};

export default AdminSideBar;
