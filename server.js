'use strict';

const express = require('express');

// Constants
const PORT = 8080;
const HOST = '0.0.0.0';

const app = express();
app.use(express.static('src'))
app.use(express.static('node_modules'))

// Dummy endpoint used for testing -- shadow this in your reverse proxy
app.get('/alert-manager/api/v1/alerts', function (req, res) {
  var data = {
    "status": "success",
    "data": [ {
      "labels": {
        "instance": "onehost",
        "service": "os",
        "severity": "warning",
      },
      "annotations": {
        "description": "onehost: Systemd unit some.service has been in state \"failed\" for 15 minutes.",
        "summary": "Systemd unit some.service is failed"
      },
      "startsAt": new Date( (new Date()).getTime() - 60000 ).toISOString(), // A minute ago
      "endsAt":   new Date( (new Date()).getTime() + 60000 ).toISOString(), // A minute from now
      "status": {
        "state": "active",
        "silencedBy": null,
        "inhibitedBy": null
      }
    }, {
      "labels": {
        "instance": "onehost",
        "service": "os",
        "severity": "average",
      },
      "annotations": {
        "description": "onehost: Systemd unit other.service has been in state \"failed\" for 15 minutes.",
        "summary": "Systemd unit other.service was failed but is good now"
      },
      "startsAt": new Date( (new Date()).getTime() - 300000 ).toISOString(), // Five minutes ago
      "endsAt":   new Date( (new Date()).getTime() -  60000 ).toISOString(), // A minute ago
      "status": {
        "state": "active",
        "silencedBy": [],
        "inhibitedBy": []
      }
    }, {
      "labels": {
        "instance": "otherhost",
        "service": "os",
        "severity": "warning",
      },
      "annotations": {
        "description": "otherhost: Systemd unit some.service has been in state \"failed\" for 15 minutes.",
        "summary": "Systemd unit some.service is failed"
      },
      "startsAt": new Date( (new Date()).getTime() - 60000 ).toISOString(), // A minute ago
      "endsAt":   new Date( (new Date()).getTime() + 60000 ).toISOString(), // A minute from now
      "status": {
        "state": "active",
        "silencedBy": [],
        "inhibitedBy": []
      }
    }, {
      "labels": {
        "instance": "otherhost",
        "service": "website",
        "severity": "high",
      },
      "annotations": {
        "description": "otherhost: The web server has been unreachable for 1 hour.",
        "summary": "Our website is down"
      },
      "startsAt": new Date( (new Date()).getTime() - 60000 ).toISOString(), // A minute ago
      "endsAt":   new Date( (new Date()).getTime() + 60000 ).toISOString(), // A minute from now
      "status": {
        "state": "active",
        "silencedBy": [],
        "inhibitedBy": []
      }
    }, {
      "labels": {
        "instance": "otherhost",
        "service": "mail",
        "severity": "disaster",
      },
      "annotations": {
        "description": "otherhost: The mail server has been unreachable for 1 hour.",
        "summary": "Our mail server is down but we know"
      },
      "startsAt": new Date( (new Date()).getTime() - 60000 ).toISOString(), // A minute ago
      "endsAt":   new Date( (new Date()).getTime() + 60000 ).toISOString(), // A minute from now
      "status": {
        "state": "active",
        "silencedBy": ["some-fake-uuid"],
        "inhibitedBy": []
      }
    } ]
  };
  if ((new Date()).getMinutes() % 5 == 0) {
    // Every 5 minutes, include another alert to see if the "alert fixed" detection works
    data.data.push({
      "labels": {
        "instance": "thirdhost",
        "service": "time",
        "severity": "average",
      },
      "annotations": {
        "description": "thirdhost: The current minute is divisible by five.",
        "summary": "The current minute is divisible by five"
      },
      "startsAt": new Date( (new Date()).getTime() - 60000 ).toISOString(), // A minute ago
      "endsAt":   new Date( (new Date()).getTime() + 60000 ).toISOString(), // A minute from now
      "status": {
        "state": "active",
        "silencedBy": [],
        "inhibitedBy": []
      }
    });
  }
  res.send(JSON.stringify(data));
})

app.listen(PORT, HOST);
console.log(`Running on http://${HOST}:${PORT}`);
