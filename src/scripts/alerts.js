window.app = {
    orderedKeys (someObj){
        var keys = Object.keys(someObj);
        keys.sort();
        return keys;
    },

    async query () {
        const response = await fetch(
            "/alert-manager/api/v1/alerts?c=" + (new Date()).getTime(),
            {
                headers: {
                    "X-Requested-With": "XMLHttpRequest"
                }
            }
        );
        const result = await response.json();

        var all_alerts = [];

        for (const alert of result.data || []){
            var sev = alert.labels.severity;
            if (
                typeof alert.endsAt !== "undefined" &&
                !alert.endsAt.startsWith("0001-01-01") && // -.-
                new Date(alert.endsAt) < new Date()
            ){
                // Alert has already ended, A-M just informs us there _used to be_ one
                sev = "normal";
            }
            all_alerts.push({
                hostname:   `${alert.labels.instance}`,
                summary:    `${alert.labels.service} :: ${alert.annotations.summary}`,
                severity:   sev,
                status:     alert.status,
            });
        }

        // Now, group those alertés by their summaraizia.
        var alerts_by_description = {};
        for (const alert of all_alerts) {
            if( !(alert.summary in alerts_by_description)){
                alerts_by_description[alert.summary] = [];
            }
            alerts_by_description[alert.summary].push(alert);
        }

        this.prev_resp_alerts = this.resp_alerts;
        this.resp_alerts = alerts_by_description;

        this.alerts    = {};
        this.hosts     = {};
        for (const summary in this.resp_alerts) {
            this.alerts[summary] = {};
            for (const alert of this.resp_alerts[summary]) {
                this.alerts[summary][alert.hostname] = alert;
                this.hosts[alert.hostname] = alert.host;
            }
        }
        for (const summary in this.prev_resp_alerts) {
            // Check if alerts from last_alerts are still there, and if not,
            // add a {"severity": "normal"} dummy alert to indicate they were fixed
            if( typeof this.alerts[summary] == "undefined" ){
                this.alerts[summary] = {};
            }
            for (const alert of this.prev_resp_alerts[summary]) {
                if( typeof this.alerts[summary][alert.hostname] == "undefined" ){
                    // Alert is gone! Fixed! Woohoo!
                    alert.severity = "normal";
                    this.alerts[summary][alert.hostname] = alert;
                    if( typeof this.hosts[alert.hostname] == "undefined" ){
                        this.hosts[alert.hostname] = alert.host;
                    }
                }
            }
        }
    },

    get haveAlerts () {
        return Object.keys(this.alerts).length > 0;
    },

    isAcked (alert) {
        return (
            Array.isArray(alert.status.silencedBy) &&
            alert.status.silencedBy.length > 0
        )
    },

    cssSeverity (alert) {
        // If an alert is acked, treat severity as info
        if (this.isAcked(alert)) {
            return "zinfo";
        } else {
            return "z" + alert.severity;
        }
    },

    alertService (summary) {
        return summary.split(" :: ", 2)[0];
    },

    alertSummary (summary) {
        return summary.split(" :: ", 2)[1];
    },

    init () {
        this.hosts  = [];
        this.alerts = {};
        this.last_alerts = {};

        setInterval( async() => await this.query(), 60000);
        setTimeout(  async() => await this.query(), 10);
    }

};
