import './DashboardPage.css';
import React, { useEffect, useState } from 'react';
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, LineElement, CategoryScale, LinearScale, PointElement } from 'chart.js';
import { CSVLink } from 'react-csv';
import axiosInstanceadmin from '../axios';
import { ToastContainer, toast } from 'react-toastify';
import { Page, Text, View, Document, PDFDownloadLink, StyleSheet } from '@react-pdf/renderer';

import 'react-toastify/dist/ReactToastify.css';

ChartJS.register(ArcElement, Tooltip, Legend, LineElement, CategoryScale, LinearScale, PointElement);


const styles = StyleSheet.create({
  page: {
    padding: 30,
    backgroundColor: '#f8f8f8',  // Light background for the PDF
  },
  section: {
    marginBottom: 20,
  },
  heading: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  text: {
    fontSize: 12,
    marginBottom: 5,
  },
  table: {
    display: 'table',
    width: '100%',
    marginTop: 10,
    borderStyle: 'solid',
    borderWidth: 1,
    borderColor: '#ccc',
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
    padding: 5,
  },
  tableCell: {
    width: '50%',  // Equal width for each cell
    padding: 5,
    fontSize: 12,
    borderRightWidth: 1,
    borderRightColor: '#ccc',
    textAlign: 'center',
  },
  tableHeader: {
    fontWeight: 'bold',
    backgroundColor: '#f0f0f0',
  },
});

const SalesReportPDF = ({ data }) => (
  <Document>
    <Page size="A4" style={styles.page}>
      <View style={styles.section}>
        <Text style={styles.heading}>Sales Report</Text>
        <Text style={styles.text}>Total Sales: {data.totalSales}</Text>
        <Text style={styles.text}>Total Orders: {data.totalorders}</Text>
        <Text style={styles.text}>Total Discounts: {data.totaldiscounts}</Text>
        <Text style={styles.text}>Net Amount: {data.netAmount}</Text>
      </View>
      
      <View style={styles.section}>
        <Text style={styles.heading}>Monthly Sales</Text>
        
        {/* Table Header */}
        <View style={[styles.tableRow, styles.tableHeader]}>
          <Text style={[styles.tableCell, { width: '50%' }]}>Month/Year</Text>
          <Text style={[styles.tableCell, { width: '50%' }]}>Total Sales</Text>
        </View>
        
        {/* Table Body */}
        <View style={styles.table}>
          {data.csvData.map(([monthYear, total], index) => (
            <View key={index} style={styles.tableRow}>
              <Text style={styles.tableCell}>{monthYear}</Text>
              <Text style={styles.tableCell}>{total}</Text>
            </View>
          ))}
        </View>
      </View>
    </Page>
  </Document>
);


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
  const [filter, setFilter] = useState('month'); // Default filter is "month"
  const [heading, setHeading] = useState('Monthly Sales');

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
      updateHeading()
    } catch (error) {
      toast.error(error.response.data.error || 'Error fetching sales data');
      console.error('Error fetching sales data:', error);
    }
  };

  const updateHeading = () => {
    switch (filter) {
      case 'year':
        setHeading('Yearly Sales');
        break;
      case 'month':
        setHeading('Monthly Sales');
        break;
      case 'week':
        setHeading('Weekly Sales');
        break;
      case 'today':
        setHeading('Today’s Sales');
        break;
      default:
        if (fromDate && toDate) {
          setHeading(`Sales from ${new Date(fromDate).toLocaleDateString()} to ${new Date(toDate).toLocaleDateString()}`);
        } else {
          setHeading('Custom Date Range');
        }
    }
  };



  useEffect(() => {
    fetchSalesData();
  }, [filter, fromDate, toDate]);
  console.log("sales data",salesData)


  const generateLineData = () => {
    // if (!salesData.monthlysales || salesData.monthlysales.length === 0) {
    //   <h2>{heading}</h2>
    //   return {
    //     labels: [],
    //     datasets: [{
    //       label: 'Sales',
    //       data: [],
    //       backgroundColor: '#FF6384',
    //       borderColor: '#FF6384',
    //       fill: false,
    //       tension: 0.4,  // Makes the line smoother
    //       pointRadius: 6, // Default point size
    //       pointHoverRadius: 10, // Point size on hover
    //     }]
    //   };
    // }
  
    const allSales = [];
  
    // Collect all sales data points
    salesData.monthlysales.forEach(saleGroup => {
      saleGroup.forEach(item => {
        // const month = item.month;
        // const year = item.year;
        const orderDate = new Date(item.date); 
        console.log("order date",orderDate)
        const total = item.total;
    
        allSales.push({ date: orderDate, total });
      });
    });
  

    allSales.sort((a, b) => a.date - b.date);
  
   
    const formattedLabels = allSales.map(item => {
      return item.date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
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
        {/* <button onClick={fetchSalesData}>Apply Custom Range</button> */}
        <PDFDownloadLink document={<SalesReportPDF data={{ ...salesData, csvData }} />} fileName="sales_report.pdf">
          {({ loading }) => <button>{loading ? 'Loading PDF...' : 'Download PDF'}</button>}
        </PDFDownloadLink>

        <CSVLink data={csvData} filename="sales_report.csv">
          <button>Download CSV</button>
        </CSVLink>
      </div>


      <div className="card-container">
          <div className="card">
            <h2>Total Sales</h2>
            <p>{salesData.totalSales}</p>
          </div>
          <div className="card">
            <h2>Net Amount</h2>
            <p>{salesData.netAmount}</p>
          </div>
          <div className="card">
            <h2>Discount and Coupon Price</h2>
            <p>{salesData.totaldiscounts}</p>
          </div>
          <div className='card'>
            <h2>Total Orders</h2>
            <p>{salesData.totalorders}</p>
          </div>
        </div>

      <div className="sales-chart">
        <h2>{heading}</h2>
        <Line
          data={lineData}
          options={{
            responsive: true,
            plugins: {
              legend: { display: true },
            },
            scales: {
              x: {
                title: {
                  display: true,
                  text: 'Date',
                },
              },
              y: {
                title: {
                  display: true,
                  text: 'Sales Price',
                },
              },
            },
          }}
        />
      </div>

      <ToastContainer />
    </div>
  );
};

export default DashboardPage;
