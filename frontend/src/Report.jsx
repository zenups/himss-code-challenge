import React from 'react';
import {BLOCKED_REPORT} from './constants';

export default function Report({ report, onBlock, onResolve }){
    return(
        <div className="report-wrapper">
            <div className="report-column first">
                <div>
                Id: {report.id}
                </div>
                <div>
                State: {report.state}
                </div>
                <div>
                <a href="">Details</a>
                </div>
            </div>

            <div className="report-column second">
                <div>
                Type: {report?.payload?.reportType}
                </div>
                <div>
                Message: {report?.payload?.message}
                </div>
            </div>

            <div className="report-column buttons">
                <button onClick={() => onBlock(report.id)} disabled={report.blocked === BLOCKED_REPORT}>
                    Block
                </button>
                <button onClick={() => onResolve(report.id)}>
                    Resolve
                </button>
            </div>
        </div>
    );
}