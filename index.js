const express = require("express");
const WebSocket = require("ws");
const cors = require("cors");

const app = express();
app.use(cors());

const server = app.listen(3000, () => {
  console.log("Server running on port 3000");
});

/* WEBSOCKET SERVER */

const wss = new WebSocket.Server({ server, path: "/ws" });

let device = null;
let pendingListen = null;

wss.on("connection", (ws) => {

  console.log("ESP8266 connected");
  device = ws;

  ws.on("message", (msg) => {

    const message = msg.toString();
    console.log("Device:", message);

    /* return IR code to waiting HTTP request */

    if (pendingListen) {

      pendingListen.json({ bits: JSON.parse(message).bits, signal: JSON.parse(message).signal});
      pendingListen = null;
    }

  });

  ws.on("close", () => {
    console.log("Device disconnected");
    device = null;
  });

});


/* ======================== */
/*        API ROUTES        */
/* ======================== */

app.get("/status", (req,res)=>{

  res.json({
    deviceConnected: device !== null
  });

});


app.get("/send",(req,res)=>{

  if(!device) return res.status(500).send("device offline");

  const code = req.query.code;
  const bits = req.query.bits;

  const cmd = `SEND ${code},${bits}`;

  device.send(cmd);

  res.json({sent:cmd});
});


app.get("/listen",(req,res)=>{

  if(!device) return res.status(500).send("device offline");

  if(pendingListen)
    return res.status(409).send("listen already running");

  const time = req.query.time || 5000;

  pendingListen = res;

  device.send(`LISTEN ${time}`);

});