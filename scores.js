function http_get(url, callback, headers = [], method = "GET", content = null) {
  const request = new XMLHttpRequest();
  request.addEventListener("load", callback);
  request.open(method, url, true);
  for (const header of headers) {
    request.setRequestHeader(header[0], header[1]);
  }
  request.send(content);
}

function main() {
  const url_regex = /https:\/\/assessment\.peardeck\.com\/home\/class\/([a-f0-9]+)\/test\/([a-f0-9]+)\/testActivityReport\/([a-f0-9]+)/;
  const href = window.location.href;

  if (!url_regex.test(href)) {
    alert("Error: Invalid URL.\n\nFor reference, the URL should look like this:\nhttps://assessment.peardeck.com/home/class/CLASS_ID/test/TEST_ID/testActivityReport/TEST_REPORT_ID");
    return;
  }

  const matches = url_regex.exec(href);
  const group_id = matches[1];
  const test_id = matches[3];
  const request_url = `https://assessment.peardeck.com/api/test-activity/${test_id}/report?groupId=${group_id}`;

  const token_list_raw = localStorage.getItem("tokens");
  if (!token_list_raw) {
    alert("Error: Could not find tokens in localStorage.");
    return;
  }

  const token_list = JSON.parse(token_list_raw);
  const token = localStorage.getItem(token_list[0]);
  if (!token) {
    alert("Error: Could not find auth token.");
    return;
  }

  const headers = [["Authorization", token]];

  http_get(request_url, function () {
    console.log("Status:", this.status);
    if (this.status !== 200) {
      alert(`Error: Status code ${this.status} received while trying to fetch the API.`);
      return;
    }

    let report;
    try {
      report = JSON.parse(this.responseText);
    } catch (e) {
      console.error("Failed to parse JSON:", e, this.responseText);
      alert("Error: Could not parse report JSON.");
      return;
    }

    const wrong = report.result.testActivity.wrong;
    const total = report.result.questionActivities.length;
    const percent = (100 * (total - wrong) / total).toFixed(2);
    alert(`${total - wrong}/${total} questions correct (~${percent}%)`);
  }, headers);
}

main();
