import React, { useEffect } from "react";
import "./Overview.css";
import { Bar, Pie } from "react-chartjs-2";
import Chart from "chart.js/auto";

const Overview = () => {
    const barData = {
        labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun"],
        datasets: [
            {
                label: "Revenue ($)",
                data: [5000, 7000, 6000, 8000, 10000, 7500],
                backgroundColor: "rgba(54, 162, 235, 0.6)",
            },
        ],
    };

    const pieData = {
        labels: ["Electronics", "Clothing", "Groceries", "Books"],
        datasets: [
            {
                label: "Category Sales",
                data: [40, 25, 20, 15],
                backgroundColor: ["#FF6384", "#36A2EB", "#FFCE56", "#4BC0C0"],
            },
        ],
    };

    const options = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            tooltip: {
                enabled: true,
                backgroundColor: "#333",
            },
            legend: {
                position: "top",
            },
        },
    };

    return (
        <div className="overview">
            <h1>Overview</h1>
            <div className="graphs-container">
                <div className="chart-container">
                    <h2>Monthly Revenue</h2>
                    <Bar data={barData} options={options} />
                </div>
                <div className="chart-container">
                    <h2>Category Sales</h2>
                    <Pie data={pieData} options={options} />
                </div>
            </div>
        </div>
    );
};

export default Overview;
