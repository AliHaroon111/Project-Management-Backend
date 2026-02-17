import dotenv from "dotenv";
import app from "./app.js";
import connecctDB from "./db/index.js";
// process.env.username  //this is one -> 2nd methond below

dotenv.config({
    path:"./.env",
});


const port = process.env.PORT || 3000 ; //If PORT avail in env use it otherwise use 3000

connecctDB()
    .then(() =>{
        app.listen(port, () => {
            console.log(`Example app listening on port http://localhost:${port}`)
          })
    } )
    .catch((err) => {
        console.error("MongoDb connection Error",err)
        process.exit(1)
        
    })
