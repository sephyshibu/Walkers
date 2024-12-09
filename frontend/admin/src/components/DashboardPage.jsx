import './DashboardPage.css';
import React from 'react';
import { Pie, Line } from 'react-chartjs-2'; // Import Line for the line chart
import { Chart as ChartJS, ArcElement, Tooltip, Legend, LineElement, CategoryScale, LinearScale, PointElement } from 'chart.js';



// Register required components for Chart.js, including the PointElement
ChartJS.register(ArcElement, Tooltip, Legend, LineElement, CategoryScale, LinearScale, PointElement);


const DashboardPage = () => {
  
  
  const pieData = {
    labels: ['Solar Panels', 'Invertors', 'Battery Chargers'],
    datasets: [
      {
        data: [300, 150, 100],
        backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56'],
      },
    ],
  };

  const lineData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May'],
    datasets: [
      {
        label: 'Sales',
        backgroundColor: '#FF6384',
        borderColor: '#FF6384',
        data: [65, 59, 80, 81, 95],
        fill: false,  // Ensure the line doesn't fill under it
        tension: 0.1, // Smooth out the line
      },
    ],
  };

  return (
    <div className="dashboard-page">
      {/* Cards Section */}
      <div className="cards">
        <div className="card card-red">
          <h3>Total Income</h3>
          <p>Rs.50,000</p>
        </div>
        <div className="card card-blue">
          <h3>Annual Sales</h3>
          <p>R120,000</p>
        </div>
        <div className="card card-green">
          <h3>Total Users</h3>
          <p>1,200</p>
        </div>
      </div>
      
      {/* Graphs Section - Center Pie and Line Chart */}
      <div className="charts">
        <div className="chart line-chart">
          <h3>Monthly Sales</h3>
          <Line data={lineData} />
        </div>
        <div className="chart pie-chart">
          <h3>Category Breakdown</h3>
          <Pie data={pieData} />
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
