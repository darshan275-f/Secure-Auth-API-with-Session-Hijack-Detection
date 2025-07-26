import app from "./app.js";
import connectToDb from "./db/index.js";


connectToDb().then(
app.listen(process.env.PORT,()=>{
    console.log("Server is running on "+process.env.PORT);
}))