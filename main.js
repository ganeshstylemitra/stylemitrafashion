async function loadData() {
  const res = await fetch("/content/data.json", { cache: "no-store" });
  if (!res.ok) throw new Error("Failed to load content/data.json");
  return await res.json();
}

function encodeWA(text) {
  return encodeURIComponent(text);
}

function waLink(numberE164, message) {
  // numberE164 example: 919284639028
  return `https://wa.me/${numberE164}?text=${encodeWA(message)}`;
}

function formatINR(n) {
  try { return new Intl.NumberFormat("en-IN").format(n); }
  catch { return String(n); }
}

function el(tag, attrs = {}, children = []) {
  const node = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs)) {
    if (k === "class") node.className = v;
    else if (k.startsWith("on") && typeof v === "function") node.addEventListener(k.slice(2), v);
    else node.setAttribute(k, v);
  }
  for (const child of children) {
    if (typeof child === "string") node.appendChild(document.createTextNode(child));
    else if (child) node.appendChild(child);
  }
  return node;
}

function normalize(s) {
  return (s || "").toString().toLowerCase().trim();
}

function buildProductCard(p, brand, waNumber) {
  const priceText = `₹${formatINR(p.price)}`;
  const message = `Hi ${brand}! I want to order: ${p.title} (${priceText}). Size: __  Qty: __  Address: __`;
  const a = el("a", {
    class: "btn btn-primary",
    href: waLink(waNumber, message),
    target: "_blank",
    rel: "noopener"
  }, ["Order on WhatsApp"]);

  return el("div", { class: "card", "data-category": p.category }, [
    el("div", { class: "card__imgwrap" }, [
      el("img", { class: "card__img", src: p.image, alt: p.title, loading: "lazy" })
    ]),
    el("div", { class: "card__body" }, [
      el("div", { class: "card__title" }, [p.title]),
      el("div", { class: "card__price" }, [priceText]),
    ]),
    el("div", { class: "wa" }, [a])
  ]);
}

function setActiveChip(chipEl) {
  document.querySelectorAll(".chip").forEach(c => c.classList.remove("chip--active"));
  chipEl.classList.add("chip--active");
}

function filterProducts(products, { category = "all", q = "" }) {
  const qq = normalize(q);
  return products.filter(p => {
    if (!p.active) return false;
    if (category !== "all" && p.category !== category) return false;
    if (qq && !normalize(p.title).includes(qq)) return false;
    return true;
  });
}

async function main() {
  const data = await loadData();

  // Header / hero
  document.getElementById("brandName").textContent = data.brandName;
  document.getElementById("brandNameFooter").textContent = data.brandName;
  document.getElementById("topbarText").textContent = data.topBarText;

  document.getElementById("heroTitle").textContent = data.hero.title;
  document.getElementById("heroSubtitle").textContent = data.hero.subtitle;
  document.getElementById("heroImage").src = data.hero.image;

  const heroMsg = `Hi ${data.brandName}! I want to place an order.`;
  const heroBtn = document.getElementById("heroWaBtn");
  heroBtn.textContent = data.hero.buttonText || "Order on WhatsApp";
  heroBtn.href = waLink(data.whatsappNumber, heroMsg);

  document.getElementById("trendingTitle").textContent = (data.sections && data.sections.trendingTitle) || "TRENDING NOW";
  document.getElementById("year").textContent = new Date().getFullYear();

  // Categories tiles
  const catsGrid = document.getElementById("categoriesGrid");
  catsGrid.innerHTML = "";
  (data.categories || []).forEach(c => {
    const tile = el("a", { class: "cat", href: "#products", onclick: (e) => { e.preventDefault(); applyFilter(c.key); } }, [
      el("div", { class: "cat__label" }, [c.label]),
      el("div", { class: "cat__sub" }, [c.label])
    ]);
    catsGrid.appendChild(tile);
  });

  // Filter chips (besides "All")
  const filterChips = document.getElementById("filterChips");
  filterChips.innerHTML = "";
  (data.categories || []).forEach(c => {
    const b = el("button", { class: "chip", "data-filter": c.key }, [c.label]);
    filterChips.appendChild(b);
  });

  const products = Array.isArray(data.products) ? data.products : [];
  const grid = document.getElementById("productsGrid");
  const empty = document.getElementById("emptyState");
  const searchBox = document.getElementById("searchBox");

  let state = { category: "all", q: "" };

  function render() {
    const list = filterProducts(products, state);
    grid.innerHTML = "";
    if (!list.length) {
      empty.classList.remove("hidden");
      return;
    }
    empty.classList.add("hidden");
    for (const p of list) grid.appendChild(buildProductCard(p, data.brandName, data.whatsappNumber));
  }

  function applyFilter(cat) {
    state.category = cat;
    // set active chip
    const chip = document.querySelector(`.chip[data-filter="${cat}"]`) || document.querySelector(`.chip[data-filter="all"]`);
    if (chip) setActiveChip(chip);
    render();
  }

  // Chip events
  document.querySelectorAll(".chip").forEach(chip => {
    chip.addEventListener("click", () => applyFilter(chip.getAttribute("data-filter") || "all"));
  });

  // Search
  searchBox.addEventListener("input", (e) => {
    state.q = e.target.value || "";
    render();
  });

  // Initial render
  render();
}

main().catch(err => {
  console.error(err);
  const msg = document.createElement("div");
  msg.style.padding = "14px";
  msg.style.border = "1px solid #e5e7eb";
  msg.style.borderRadius = "14px";
  msg.style.margin = "14px auto";
  msg.style.width = "min(1040px, 92vw)";
  msg.textContent = "Content load error: " + err.message + " (Check /content/data.json)";
  document.body.prepend(msg);
});
