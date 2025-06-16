import { Layout } from "antd";


const { Header } = Layout;

const AppHeader = () => {
  return (
    <Header
      style={{
        background: "lightblue",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "40px 20px",
      }}
    >
      <div className="flex items-center gap-3 py-8 text-black text-2xl font-bold">
        <img
          src="/market_data_logo.png"
          alt="Logo"
          className="w-28 h-28  "
        />
        Market Data
      </div>
    </Header>
  );
};

export default AppHeader;
