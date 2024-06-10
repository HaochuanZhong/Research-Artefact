import OpenAI from 'openai';
import express from "express";
import bodyParser from 'body-parser';
import cors from "cors";

const openai = new OpenAI({
    apiKey: "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" // This is also the default, can be omitted
});

const app = express();
const port = 3000;

app.use(bodyParser.json());
app.use(cors())

app.post("/", async (req,res) => {

    const {message} = req.body;

    const chatCompletion = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages:[
            {role: "user", content: `${message}`}
        ]
    })

    res.json({
        completion: chatCompletion.choices[0].message
    })
})

app.listen(port, ()=>{
    console.log("listenning on http://localhost:3000")
})