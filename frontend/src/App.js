import React from 'react';
import axios from 'axios';
import './App.css';
import Report from './Report';
import {REPORT_CLOSED_STATUS, BLOCKED_REPORT} from './constants';

function App() {
    const [reports, setReports] = React.useState([]);

    const loadReports = React.useCallback(() => {
        axios.get("/api/reports").then((response) => {
            setReports(response?.data?.elements)
        }).catch((err) => {
            console.error("Problem getting reports:", err);
        })
    }, []);

    React.useEffect(() => {
        loadReports();
    }, []);

    const blockReport = React.useCallback((reportId) => {
        const blocked = BLOCKED_REPORT;
        axios.put(`/api/reports/${reportId}`, {blocked})
            .then(loadReports)
            .catch((err) => {
                console.error("Problem blocking report:", err);
            })
    }, []);

    const resolveReport = React.useCallback((reportId) => {
        axios.put(`/api/reports/${reportId}`, {ticketState: REPORT_CLOSED_STATUS})
            .then(loadReports)
            .catch((err) => {
                console.error("Problem blocking report:", err);
            })
    }, []);

    return (
        <div className="App">
            <h1>Reports</h1>
            <div className="Body">
            {reports?.map((report) => (
                <Report
                    key={report.id}
                    report={report}
                    onResolve={resolveReport}
                    onBlock={blockReport} />
            ))}
            </div>
        </div>
    );
}

export default App;
