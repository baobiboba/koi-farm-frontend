import React, { useState, useEffect } from "react";
import AdminHeader from "../../layouts/header/AdminHeader";
import { fetchAllStaff } from "../../services/UserService";
import { fetchAllProducts } from "../../services/ProductService";
import { fetchOrder } from "../../services/OrderService";
import { fetchAllBlogs } from "../../services/BlogService";
import { fetchAllPayment } from "../../services/PaymentService";
import {
  BsFillArchiveFill,
  BsFillGrid3X3GapFill,
  BsPeopleFill,
  BsFillBellFill,
} from "react-icons/bs";
import { FaUsers, FaFish, FaShoppingCart, FaBlog } from "react-icons/fa";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell,
  PieChart,
  Pie,
} from "recharts";
import "./AdminDashboard.css";

const AdminDashboard = () => {
  const [staffCount, setStaffCount] = useState(0);
  const [productCount, setProductCount] = useState(0);
  const [orderCount, setOrderCount] = useState(0);
  const [blogCount, setBlogCount] = useState(0);
  const [chartData, setChartData] = useState([]);
  const [koiData, setKoiData] = useState([]);
  const [totalKoiQuantity, setTotalKoiQuantity] = useState(0);
  const [products, setProducts] = useState([]);
  const [paymentData, setPaymentData] = useState([]);
  const [activeTab, setActiveTab] = useState("overview");
  const [dateRange, setDateRange] = useState("all");
  const [paymentChartData, setPaymentChartData] = useState([]);
  const [monthlyPaymentData, setMonthlyPaymentData] = useState([]);
  const [orderData, setOrderData] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const staffResponse = await fetchAllStaff();
        setStaffCount(staffResponse.data.entities.length);

        const productResponse = await fetchAllProducts();
        setProductCount(productResponse.data.length);
        setProducts(productResponse.data);

        const orderResponse = await fetchOrder();
        setOrderData(orderResponse.data);

        const blogResponse = await fetchAllBlogs();
        setBlogCount(blogResponse.data.length);

        // Generate chart data based on product quantities
        const productChartData = productResponse.data
          .slice(0, 6)
          .map((product) => ({
            name: product.name,
            quantity: product.quantity,
          }));
        setChartData(productChartData);

        // Calculate total Koi quantity and prepare chart data
        let total = 0;
        const koiData = productResponse.data.map((product) => {
          total += product.quantity;
          return {
            name: product.name,
            value: product.quantity,
          };
        });
        setTotalKoiQuantity(total);
        setKoiData(koiData);

        // Fetch payment data
        const paymentResponse = await fetchAllPayment();
        console.log("Full Payment Response:", paymentResponse);
        const processedPaymentData = processPaymentData(paymentResponse.data);
        setPaymentData(processedPaymentData);

        // Prepare data for the monthly payment chart
        const monthlyData = prepareMonthlyPaymentData(paymentResponse.data);
        setMonthlyPaymentData(monthlyData);

        // Prepare data for the payment chart
        const chartData = preparePaymentChartData(processedPaymentData);
        setPaymentChartData(chartData);
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      }
    };

    fetchData();
  }, []);

  const COLORS = [
    "#0088FE",
    "#00C49F",
    "#FFBB28",
    "#FF8042",
    "#8884d8",
    "#82ca9d",
  ];

  // Function to process payment data for the chart
  const processPaymentData = (payments) => {
    if (!Array.isArray(payments)) {
      console.error("Expected an array of payments, received:", payments);
      return [];
    }

    return payments
      .map((payment) => ({
        id: payment.id,
        amount: payment.amount,
        date: new Date(payment.createdTime).toLocaleString(),
        method: payment.method,
        orderStatus: payment.order?.status || "N/A",
        paymentStatus: payment.status,
      }))
      .sort((a, b) => new Date(a.date) - new Date(b.date));
  };

  // New function to prepare data for the payment chart
  const preparePaymentChartData = (payments) => {
    const dailyTotals = payments.reduce((acc, payment) => {
      const date = payment.date;
      if (!acc[date]) {
        acc[date] = 0;
      }
      acc[date] += payment.amount;
      return acc;
    }, {});

    return Object.entries(dailyTotals)
      .map(([date, total]) => ({
        date,
        total,
      }))
      .sort((a, b) => new Date(a.date) - new Date(b.date));
  };

  const prepareMonthlyPaymentData = (payments) => {
    const monthlyTotals = payments.reduce((acc, payment) => {
      const date = new Date(payment.createdTime);
      const monthYear = `${date.getFullYear()}-${String(
        date.getMonth() + 1
      ).padStart(2, "0")}`;
      if (!acc[monthYear]) {
        acc[monthYear] = 0;
      }
      acc[monthYear] += payment.amount;
      return acc;
    }, {});

    return Object.entries(monthlyTotals)
      .map(([date, total]) => ({ date, total }))
      .sort((a, b) => new Date(a.date) - new Date(b.date));
  };

  const getMethodColor = (method) => {
    switch (method) {
      case "VnPay":
        return "#8884d8";
      // Add more cases for other payment methods
      default:
        return "#82ca9d";
    }
  };

  const filterData = (data) => {
    if (!Array.isArray(data) || dateRange === "all") {
      return data;
    }

    const now = new Date();
    const startDate = new Date();

    switch (dateRange) {
      case "month":
        startDate.setMonth(now.getMonth() - 1);
        break;
      case "week":
        startDate.setDate(now.getDate() - 7);
        break;
      case "day":
        startDate.setHours(0, 0, 0, 0);
        break;
      default:
        return data;
    }

    return data.filter((item) => {
      const itemDate = new Date(item.date || item.createdTime);
      return itemDate >= startDate && itemDate <= now;
    });
  };

  const getPaymentMethodData = (data) => {
    const methodCounts = data.reduce((acc, payment) => {
      acc[payment.method] = (acc[payment.method] || 0) + 1;
      return acc;
    }, {});

    return Object.entries(methodCounts).map(([name, value]) => ({ name, value }));
  };

  const renderOverviewTab = () => (
    <>
      <div className="dashboard-cards">
        <DashboardCard
          icon={<BsPeopleFill />}
          title="Staff"
          value={staffCount}
        />
        <DashboardCard
          icon={<BsFillArchiveFill />}
          title="Products"
          value={productCount}
        />
        <DashboardCard
          icon={<BsFillGrid3X3GapFill />}
          title="Orders"
          value={filterData(orderData).length}
        />
        <DashboardCard
          icon={<BsFillBellFill />}
          title="Blogs"
          value={blogCount}
        />
      </div>

      <div className="charts">
        <ChartCard title="Monthly Payment Totals">
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={filterData(monthlyPaymentData)}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Bar dataKey="total" fill="#8884d8" name="Monthly Total" />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
        <ChartCard title="Payment Totals">
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={filterData(paymentData)}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Line
                type="monotone"
                dataKey="amount"
                stroke="#8884d8"
                name="Payment Amount"
              />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>
    </>
  );

  const renderSalesTab = () => (
    <div className="sales-tab">
      <h2>Sales Overview</h2>
      <div className="charts">
        <ChartCard title="Daily Sales">
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={filterData(paymentChartData)}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Bar dataKey="total" fill="#8884d8" name="Daily Total" />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
        <ChartCard title="Payment Methods">
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={getPaymentMethodData(filterData(paymentData))}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={80}
                fill="#8884d8"
                label
              >
                {getPaymentMethodData(filterData(paymentData)).map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>
      <div className="sales-table">
        <h3>Recent Sales</h3>
        <table>
          <thead>
            <tr>
              <th>Date</th>
              <th>Amount</th>
              <th>Method</th>
              <th>Order Status</th>
              <th>Payment Status</th>
              <th>User ID</th>
              <th>Staff ID</th>
              <th>Address</th>
            </tr>
          </thead>
          <tbody>
            {paymentData.slice(0, 10).map((payment) => (
              <tr key={payment.id}>
                <td>{payment.date}</td>
                <td>${payment.amount}</td>
                <td>{payment.method}</td>
                <td>{payment.orderStatus}</td>
                <td>{payment.paymentStatus}</td>
                <td>{payment.userId}</td>
                <td>{payment.staffId}</td>
                <td>{payment.address}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderInventoryTab = () => (
    <div className="inventory-tab">
      <h2>Inventory Overview</h2>
      <div className="charts">
        <ChartCard title="Product Quantities">
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={filterData(chartData)}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="quantity" fill="#82ca9d" name="Quantity" />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
        <ChartCard title="Koi Distribution">
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={koiData}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={80}
                fill="#8884d8"
                label
              >
                {koiData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={COLORS[index % COLORS.length]}
                  />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>
      <div className="inventory-table">
        <h3>Low Stock Products</h3>
        <table>
          <thead>
            <tr>
              <th>Product Name</th>
              <th>Quantity</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {products
              .filter((product) => product.quantity < 10)
              .map((product) => (
                <tr key={product.id}>
                  <td>{product.name}</td>
                  <td>{product.quantity}</td>
                  <td>
                    {product.quantity === 0 ? "Out of Stock" : "Low Stock"}
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  return (
    <>
      <AdminHeader />
      <div className="admin-dashboard">
        <div className="dashboard-filters">
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
          >
            <option value="all">All Time</option>
            <option value="month">This Month</option>
            <option value="week">This Week</option>
            <option value="day">Today</option>
          </select>
        </div>
        <div className="dashboard-tabs">
          <button
            onClick={() => setActiveTab("overview")}
            className={activeTab === "overview" ? "active" : ""}
          >
            Overview
          </button>
          <button
            onClick={() => setActiveTab("sales")}
            className={activeTab === "sales" ? "active" : ""}
          >
            Sales
          </button>
          <button
            onClick={() => setActiveTab("inventory")}
            className={activeTab === "inventory" ? "active" : ""}
          >
            Inventory
          </button>
        </div>
        {activeTab === "overview" && renderOverviewTab()}
        {activeTab === "sales" && renderSalesTab()}
        {activeTab === "inventory" && renderInventoryTab()}
      </div>
    </>
  );
};

const DashboardCard = ({ icon, title, value }) => (
  <div className="dashboard-card">
    <div className="card-icon">{icon}</div>
    <div className="card-info">
      <h3>{title}</h3>
      <p>{value}</p>
    </div>
  </div>
);

const ChartCard = ({ title, children }) => (
  <div className="chart-card">
    <h3>{title}</h3>
    {children}
  </div>
);

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div
        className="custom-tooltip"
        style={{
          backgroundColor: "#fff",
          padding: "10px",
          border: "1px solid #ccc",
        }}
      >
        <p className="label">{`Date: ${label}`}</p>
        <p className="amount">{`Amount: $${payload[0].value.toFixed(2)}`}</p>
        <p className="method">{`Method: ${payload[0].payload.method}`}</p>
        <p className="status">{`Status: ${payload[0].payload.paymentStatus}`}</p>
      </div>
    );
  }
  return null;
};

export default AdminDashboard;
