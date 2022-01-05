const _ = require("lodash");
const express = require("express");
const app = express();
var cors = require("cors");

app.use(cors({ exposedHeaders: "Authorization" }));

require("./startup/config")();
require("./startup/publicFolders")(app);
require("./startup/routes")(app);
require("./startup/db")();
require("./startup/validation")();

//listener
const port = process.env.PORT || 8000;
app.listen(port, () => {
    console.info(`listening on port ${port}`);
});
