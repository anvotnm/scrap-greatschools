const { Client } = require("pg");
const fs = require("fs");
const path = require("path");
const { randomUUID } = require("crypto");

// Replace these with your actual database connection details
const connectionString = "postgresql://user:password@localhost:5432/ddh";
const client = new Client({
    connectionString: connectionString,
});

// Connect to the PostgreSQL database
client
    .connect()
    .then(() => {
        console.log("Connected to the database");
    })
    .catch((error) => console.error("Error connecting to the database", error));

const state = [
    // "Alaska",
    "Alabama",
    // "Arkansas",
    // "Arizona",
    // "California",
    // "Colorado",
    // "Connecticut",
    // "Washington-DC",
    // "Delaware",
    // "Florida",
    // "Georgia",
    // "Hawaii",
    // "Iowa",
    // "Idaho",
    // "Illinois",
    // "Indiana",
    // "Kansas",
    // "Kentucky",
    // "Louisiana",
    // "Massachusetts",
    // "Maryland",
    // "Maine",
    // "Michigan",
    // "Minnesota",
    // "Missouri",
    // "Mississippi",
    // "Montana",
    // "North-Carolina",
    // "North-Dakota",
    // "Nebraska",
    // "New-Hampshire",
    // "New-Jersey",
    // "New-Mexico",
    // "Nevada",
    // "New-York",
    // "Ohio",
    // "Oklahoma",
    // "Oregon",
    // "Pennsylvania",
    // "Rhode-Island",
    // "South-Carolina",
    // "South-Dakota",
    // "Tennessee",
    // "Texas",
    // "Utah",
    // "Virginia",
    // "Vermont",
    // "Washington",
    // "Wisconsin",
    // "West-Virginia",
    // "Wyoming",
];

try {
    const promises = [];

    for (let stateName of state) {
        const folderPath = `./data/${stateName}/`;
        const files = fs.readdirSync(folderPath);

        for (let file of files) {
            const filePath = path.join(folderPath, file);

            // Check if it's a file (not a directory)
            const stats = fs.statSync(filePath);

            if (stats.isFile()) {
                // Read and parse JSON file
                if (path.extname(file).toLowerCase() === ".json") {
                    try {
                        const data = fs.readFileSync(filePath, "utf8");
                        const jsonData = JSON.parse(data);

                        for (let item of jsonData) {
                            const id = randomUUID();
                            const query = {
                                text: `INSERT INTO school (id, name, type, "gradeRange", rating, city, state, address, latitude, longitude, link) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)`,
                                values: [
                                    id,
                                    item.name,
                                    item.schoolType,
                                    item.gradeLevels,
                                    item.rating,
                                    item.address.city,
                                    item.state,
                                    item.address.street1,
                                    item.lat,
                                    item.lon,
                                    "https://www.greatschools.org/" + item.links.profile,
                                ],
                            };
                            promises.push(client.query(query));
                        }
                    } catch (jsonError) {
                        console.error("Error reading/parsing JSON file:", jsonError);
                    }
                }
            }
        }
    }

    Promise.all(promises)
        .then(() => {
            console.log("All queries executed successfully");
        })
        .catch((error) => {
            console.error("Error executing queries:", error);
        })
        .finally(() => {
            // Don't forget to close the connection when you're done
            client.end();
        });
} catch (err) {
    console.error("Error reading folder or executing database queries:", err);
}
