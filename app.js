
let works = JSON.parse(localStorage.getItem("works") || "[]");
let materials = JSON.parse(localStorage.getItem("materials") || "[]");
let files = JSON.parse(localStorage.getItem("files") || "[]");

function saveData() {
  localStorage.setItem("works", JSON.stringify(works));
  localStorage.setItem("materials", JSON.stringify(materials));
  localStorage.setItem("files", JSON.stringify(files));
}

function showTab(id) {
  document.querySelectorAll(".section").forEach(s => {
    s.classList.add("hidden");
  });
  document.getElementById(id).classList.remove("hidden");
  render();
}

document.getElementById("workForm").onsubmit = function(e) {
  e.preventDefault();

  works.push({
    id: Date.now(),
    title: workTitle.value,
    date: workDate.value,
    location: workLocation.value,
    manpower: manpower.value,
    details: workDetails.value
  });

  saveData();
  this.reset();
  render();
  alert("Work record saved!");
};

document.getElementById("materialForm").onsubmit = function(e) {
  e.preventDefault();

  materials.push({
    id: Date.now(),
    name: materialName.value,
    quantity: quantity.value,
    unit: unit.value,
    status: status.value
  });

  saveData();
  this.reset();
  render();
  alert("Material saved!");
};

document.getElementById("fileForm").onsubmit = async function(e) {
  e.preventDefault();

  const file = fileInput.files[0];
  if (!file) return;

  if (file.size > 10 * 1024 * 1024) {
    alert("File size must be under 10 MB.");
    return;
  }

  const reader = new FileReader();

  reader.onload = function() {
    files.push({
      id: Date.now(),
      name: file.name,
      description: fileDescription.value,
      data: reader.result
    });

    saveData();
    document.getElementById("fileForm").reset();
    render();
    alert("File saved!");
  };

  reader.readAsDataURL(file);
};

function deleteItem(type, id) {
  if (!confirm("Are you sure you want to delete?")) return;

  if (type === "work") works = works.filter(x => x.id !== id);
  if (type === "material") materials = materials.filter(x => x.id !== id);
  if (type === "file") files = files.filter(x => x.id !== id);

  saveData();
  render();
}

function render() {
  const wq = document.getElementById("workSearch").value.toLowerCase();
  const mq = document.getElementById("materialSearch").value.toLowerCase();

  workCount.textContent = works.length;
  materialCount.textContent = materials.length;
  fileCount.textContent = files.length;

  workList.innerHTML = works
    .filter(x => (x.title + x.location + x.details).toLowerCase().includes(wq))
    .map(x => `
      <div class="record">
        <h3>${escapeHTML(x.title)}</h3>
        <p>Date: ${escapeHTML(x.date)}</p>
        <p>Location: ${escapeHTML(x.location)}</p>
        <p>Manpower: ${escapeHTML(x.manpower)}</p>
        <p>${escapeHTML(x.details)}</p>
        <button onclick="deleteItem('work',${x.id})">Delete</button>
      </div>
    `).join("");

  materialList.innerHTML = materials
    .filter(x => (x.name + x.status).toLowerCase().includes(mq))
    .map(x => `
      <div class="record">
        <h3>${escapeHTML(x.name)}</h3>
        <p>Quantity: ${escapeHTML(x.quantity)} ${escapeHTML(x.unit)}</p>
        <p>Status: ${escapeHTML(x.status)}</p>
        <button onclick="deleteItem('material',${x.id})">Delete</button>
      </div>
    `).join("");

  fileList.innerHTML = files.map(x => `
    <div class="record">
      <b>${escapeHTML(x.name)}</b>
      <p>${escapeHTML(x.description)}</p>
      <a href="${x.data}" download="${encodeURIComponent(x.name)}">Open / Download</a>
      <button onclick="deleteItem('file',${x.id})">Delete</button>
    </div>
  `).join("");
}

function escapeHTML(value) {
  return String(value ?? "").replace(/[&<>"']/g, c => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;",
    '"': "&quot;", "'": "&#39;"
  })[c]);
}

function exportCSV() {
  const rows = [
    ["Type", "Title", "Date", "Location", "Manpower", "Quantity", "Unit", "Status"],
    ...works.map(x => ["Work", x.title, x.date, x.location, x.manpower, "", "", ""]),
    ...materials.map(x => ["Material", x.name, "", "", "", x.quantity, x.unit, x.status])
  ];

  const csv = rows.map(row =>
    row.map(value => '"' + String(value ?? "").replaceAll('"', '""') + '"').join(",")
  ).join("\r\n");

  const blob = new Blob([csv], {type: "text/csv;charset=utf-8"});
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "construction-site-records.csv";
  a.click();
  URL.revokeObjectURL(url);
}

render();
