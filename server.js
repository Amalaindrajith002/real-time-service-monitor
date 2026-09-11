const express = require('express');
const axios = require('axios');
const cors = require('cors');
const nodemailer = require('nodemailer');

const { initializeApp, cert } = require('firebase-admin/app');
const { getFirestore, FieldValue } = require('firebase-admin/firestore');
const serviceAccount = require('./serviceAccountKey.json');

initializeApp({
  credential: cert(serviceAccount)
});
const db = getFirestore();
const app = express();
app.use(cors());

// --- ඊමේල් යවන කොටස (ඔයාගේ විස්තර දාලා තියෙන්න ඕනේ) ---
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'yourmail@gmail.com', 
        pass: 'yourpassword'
    }
});

const sendAlert = (serviceName, errorMessage) => {
    const mailOptions = {
        from: 'yourmail@gmail.com',
        to: 'yourmail@gmail.com',
        subject: `🚨 URGENT: ${serviceName} is DOWN!`,
        text: `අවධානයයි! ඔබගේ ${serviceName} සර්වර් එක මේ මොහොතේ අක්‍රිය වී ඇත.\n\nහේතුව: ${errorMessage}\nකරුණාකර වහාම පරීක්ෂා කරන්න.`
    };

    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            console.log('❌ ඊමේල් යැවීමේ දෝෂයක්:', error);
        } else {
            console.log('📧 Alert Email Sent: ' + info.response);
        }
    });
};
// --------------------------------------------------------

// ටෙස්ට් කරන්න බොරු ලින්ක් එකකුත් (Fake Server) ඇඩ් කළා
const servicesToMonitor = [
    { name: 'Google', url: 'https://www.google.com' },
    { name: 'JSONPlaceholder API', url: 'https://jsonplaceholder.typicode.com/todos/1' } 
];

const checkServices = async () => {
    for (const service of servicesToMonitor) {
        let logData = {
            serviceName: service.name,
            url: service.url,
            timestamp: FieldValue.serverTimestamp(),
        };

        try {
            const startTime = Date.now();
            const response = await axios.get(service.url);
            const responseTime = Date.now() - startTime;

            if (response.status === 200) {
                logData.status = 'UP';
                logData.responseTime = responseTime;
                console.log(`✅ [UP] ${service.name} is running. (${responseTime}ms)`);
            } else {
                logData.status = 'DOWN';
                logData.error = `HTTP Status: ${response.status}`;
                console.log(`⚠️ [WARNING] ${service.name} returned status ${response.status}`);
                sendAlert(service.name, `HTTP Status: ${response.status}`); // දෝෂයක් ආවොත් ඊමේල් යවනවා
            }
        } catch (error) {
            logData.status = 'DOWN';
            logData.error = error.message;
            console.log(`❌ [DOWN] ${service.name} is down! Error: ${error.message}`);
            sendAlert(service.name, error.message); // සර්වර් එක වැඩ නැත්නම් ඊමේල් යවනවා
        }

        try {
            await db.collection('serverLogs').add(logData);
        } catch (dbError) {
            console.error("Firestore Error:", dbError);
        }
    }
    console.log('----------------------------------------');
};

setInterval(checkServices, 30000);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`🚀 Monitoring Server is running on port ${PORT}...`);
    checkServices();
});