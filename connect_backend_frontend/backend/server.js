import express from 'express'

const app = express()

const port = 4000

app.get('/', (req, resp) => {
    resp.send("Home Page")
})

app.get('/api/jokes', (req, resp) => {

    const jokes =
        [
            {
                "id": "1",
                "category": "Pun",
                "joke": "Why did the scarecrow win an award? Because he was outstanding in his field!"
            },
            {
                "id": "2",
                "category": "Dad Joke",
                "joke": "What do you call a fish with no eyes? Fsh!"
            },
            {
                "id": "3",
                "category": "One Liner",
                "joke": "I used to be addicted to soap, but I’m clean now."
            },
            {
                "id": "4",
                "category": "Knock-Knock",
                "setup": "Knock knock",
                "joke": "Who’s there? Dwayne. Dwayne who? Dwayne the bathtub, I’m dwowning!"
            },
            {
                "id": "5",
                "category": "Tech",
                "joke": "Why did the computer crash? It couldn't handle the work load."
            }
        ]

    resp.send(jokes)

})

app.listen(port, () => {
    console.log(`serve at localhost:${port}`)
})

