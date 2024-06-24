import OpenAI from 'openai';
import express from "express";
import bodyParser from 'body-parser';
import cors from "cors";
import dotenv from 'dotenv';

// Load environment variables from .env file
dotenv.config();

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY // Use environment variable
});

const app = express();
const port = 3000;

app.use(bodyParser.json());
app.use(cors())

app.post("/", async (req, res) => {
    const { message, file } = req.body;

    console.log("Received message:", message);
    console.log("Received file URL:", file);

    if (file) {
        try {
            const chatCompletion = await openai.chat.completions.create({
                model: "gpt-4o",
                messages: [
                    {
                        role: "user",
                        content: [
                            { type: "text", text: `${message}` },
                            {
                                type: "image_url",
                                image_url: {
                                    url: `${file}`,
                                },
                            },
                        ],
                    },
                ],
            });

            res.json({
                completion: chatCompletion.choices[0].message,
            });
        } catch (error) {
            console.error("Error creating chat completion:", error);
            res.status(500).json({ error: "Internal server error" });
        }
    } else {
        try {
            const chatCompletion = await openai.chat.completions.create({
                model: "gpt-4o",
                messages: [
                    {
                        role: "user",
                        content: [
                            { type: "text", text: `${message}` },
                        ],
                    },
                ],
            });

            res.json({
                completion: chatCompletion.choices[0].message,
            });
        } catch (error) {
            console.error("Error creating chat completion:", error);
            res.status(500).json({ error: "Internal server error" });
        }
    }
});

// New route to log "information received"
app.all("/receive", (req, res) => {
    console.log("information received");
    res.send("Information received");
});

app.listen(port, () => {
    console.log("listenning on http://localhost:3000")
})