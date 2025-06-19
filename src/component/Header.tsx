import { Layout } from "antd";


const { Header } = Layout;

const AppHeader = () => {
  return (
    <Header
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "40px 20px",
        // backgroundColor: "linear-gradient(to right,rgb(113, 145, 141),rgb(140, 211, 204))",
        backgroundColor: "#E6F4EA",
        borderBottom: "2px solid rgba(0, 0, 0, 0.3)",// subtle green line
        // boxShadow: "0 2px 4px rgba(18, 5, 5, 0.02)",
      }}

    >
      <div className="flex items-center gap-3 py-8 text-black text-2xl font-bold">
        <img
          src="/redbulllogo.png"
          alt="Logo"
          className="w-24 h-24  mt-4"
        />
        <h1 className="text-2xl font-bold text-dark flex items-center gap-2">
            TradeBoard
          </h1>
      </div>
    </Header>
  );
};

export default AppHeader;
