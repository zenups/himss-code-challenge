const AWS = require("aws-sdk")
const fs = require('fs')

const TableName = "reports";

AWS.config.update({
    region: "us-west-2",
    endpoint: "http://localhost:8020"
})

async function insertData() {
    const docClient = new AWS.DynamoDB.DocumentClient();
    const reportsFile = fs.readFileSync("data/reports.json");
    const reports = JSON.parse(reportsFile);

    try{
        const results = await Promise.all(reports.elements.map((report) => {
            const params = {
                TableName,
                Item: report,
            };

            return docClient.put(params).promise();
        }));

        console.log(`Successfully added ${results.length} rows.`);
    } catch (err) {
        console.error("Unable to insert item. Error JSON:", JSON.stringify(err, null, 2));
        process.exit(1);
    }
}

async function dropAndCreateTable() {
    const dynamodb = new AWS.DynamoDB();

    try {
        const response = await dynamodb.listTables({}).promise();

        if(response.TableNames.includes(TableName)){
            await dynamodb.deleteTable({TableName}).promise();
        }
    } catch (err) {
        console.error("Problem while listing or deleting table. JSON err:", JSON.stringify(err, null, 2));
    }
    const params = {
        TableName,
        AttributeDefinitions: [
            { AttributeName: "id", AttributeType: "S" },
            { AttributeName: "state", AttributeType: "S" }
        ],
        KeySchema: [ {AttributeName: "id", KeyType: "HASH"} ],
        GlobalSecondaryIndexes: [{
            IndexName: "state_created",
            KeySchema: [
                { AttributeName: "state", KeyType: "HASH" }
            ],
            Projection: { ProjectionType: "ALL" },
            ProvisionedThroughput: {
                ReadCapacityUnits: 10,
                WriteCapacityUnits: 10
            }
        }],
        ProvisionedThroughput: {
            ReadCapacityUnits: 10,
            WriteCapacityUnits: 10
        }
    }

    try {
        const createResponse = await dynamodb.createTable(params).promise();
        console.log("Created table. Description:", JSON.stringify(createResponse, null, 2));
    } catch (err) {
        console.error("Unable to create table. Error JSON:", JSON.stringify(err, null, 2));
        process.exit(1);
    }
}

dropAndCreateTable().then(insertData);

