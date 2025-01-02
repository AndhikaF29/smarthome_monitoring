export default function handler(req, res) {
    // Simulasi data sensor
    const data = {
        suhu: 25,
        humidity: 60,
        waterLevel: 10
    };

    res.status(200).json(data);
} 