const fs = require("fs");
const rp = require("request-promise");
const cheerio = require("cheerio");

(async () => {
    const URL = "http://www.greatschools.org/Alaska/schools/?limit=1000&page=1";
    const page = await rp(URL);
    const $ = cheerio.load(page);
    const scriptContent = $("script").eq(0).text();

    const data1 = scriptContent.search("gon.search=");
    let dataContent = scriptContent.slice(data1 + "gon.search=".length);
    const data2 = dataContent.search(";gon.fresh_paint_page_data=");
    dataContent = dataContent.slice(0, data2);

    const jsonData = JSON.parse(dataContent);
    const schoolsData = jsonData.schools;

    fs.writeFileSync(`./test.json`, JSON.stringify(schoolsData, null, 2), {
        encoding: "utf-8",
    });
})();
