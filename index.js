require("dotenv").config();
const express = require("express");
const cors = require("cors");
const app = express();
const dns = require("node:dns");

let urlStorage = [];

const searchURL = (url) => {
	let result = urlStorage.findIndex((element) => element === url);
  if (result != -1) {
		return result;
  } else {
		urlStorage.push(url);
    return urlStorage.length - 1;
  }
};

// Basic Configuration
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use("/public", express.static(`${process.cwd()}/public`));

app.get("/", function (req, res) {
	res.sendFile(process.cwd() + "/views/index.html");
});

// Your first API endpoint
app.get("/api/hello", function (req, res) {
	res.json({ greeting: "hello API" });
});

app.post("/api/shorturl", function (req, res, next) {
	
	let httpRegEx = /^(http[s]?:\/\/)(www.)?/;
	let pathRegEx = /(\/|:)(.+)?/;

  let url = req.body.url.replace(httpRegEx, "").replace(pathRegEx, "");

  dns.lookup(url, (err, address) => {
    if (err) {
      console.log(err)
    } 
		
		if (!address) {
			res.json({ error: "invalid url" });
		} else {
      let short_url = searchURL(req.body.url);
      res.json({ original_url: req.body.url, short_url: short_url });
    }
  });
});

app.get("/api/shorturl/:shorturl", function (req, res, next) {
  // get URL from list

  if (req.params.shorturl === undefined || req.params.shorturl === "") {
     res.json("No short url");
  } else {
    res.redirect(`${urlStorage[req.params.shorturl]}`);
  }
});

app.listen(port, function () {
  console.log(`Listening on port ${port}`);
});
