// ============================================================
// SUPABASE - ISI 2 NILAI INI
// ============================================================
const SUPABASE_URL = "MASUKKAN_SUPABASE_URL_ANDA";
const SUPABASE_ANON_KEY = "MASUKKAN_SUPABASE_PUBLISHABLE_KEY_ANDA";

const supabaseClient = window.supabase.createClient(
  SUPABASE_URL,
  SUPABASE_ANON_KEY
);

// ============================================================
// ELEMENT
// ============================================================
const borang = document.getElementById("borangAhli");
const editId = document.getElementById("editId");
const namaPenuh = document.getElementById("namaPenuh");
const noIC = document.getElementById("noIC");
const noTelefon = document.getElementById("noTelefon");
const alamat = document.getElementById("alamat");
const status = document.getElementById("status");
const btnDaftar = document.getElementById("btnDaftar");
const btnBatal = document.getElementById("btnBatal");
const formTitle = document.getElementById("formTitle");
const message = document.getElementById("message");
const senaraiAhli = document.getElementById("senaraiAhli");
const jumlahAhli = document.getElementById("jumlahAhli");
const jumlahAktif = document.getElementById("jumlahAktif");
const ahliTerakhir = document.getElementById("ahliTerakhir");
const jumlahPaparan = document.getElementById("jumlahPaparan");
const carian = document.getElementById("carian");
const filterStatus = document.getElementById("filterStatus");
const connectionStatus = document.getElementById("connectionStatus");

// Simpan semua data yang telah diambil dari Supabase.
let semuaAhli = [];

// ============================================================
// UTILITI
// ============================================================
function escapeHTML(value) {
  if (value === null || value === undefined) return "";
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function formatNoAhli(no) {
  return "SW-" + String(no).padStart(5, "0");
}

function formatTarikh(value) {
  if (!value) return "-";
  return new Date(value).toLocaleDateString("ms-MY", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric"
  });
}

function paparMesej(teks, jenis) {
  message.textContent = teks;
  message.className = "message " + jenis;
}

function setConnection(ok) {
  connectionStatus.textContent = ok ? "Supabase Online" : "Supabase Error";
  connectionStatus.className = "status-pill " + (ok ? "online" : "offline");
}

// ============================================================
// LOAD DATA
// ============================================================
async function muatkanAhli() {
  const { data, error } = await supabaseClient
    .from("ahli")
    .select("*")
    .order("no_ahli", { ascending: false });

  if (error) {
    console.error(error);
    setConnection(false);
    senaraiAhli.innerHTML =
      `<tr><td colspan="7" class="center">Gagal mendapatkan data. Semak URL, key, table dan RLS Supabase.</td></tr>`;
    return;
  }

  setConnection(true);
  semuaAhli = data || [];
  paparJadual();
  kemaskiniDashboard();
}

function kemaskiniDashboard() {
  const aktif = semuaAhli.filter(a => a.status === "aktif").length;

  jumlahAhli.textContent = semuaAhli.length;
  jumlahAktif.textContent = aktif;
  ahliTerakhir.textContent = semuaAhli.length
    ? formatNoAhli(semuaAhli[0].no_ahli)
    : "-";
}

function paparJadual() {
  const q = carian.value.trim().toLowerCase();
  const f = filterStatus.value;

  const filtered = semuaAhli.filter(a => {
    const matchesSearch =
      !q ||
      (a.nama_penuh || "").toLowerCase().includes(q) ||
      (a.no_ic || "").toLowerCase().includes(q) ||
      (a.no_telefon || "").toLowerCase().includes(q);

    const matchesStatus = !f || a.status === f;
    return matchesSearch && matchesStatus;
  });

  jumlahPaparan.textContent = `${filtered.length} daripada ${semuaAhli.length} rekod`;

  if (!filtered.length) {
    senaraiAhli.innerHTML =
      `<tr><td colspan="7" class="center">Tiada rekod dijumpai.</td></tr>`;
    return;
  }

  senaraiAhli.innerHTML = filtered.map(a => {
    const statusClass = a.status === "aktif" ? "aktif" : "tidak-aktif";
    return `
      <tr>
        <td><strong>${formatNoAhli(a.no_ahli)}</strong></td>
        <td>${escapeHTML(a.nama_penuh)}</td>
        <td>${escapeHTML(a.no_ic)}</td>
        <td>${escapeHTML(a.no_telefon)}</td>
        <td><span class="badge ${statusClass}">${escapeHTML(a.status)}</span></td>
        <td>${formatTarikh(a.created_at)}</td>
        <td>
          <div class="actions">
            <button class="edit" onclick="mulaEdit('${a.id}')">Edit</button>
            <button class="danger" onclick="padamAhli('${a.id}', '${escapeHTML(a.nama_penuh)}')">Padam</button>
          </div>
        </td>
      </tr>
    `;
  }).join("");
}

