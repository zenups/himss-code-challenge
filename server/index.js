const express = require('express');
const app = express();

const AWS = require("aws-sdk");

const {REPORT_TABLE, REPORT_OPEN_STATUS} = require("../frontend/src/constants");

AWS.config.update({
    region: "us-west-2",
    endpoint: "http://localhost:8020"
})

async function getAllReports(){
    const docClient = new AWS.DynamoDB.DocumentClient();

    const params = {
        TableName: REPORT_TABLE,
    }

    try{
        const response = await docClient.scan(params).promise();
        return { size: response.Count, elements: response.Items };
    } catch (err) {
        console.error("Problem getting all reports:", err);
        throw err;
    }
}

async function getOpenReports(){
    const docClient = new AWS.DynamoDB.DocumentClient();

    const params = {
        TableName: REPORT_TABLE,
        IndexName: "state_created",
        KeyConditionExpression: "#st = :st",
        ExpressionAttributeNames: {
            "#st": "state"
        },
        ExpressionAttributeValues: {
            ":st": REPORT_OPEN_STATUS
        }
    };

    try{
        const response = await docClient.query(params).promise();
        return { size: response.Count, elements: response.Items };
    } catch(err){
        console.error("Problem getting open reports:", err);
        throw err;
    }
}

async function getReport(reportId){
    const docClient = new AWS.DynamoDB.DocumentClient();


    const params = {
        TableName: REPORT_TABLE,
        Key: {
            "id": reportId
        },
    };

    try{
        const response = await docClient.get(params).promise();
        return response.Item;
    } catch (err){
        console.error("Problem getting a report:", err);
        throw err;
    }
}

async function updateReport(reportId, request){
    const docClient = new AWS.DynamoDB.DocumentClient();
    const newState = request?.ticketState;
    const newBlocked = request?.blocked;
    const updateArray = [];
    const ExpressionAttributeValues = {};
    const ExpressionAttributeNames = {};
    if(newState){
        updateArray.push("#st = :s");
        ExpressionAttributeValues[":s"] = newState;
        ExpressionAttributeNames["#st"] = "state";
    }
    if(newBlocked){
        updateArray.push("#bl = :b");
        ExpressionAttributeValues[":b"] = newBlocked;
        ExpressionAttributeNames["#bl"] = "blocked";
    }
    if(updateArray.length < 1){
        return null;
    }
    const UpdateExpression = `set ${updateArray.join(', ')}`;

    const params = {
        TableName: REPORT_TABLE,
        Key: {
            "id": reportId
        },
        UpdateExpression,
        ExpressionAttributeValues,
        ExpressionAttributeNames,
        ReturnValues:"ALL_NEW"
    };

    try {
        const response = docClient.update(params).promise();
        return response;
    } catch (err) {
        console.log("Problem updating report:", err);
        throw err;
    }
}

app.use(express.json());

app.get('/api/reports', async (req, res) => {

    try{
        const response = await getOpenReports();
        res.send(JSON.stringify(response));
    } catch (err){
        res.status(500);
        res.send("Internal Error");
    }
});

app.put('/api/reports/:reportId', async (req, res) => {
    try{
        const response = await updateReport(req.params.reportId, req.body)
        res.send(JSON.stringify(response));
    } catch (err) {
        res.status(500);
        res.send("Internal Error");
    }
});

app.get('/api/reports/:reportId', async (req, res) => {
    try{
        const response = await getReport(req.params.reportId)
        res.send(JSON.stringify(response));
    } catch (err) {
        res.status(500);
        res.send("Internal Error");
    }
});

app.listen(8080, () => console.log("Reports Service listening at port: 8080"))
