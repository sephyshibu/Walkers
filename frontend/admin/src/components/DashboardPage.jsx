import './DashboardPage.css';
import React, { useEffect, useState } from 'react';
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, LineElement, CategoryScale, LinearScale, PointElement } from 'chart.js';
import { CSVLink } from 'react-csv';
import axiosInstanceadmin from '../axios';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

ChartJS.register(ArcElement, Tooltip, Legend, LineElement, CategoryScale, LinearScale, PointElement);

const DashboardPage = () => {
  const [salesData, setSalesData] = useState({
    totalSales: 0,
    netAmount: 0,
    totalorders: 0,
    totaldiscounts: 0,
    monthlysales: [],
  });
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [filter, setFilter] = useState(''); // Default filter is "month"

  const fetchSalesData = async () => {
    try {
      const response = await axiosInstanceadmin.get('/salesreport', {
        params: {
          fromDate: fromDate ? new Date(fromDate).toISOString() : undefined,
          toDate: toDate ? new Date(toDate).toISOString() : undefined,
          filter,
        },
      });
      setSalesData(response.data);
      
    } catch (error) {
      toast.error(error.response.data.message || 'Error fetching sales data');
      console.error('Error fetching sales data:', error);
    }
  };

  useEffect(() => {
    fetchSalesData();
  }, [filter, fromDate, toDate]);
  console.log("sales data",salesData)
  const generateLineData = () => {
    if (!salesData.monthlysales || salesData.monthlysales.length === 0) {
      return {
        labels: [],
        datasets: [{
          label: 'Sales',
          data: [],
          backgroundColor: '#FF6384',
          borderColor: '#FF6384',
          fill: false,
          tension: 0.4,  // Makes the line smoother
        }]
      };
    }
  
    const allSales = [];
  
    // Collect all sales data points
    salesData.monthlysales.forEach(saleGroup => {
      saleGroup.forEach(item => {
        const month = item.month;
        const year = item.year;
        const total = item.total;
        const key = `${month}/${year}`;
        
        // Store each sale as an individual data point
        allSales.push({ key, total, month, year });
      });
    });
  
    // Sort all sales by month/year to ensure proper plotting order
    allSales.sort((a, b) => {
      if (a.year === b.year) {
        return a.month - b.month;
      } else {
        return a.year - b.year;
      }
    });
  
    // Create labels (unique month/year format) for x-axis
    const formattedLabels = allSales.map(item => {
      const monthNames = [
        "January", "February", "March", "April", "May", "June", "July", "August", 
        "September", "October", "November", "December"
      ];
      return `${monthNames[item.month - 1]} ${item.year}`;
    });
  
    // Create the sales data for y-axis (one total for each sale)
    const groupedData = allSales.map(item => item.total);
  
    return {
      labels: formattedLabels,  // Labels for the x-axis
      datasets: [
        {
          label: 'Sales',
          backgroundColor: '#FF6384',
          borderColor: '#FF6384',
          data: groupedData,  // Sales totals for each individual sale
          fill: false,
          tension: 0.4,  // Smooth line curve
        },
      ],
    };
  };
  
  const lineData = generateLineData();
  
  // Preparing the CSV data for export
  const csvData = [
    ['Month/Year', 'Total Sales'],
    ...lineData.labels.map((label, index) => [label, lineData.datasets[0].data[index]]),
    ['', ''],
    ['Total Sales', salesData.totalSales],
    ['Total Orders', salesData.totalorders],
    ['Total Discounts', salesData.totaldiscounts],
    ['Net Amount', salesData.netAmount],
  ];
  
  return (
    <div className="dashboard-page">
      <div className="filters">
        <button onClick={() => setFilter('year')}>Yearly</button>
        <button onClick={() => setFilter('month')}>Monthly</button>
        <button onClick={() => setFilter('today')}>Today</button>
        <button onClick={() => setFilter('week')}>This Week</button>

        {/* Custom Date Range */}
        <input
          type="date"
          value={fromDate}
          onChange={(e) => setFromDate(e.target.value)}
        />
        <input
          type="date"
          value={toDate}
          onChange={(e) => setToDate(e.target.value)}
        />
        <button onClick={fetchSalesData}>Apply Custom Range</button>

        <CSVLink data={csvData} filename="sales_report.csv">
          <button>Download CSV</button>
        </CSVLink>
      </div>

      <div className="dashboard-stats">
        <div>Total Sales: {salesData.totalSales}</div>
        <div>Total Orders: {salesData.totalorders}</div>
        <div>Total Discounts: {salesData.totaldiscounts}</div>
        <div>Net Amount: {salesData.netAmount}</div>
      </div>

      <div className="sales-chart">
        <Line data={lineData} />
      </div>

      <ToastContainer />
    </div>
  );
};

export default DashboardPage;
