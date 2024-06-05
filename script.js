const form = document.getElementById('proxy-form');
const targetUrlInput = document.getElementById('target-url');
const resultsDiv = document.getElementById('results');

form.addEventListener('submit', async (event) => {
  event.preventDefault();

  const targetUrl = targetUrlInput.value;
  const res = await fetch(`/?target-url=${encodeURIComponent(targetUrl)}`);
  const data = await res.text();

  resultsDiv.innerText = data;
});
