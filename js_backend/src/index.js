import dotenv from "dotenv";
import connectDB from "./db/index.js";
import {app} from './app.js'


dotenv.config({
    path: './.env'
})


connectDB()
.then(() => {

    app.listen(process.env.PORT || 8000, () => {

        console.log(`Server is running on port ${process.env.PORT || 8000}`)
    })

    app.on("error", (error) => {

        console.log("errrors:", error);

        throw error;
    })
})
.catch((error) => {
    console.log("mongodb connectoin error: " + error);
})