// ============================================================
// TAMBAH / EDIT
// ============================================================
borang.addEventListener("submit", async (event) => {
  event.preventDefault();

  const payload = {
    nama_penuh: namaPenuh.value.trim(),
    no_ic: noIC.value.trim(),
    no_telefon: noTelefon.value.trim(),
    alamat: alamat.value.trim(),
    status: status.value
  };

  if (!payload.nama_penuh || !payload.no_ic || !payload.no_telefon || !payload.alamat) {
    paparMesej("Sila lengkapkan semua maklumat.", "error");
    return;
  }

  btnDaftar.disabled = true;
  btnDaftar.textContent = editId.value ? "SEDANG KEMASKINI..." : "SEDANG SIMPAN...";

  try {
    let result;

    if (editId.value) {
      result = await supabaseClient
        .from("ahli")
        .update(payload)
        .eq("id", editId.value)
        .select()
        .single();
    } else {
      result = await supabaseClient
        .from("ahli")
        .insert(payload)
        .select()
        .single();
    }

    if (result.error) {
      if (result.error.code === "23505") {
        throw new Error("No. IC ini sudah didaftarkan.");
      }
      throw result.error;
    }

    paparMesej(
      editId.value
        ? "Maklumat ahli berjaya dikemaskini."
        : `Pendaftaran berjaya! No. Keahlian ialah ${formatNoAhli(result.data.no_ahli)}.`,
      "success"
    );

    resetForm();
    await muatkanAhli();

  } catch (error) {
    console.error(error);
    paparMesej(error.message || "Operasi gagal.", "error");
  } finally {
    btnDaftar.disabled = false;
    btnDaftar.textContent = "SIMPAN AHLI";
  }
});

window.mulaEdit = function(id) {
  const ahli = semuaAhli.find(a => a.id === id);
  if (!ahli) return;

  editId.value = ahli.id;
  namaPenuh.value = ahli.nama_penuh || "";
  noIC.value = ahli.no_ic || "";
  noTelefon.value = ahli.no_telefon || "";
  alamat.value = ahli.alamat || "";
  status.value = ahli.status || "aktif";

  formTitle.textContent = `Edit ${formatNoAhli(ahli.no_ahli)}`;
  btnBatal.classList.remove("hidden");
  window.scrollTo({ top: 0, behavior: "smooth" });
};

function resetForm() {
  borang.reset();
  editId.value = "";
  status.value = "aktif";
  formTitle.textContent = "Daftar Ahli Baru";
  btnBatal.classList.add("hidden");
}

btnBatal.addEventListener("click", resetForm);

// ============================================================
// PADAM
// ============================================================
window.padamAhli = async function(id, nama) {
  const yakin = confirm(`Padam rekod ahli "${nama}"?\n\nTindakan ini tidak boleh dibuat semula.`);
  if (!yakin) return;

  const { error } = await supabaseClient
    .from("ahli")
    .delete()
    .eq("id", id);

  if (error) {
    console.error(error);
    paparMesej("Gagal memadam rekod. Semak RLS Supabase.", "error");
    return;
  }

  paparMesej("Rekod ahli berjaya dipadam.", "success");
  await muatkanAhli();
};

// ============================================================
// CARIAN / FILTER
// ============================================================
carian.addEventListener("input", paparJadual);
filterStatus.addEventListener("change", paparJadual);
document.getElementById("btnRefresh").addEventListener("click", muatkanAhli);

// ============================================================
// START
// ============================================================
muatkanAhli();
