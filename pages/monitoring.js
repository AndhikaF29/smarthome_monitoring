import { useState, useEffect } from 'react';
import styles from '../styles/Monitoring.module.css';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';

// Registrasi komponen Chart.js
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

export default function Monitoring() {
    const [data, setData] = useState({
        temperature: 0,
        humidity: 0,
        water_level: 0,
        distance: 0
    });
    const [historicalData, setHistoricalData] = useState({
        labels: [],
        temperature: [],
        humidity: [],
        water_level: []
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await fetch('https://api-smarthome.vercel.app/sensor/get');
                const result = await response.json();
                const latestData = result.data[0];
                setData(latestData);

                // Update historical data
                setHistoricalData(prev => ({
                    labels: [...prev.labels, new Date().toLocaleTimeString()].slice(-10),
                    temperature: [...prev.temperature, latestData.temperature].slice(-10),
                    humidity: [...prev.humidity, latestData.humidity].slice(-10),
                    water_level: [...prev.water_level, latestData.water_level].slice(-10)
                }));

                setLoading(false);
            } catch (error) {
                console.error('Error fetching data:', error);
                setLoading(false);
            }
        };

        fetchData();
        const interval = setInterval(fetchData, 5000);
        return () => clearInterval(interval);
    }, []);

    const chartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: 'top',
            },
        },
        scales: {
            y: {
                beginAtZero: true
            }
        }
    };

    const chartData = {
        labels: historicalData.labels,
        datasets: [
            {
                label: 'Temperature (°C)',
                data: historicalData.temperature,
                borderColor: 'rgb(255, 99, 132)',
                backgroundColor: 'rgba(255, 99, 132, 0.5)',
                tension: 0.4
            },
            {
                label: 'Humidity (%)',
                data: historicalData.humidity,
                borderColor: 'rgb(53, 162, 235)',
                backgroundColor: 'rgba(53, 162, 235, 0.5)',
                tension: 0.4
            },
            {
                label: 'Water Level (cm)',
                data: historicalData.water_level,
                borderColor: 'rgb(75, 192, 192)',
                backgroundColor: 'rgba(75, 192, 192, 0.5)',
                tension: 0.4
            }
        ]
    };

    const SensorCard = ({ title, value, unit, colorClass }) => {
        // Menghitung persentase untuk arc
        const percentage = (value / 100) * 180; // 180 derajat untuk setengah lingkaran

        return (
            <div className={`${styles.card} ${styles[colorClass]}`}>
                <div className={styles.gaugeContainer}>
                    <div className={styles.gauge}>
                        <div 
                            className={styles.gaugeValue} 
                            style={{ 
                                transform: `rotate(${percentage}deg)`,
                                background: `conic-gradient(
                                    ${styles[`${colorClass}Gradient`]} ${percentage}deg,
                                    rgba(255, 255, 255, 0.1) ${percentage}deg
                                )`
                            }}
                        />
                        <div className={styles.gaugeCenter}>
                            <span className={styles.number}>{value}</span>
                            <span className={styles.unit}>{unit}</span>
                        </div>
                    </div>
                </div>
                <h2 className={styles.cardTitle}>{title}</h2>
            </div>
        );
    };

    if (loading) {
        return (
            <div className={styles.loading}>
                <div className={styles.spinner}></div>
            </div>
        );
    }

    return (
        <div className={styles.container}>
            <h1 className={styles.title}>Smart Home Monitoring</h1>
            
            <div className={styles.cardContainer}>
                <SensorCard
                    title="Temperature"
                    value={data.temperature}
                    unit="°C"
                    colorClass="temperature"
                />
                <SensorCard
                    title="Humidity"
                    value={data.humidity}
                    unit="%"
                    colorClass="humidity"
                />
                <SensorCard
                    title="Water Level"
                    value={data.water_level}
                    unit="cm"
                    colorClass="waterLevel"
                />
            </div>

            <div className={styles.chartContainer}>
                <Line options={chartOptions} data={chartData} height={300} />
            </div>

            <div className={styles.lastUpdate}>
                Last updated: {new Date().toLocaleTimeString()}
            </div>
        </div>
    );
}
