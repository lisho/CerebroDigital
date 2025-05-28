const express = require('express');
const axios = require('axios');
const dotenv = require('dotenv');
const cors = require('cors');
const { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } = require('@google/generative-ai');

const db = require('./models'); // Imports from models/index.js

dotenv.config();

const { sequelize } = db; // Get sequelize instance from db object
// All models are also available in the db object e.g. db.User, db.Case

const caseRoutes = require('./routes/caseRoutes');
const clientNoteRoutes = require('./routes/clientNoteRoutes');
const userRoutes = require('./routes/userRoutes');
const resourceRoutes = require('./routes/resourceRoutes');
const scheduleEventRoutes = require('./routes/scheduleEventRoutes');
const taskRoutes = require('./routes/taskRoutes');

const app = express();
const port = process.env.PORT || 3001;

// Middleware
app.use(cors({ origin: process.env.CLIENT_ORIGIN_URL }));
app.use(express.json());

// Mount case routes
app.use('/api/cases', caseRoutes);
app.use('/api/client-notes', clientNoteRoutes);
app.use('/api/users', userRoutes);
app.use('/api/resources', resourceRoutes);
app.use('/api/schedule-events', scheduleEventRoutes);
app.use('/api/tasks', taskRoutes);

const MODEL_NAME = "gemini-pro"; // Or allow client to specify if needed

app.post('/api/v1/chat/send', async (req, res) => {
    try {
        const { message, history, systemInstruction, stream } = req.body; // Added systemInstruction
        const apiKey = process.env.GEMINI_API_KEY;

        if (!apiKey) {
            return res.status(500).json({ error: 'API key not configured on server.' });
        }

        if (!message) {
            return res.status(400).json({ error: 'Message is required.' });
        }

        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({ model: MODEL_NAME });

        const generationConfig = {
            temperature: 0.9, // Default, consider making configurable
            topK: 1,          // Default, consider making configurable
            topP: 1,          // Default, consider making configurable
            maxOutputTokens: 2048, // Default, consider making configurable
        };

        const safetySettings = [
            { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
            { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
            { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
            { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
        ];
        
        // Construct chat history, including system instruction if provided
        const chatHistory = [];
        if (systemInstruction) {
            // Note: The Gemini API expects system instructions to be part of the initial message from the 'user' role,
            // or in some SDK versions, a dedicated parameter. Here, we prepend it to the history
            // to influence the conversation context. This might need adjustment based on how the Gemini SDK
            // best handles system-level instructions within a chat session.
            // For now, let's assume it's prepended to the user's first message or handled by the SDK
            // if `systemInstruction` is part of `startChat` options.
            // A common pattern is:
            // { role: "user", parts: [{ text: systemInstruction + "\n\n" + messageFromUser }]}
            // Or, some models/SDKs might have a dedicated system role.
            // For this implementation, we'll add it as a distinct "user" message for simplicity,
            // which might not be the optimal way to use system instructions with Gemini.
             chatHistory.push({ role: "user", parts: [{ text: systemInstruction }] });
             chatHistory.push({ role: "model", parts: [{ text: "Okay, I will follow that instruction." }] }); // Acknowledge system instruction
        }
        if (history && Array.isArray(history)) {
            chatHistory.push(...history);
        }

        if (stream === true || (typeof stream === 'string' && stream.toLowerCase() === 'true')) {
            res.setHeader('Content-Type', 'text/event-stream');
            res.setHeader('Cache-Control', 'no-cache');
            res.setHeader('Connection', 'keep-alive');
            res.flushHeaders(); // Flush the headers to establish the connection

            const chat = model.startChat({
                history: chatHistory,
                generationConfig,
                safetySettings,
            });
            
            const resultStream = await chat.sendMessageStream(message);

            for await (const chunk of resultStream.stream) {
                if (chunk && chunk.text) {
                    res.write(`data: ${JSON.stringify({ text: chunk.text() })}\n\n`);
                }
            }
            res.write('data: {"event": "STREAM_END"}\n\n'); // Signal end of stream
            res.end();

        } else {
            const chat = model.startChat({
                history: chatHistory,
                generationConfig,
                safetySettings,
            });
            const result = await chat.sendMessage(message);
            const response = result.response;
            res.json({ text: response.text() });
        }

    } catch (error) {
        console.error('Error processing chat message:', error);
        let errorMessage = 'An unexpected error occurred.';
        let statusCode = 500;

        if (error.message && error.message.includes('SAFETY')) {
            errorMessage = 'Content blocked due to safety settings.';
            statusCode = 400; // Bad Request, as the content was inappropriate
        } else if (error.message && error.message.includes('API key not valid')) {
            errorMessage = 'Invalid API key on the server.';
            statusCode = 500; // Internal server error
        }
        
        res.status(statusCode).json({ error: errorMessage, details: error.message });
    }
});

app.listen(port, async () => { // Made this async to await sequelize.authenticate()
    console.log(`Proxy server listening on port ${port}`);

    try {
        await sequelize.authenticate();
        console.log('Connection to the database has been established successfully.');

        // Sync models with the database
        await sequelize.sync({ alter: true });
        console.log('Models synchronized with the database.');

    } catch (error) {
        console.error('Unable to connect to the database or synchronize models:', error);
    }
});

module.exports = db; // Export the whole db object (sequelize instance + models)
