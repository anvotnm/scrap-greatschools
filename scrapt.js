const fs = require("fs");
const rp = require("request-promise");
const cheerio = require("cheerio");

const MAINURL = "http://www.greatschools.org/";
const LIMIT = 2000;
const state = [
    "Alaska",
    "Alabama",
    "Arkansas",
    "Arizona",
    "California",
    "Colorado",
    "Connecticut",
    "Washington-DC",
    "Delaware",
    "Florida",
    "Georgia",
    "Hawaii",
    "Iowa",
    "Idaho",
    "Illinois",
    "Indiana",
    "Kansas",
    "Kentucky",
    "Louisiana",
    "Massachusetts",
    "Maryland",
    "Maine",
    "Michigan",
    "Minnesota",
    "Missouri",
    "Mississippi",
    "Montana",
    "North-Carolina",
    "North-Dakota",
    "Nebraska",
    "New-Hampshire",
    "New-Jersey",
    "New-Mexico",
    "Nevada",
    "New-York",
    "Ohio",
    "Oklahoma",
    "Oregon",
    "Pennsylvania",
    "Rhode-Island",
    "South-Carolina",
    "South-Dakota",
    "Tennessee",
    "Texas",
    "Utah",
    "Virginia",
    "Vermont",
    "Washington",
    "Wisconsin",
    "West-Virginia",
    "Wyoming",
];

if (!fs.existsSync("./data")) {
    fs.mkdirSync("./data");
}

const fetchPagination = async function (url) {
    try {
        const body = await rp(url);
        const $ = cheerio.load(body);

        const totalSchoolEl = $(".school-level-item .school-number").last();
        const totalSchool = parseInt(totalSchoolEl.text().replace(",", ""));

        return totalSchool;
    } catch (error) {
        throw new Error(`Error fetching data: ${error.message}`);
    }
};

const fetchSchool = async function (state) {
    const totalItems = await fetchPagination(MAINURL + state);
    const totalPages = Math.ceil(totalItems / LIMIT);
    const URL = MAINURL + state + `/schools/?limit=${LIMIT}&page=`;
    const dir = `./data/${state}/`;
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir);
    }
    for (let i = 1; i <= totalPages; i++) {
        const page = await rp(URL + i);
        const $ = cheerio.load(page);
        const scriptContent = $("script").eq(0).text();

        const data1 = scriptContent.search("gon.search=");
        let dataContent = scriptContent.slice(data1 + "gon.search=".length);
        const data2 = dataContent.search(";gon.fresh_paint_page_data=");
        dataContent = dataContent.slice(0, data2);

        const jsonData = JSON.parse(dataContent);
        const schoolsData = jsonData.schools;

        fs.writeFileSync(`${dir}/${i}.json`, JSON.stringify(schoolsData, null, 2), {
            encoding: "utf-8",
        });

        console.log(URL + i);
    }
};

(async () => {
    for (let i = 0; i < state.length; i++) {
        await fetchSchool(state[i]);
    }
})();
