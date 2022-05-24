const _ = require("lodash");
const express = require("express");
const app = express();
var cors = require("cors");

app.use(cors({ exposedHeaders: "Authorization" }));

//require("./startup/config")();
require("./startup/publicFolders")(app);
require("./startup/dotenv")();
require("./startup/routes")(app);
const port = process.env.PORT || 8000;
app.listen(port, () => {
    console.info(`listening on port ${port}`);
});
