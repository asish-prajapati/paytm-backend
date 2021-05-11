const express = require("express");
const https = require("https");
const cors = require("cors");
const PaytmChecksum = require("./paytm/PaytmChecksum");
app = express();
app.use(express.json());

app.get("/api/payment", cors(), (req, res) => {
  var paytmParams = {};

  paytmParams.body = {
    requestType: "Payment",
    mid: "Eenlrm28360187701220",
    websiteName: "WEBSTAGING",
    orderId: "ORDERID_98765",
    callbackUrl: "http://localhost:4000/api/status",
    txnAmount: {
      value: "1.00",
      currency: "INR",
    },
    userInfo: {
      custId: "CUST_001",
    },
  };
  PaytmChecksum.generateSignature(
    JSON.stringify(paytmParams.body),
    "Ja_Vu40nNUqK5ke%"
  ).then((checksum) => {
    paytmParams.head = {
      signature: checksum,
    };

    var post_data = JSON.stringify(paytmParams);
    var options = {
      hostname: "securegw-stage.paytm.in",
      port: 443,
      path: `/theia/api/v1/initiateTransaction?mid=Eenlrm28360187701220&orderId=${paytmParams.body.orderId}`,
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Content-Length": post_data.length,
      },
    };

    var response = "";
    var post_req = https.request(options, function (post_res) {
      post_res.on("data", function (chunk) {
        response += chunk;
      });

      post_res.on("end", function () {
        console.log("Response: ", response);
        return res.json(response);
      });
    });

    post_req.write(post_data);
    post_req.end();
  });
});

app.post("/api/status", (req, res) => {
  res.send("done");
});

app.listen(4000, () => {
  console.log("server started at :4000");
});
