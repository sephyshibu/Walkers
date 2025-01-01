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
  const [period, setPeriod] = useState(''); // Track selected period (day, week, month, year)

  // const fetchSalesData = async () => {
  //   try {
  //     const response = await axiosInstanceadmin.get('/salesreport', {
  //       params: { fromDate, toDate, period }, // Send period along with fromDate and toDate
  //     });
  //     setSalesData(response.data);
  //   } catch (error) {
  //     console.error('Error fetching sales data:', error);
  //   }
  // };

  const fetchSalesData = async () => {
    try {
        const response = await axiosInstanceadmin.get('/salesreport', {
            params: {
                fromDate: fromDate ? new Date(fromDate).toISOString() : undefined,
                toDate: toDate ? new Date(toDate).toISOString() : undefined,
                period,
            },
        });
        setSalesData(response.data);
    } catch (error) {
        console.error('Error fetching sales data:', error);
    }
};
  
  useEffect(() => {
    fetchSalesData();
  }, [fromDate, toDate, period]); // Trigger fetch when period changes

  const generateLineData = () => {
    const monthlyLabels = salesData.monthlysales?.map((item) => `${item.month}/${item.year}`) || [];
    const monthlyValues = salesData.monthlysales?.map((item) => item.total) || [];
    if (monthlyLabels.length === 0 || monthlyValues.length === 0) {
      return {
        labels: ['No Data'],
        datasets: [{
          label: 'Sales',
          data: [0],
          backgroundColor: '#FF6384',
          borderColor: '#FF6384',
          fill: false,
          tension: 0.1,
        }]
      };
    }
    if (fromDate && toDate && new Date(fromDate).toISOString() === new Date(toDate).toISOString()) {
      return {
          labels: ['Selected Date'],
          datasets: [
              {
                  label: 'Sales',
                  backgroundColor: '#FF6384',
                  borderColor: '#FF6384',
                  data: [salesData.totalSales],
                  fill: false,
                  tension: 0.1,
              },
          ],
      };
  }
  
    // Adjust the line data based on the period selected
    if (period === 'today') {
      // If period is day, show sales data for the current day
      return {
        labels: ['Today'],
        datasets: [
          {
            label: 'Sales',
            backgroundColor: '#FF6384',
            borderColor: '#FF6384',
            data: [salesData.totalSales], // Total sales for today
            fill: false,
            tension: 0.1,
          },
        ],
      };
    } else if (period === 'week') {
      // If period is week, show sales data for the current week
      return {
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
    } else if (period === 'month') {
      // If period is month, show sales data for the current month
      return {
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
    } else if (period === 'year') {
      // If period is year, show sales data for the current year
      return {
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
    } else if (fromDate && toDate) {
      // For custom date range, show sales data within the selected date range
      const customLabels = salesData.monthlysales?.map((item) => `${item.month}/${item.year}`) || [];
      const customValues = salesData.monthlysales?.map((item) => item.total) || [];
      
      return {
        labels: customLabels,
        datasets: [
          {
            label: 'Sales',
            backgroundColor: '#FF6384',
            borderColor: '#FF6384',
            data: customValues,
            fill: false,
            tension: 0.1,
          },
        ],
      };
    }

    return {}; // Default empty data if nothing is selected
  };

  const lineData = generateLineData(); // Generate dynamic line data based on the selected period

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
        
        {/* Add Period Filter */}
        <label>
          Period:
          <select value={period} onChange={(e) => setPeriod(e.target.value)}>
            <option value="">Select Period</option>
            <option value="today">Today</option>
            <option value="week">This Week</option>
            <option value="month">This Month</option>
            <option value="year">This Year</option>
          </select>
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
          <h3>{period ? `${period.charAt(0).toUpperCase() + period.slice(1)} Sales` : 'Sales Data'}</h3>
          <Line data={lineData} />
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
