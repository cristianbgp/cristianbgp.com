import gsjson from "google-spreadsheet-to-json";

function formatDate(date) {
  let newDate = date.toString().split("");
  newDate.splice(-2, 0, "/");
  newDate.splice(4, 0, "/");
  return new Date(newDate.join(""));
}

function countByColumn(data, columnName) {
  return { count: data.reduce((acc, element) => acc + element[columnName], 0) };
}

export default async function handler(req, res) {
  const { countBy } = req.query;
  const result = await gsjson({
    spreadsheetId: "1NTXJuYlT2OPesfaiQjSpgz4BXw5CzqUJ0DGaO83om6k",
  });

  const newResult = result.map(
    ({
      fecha,
      pfizer = 0,
      sinopharm = 0,
      astrazeneca = 0,
      pfizerCovax = 0,
      astrazenecaCovax = 0,
      otro3 = 0,
      total = 0,
    }) => {
      return {
        fecha: formatDate(fecha),
        pfizer,
        sinopharm,
        astrazeneca,
        pfizerCovax,
        astrazenecaCovax,
        otro3,
        total,
      };
    }
  );

  res.setHeader(
    "Cache-Control",
    "public, s-maxage=60, stale-while-revalidate=30"
  );

  return res
    .status(200)
    .json(countBy ? countByColumn(newResult, countBy) : newResult);
}
