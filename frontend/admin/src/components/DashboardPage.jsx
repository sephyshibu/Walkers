import './DashboardPage.css';
import React, { useEffect, useState } from 'react';
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, LineElement, CategoryScale, LinearScale, PointElement } from 'chart.js';
import { CSVLink } from 'react-csv';
import axiosInstanceadmin from '../axios';

ChartJS.register(ArcElement, Tooltip, Legend, LineElement, CategoryScale, LinearScale, PointElement);

const DashboardPage = () => {
  const [salesData, setSalesData] = useState({
    totalSales: 0,
    totalorders: 0,
    monthlysales: [],
  });
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');

  const fetchSalesData = async () => {
    try {
      const response = await axiosInstanceadmin.get('salesreport', {
        params: { fromDate, toDate },
      });
      setSalesData(response.data);
    } catch (error) {
      console.error('Error fetching sales data:', error);
    }
  };

  useEffect(() => {
    fetchSalesData();
  }, [fromDate, toDate]);

  const monthlyLabels = salesData.monthlysales?.map((item) => `${item.month}/${item.year}`) || [];
  const monthlyValues = salesData.monthlysales?.map((item) => item.total) || [];
  const lineData = {
    labels: monthlyLabels,
    datasets: [
      {
        label: 'Sales',
        backgroundColor: '#FF6384',
        borderColor: '#FF6384',
        data: monthlyValues,
        fill: false,
        tension: 0.1,
      },
    ],
  };

  const csvData = [
    ['Month/Year', 'Total Sales'],
    ...salesData.monthlysales.map(item => [`${item.month}/${item.year}`, item.total]),
    ['', ''],
    ['Total Sales', salesData.totalSales],
    ['Total Orders', salesData.totalorders]
  ];

  return (
    <div className="dashboard-page">
      {/* Filter Section */}
      <div className="filters">
        <label>
          From Date:
          <input
            type="date"
            value={fromDate}
            onChange={(e) => setFromDate(e.target.value)}
          />
        </label>
        <label>
          To Date:
          <input
            type="date"
            value={toDate}
            onChange={(e) => setToDate(e.target.value)}
          />
        </label>
        <button onClick={fetchSalesData}>Apply Filters</button>
        <CSVLink data={csvData} filename="sales_report.csv">
          <button>Download Sales Report</button>
        </CSVLink>
      </div>

      {/* Cards Section */}
      <div className="cards">
        <div className="card card-red">
          <h3>Total Sales</h3>
          <p>Rs.{salesData.totalSales}</p>
        </div>
        <div className="card card-blue">
          <h3>Total Orders</h3>
          <p>{salesData.totalorders}</p>
        </div>
      </div>

      {/* Graphs Section */}
      <div className="charts">
        <div className="chart line-chart">
          <h3>Monthly Sales</h3>
          <Line data={lineData} />
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;

