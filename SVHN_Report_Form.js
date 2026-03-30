/**
 * SVHN_Report_Form.html — form logic (loads report-renderer.js for DEFAULTS).
 */
(function () {
  "use strict";

  var LS_KEY = "svhn-report-form-v1";
  var JSON_FILE_NAME = "report-contents.json";
  var jsonFileHandle = null;
  var sortableInstance = null;
  var fieldSortableInstances = [];

  var assign =
    Object.assign ||
    function (target) {
      for (var i = 1; i < arguments.length; i++) {
        var source = arguments[i];
        if (source) {
          for (var key in source) {
            if (Object.prototype.hasOwnProperty.call(source, key)) target[key] = source[key];
          }
        }
      }
      return target;
    };

  function getDefaults() {
    return window.ReportRenderer.DEFAULTS;
  }

  function getAnchors() {
    return window.ReportRenderer.TOC_ANCHORS;
  }

  function getSectionLabels() {
    return window.ReportRenderer.SECTION_FORM_LABELS;
  }

  document.getElementById("ls-key-label").textContent = LS_KEY;

  /** Only top-level section <details>; inner .sortable-fields-container also uses data-section-id and must be excluded. */
  function getSectionDetails() {
    var container = document.getElementById("sortable-sections");
    if (!container) return [];
    return container.querySelectorAll(":scope > details.sortable-section[data-section-id]");
  }

  function getSectionOrderFromDom() {
    var order = [];
    var container = document.getElementById("sortable-sections");
    if (!container) return window.ReportRenderer.DEFAULT_SECTION_ORDER.slice();
    getSectionDetails().forEach(function (el) {
      order.push(el.getAttribute("data-section-id"));
    });
    return order.length === 9 ? order : window.ReportRenderer.DEFAULT_SECTION_ORDER.slice();
  }

  function reorderSectionsDom(order) {
    var normalized = window.ReportRenderer.normalizeSectionOrder(order);
    var container = document.getElementById("sortable-sections");
    if (!container) return;
    normalized.forEach(function (id) {
      var node = container.querySelector(':scope > details.sortable-section[data-section-id="' + id + '"]');
      if (node) container.appendChild(node);
    });
  }

  function updateSectionSummaries() {
    var labels = getSectionLabels();
    var sections = getSectionDetails();
    sections.forEach(function (el, idx) {
      var id = el.getAttribute("data-section-id");
      var shortName = labels[id] || id;
      var span = el.querySelector(".section-summary-text");
      if (span) {
        span.textContent = "Section " + (idx + 1) + " — " + shortName;
      }
    });
  }

  /** Move TOC form rows to match body section order (same order as report TOC + links). */
  function reorderTocRows() {
    var host = document.getElementById("toc-inputs");
    var map = window.ReportRenderer.SECTION_ID_TO_TOC_INDEX;
    if (!host || !map) return;
    var order = getSectionOrderFromDom();
    order.forEach(function (sid) {
      var idx = map[sid];
      if (idx === undefined) return;
      var row = host.querySelector('.toc-row[data-toc-index="' + idx + '"]');
      if (row) host.appendChild(row);
    });
  }

  function initSortable() {
    var el = document.getElementById("sortable-sections");
    if (!el || typeof Sortable === "undefined") return;
    if (sortableInstance) {
      sortableInstance.destroy();
      sortableInstance = null;
    }
    sortableInstance = new Sortable(el, {
      handle: ".drag-handle",
      animation: 150,
      ghostClass: "sortable-ghost",
      onEnd: function () {
        updateSectionSummaries();
        reorderTocRows();
        scheduleSave();
      }
    });
  }

  function initFieldSortables() {
    if (typeof Sortable === "undefined") return;
    fieldSortableInstances.forEach(function (s) {
      try {
        s.destroy();
      } catch (e) {
        /* ignore */
      }
    });
    fieldSortableInstances = [];
    document.querySelectorAll(".sortable-fields-container").forEach(function (container) {
      var inst = new Sortable(container, {
        handle: ".field-drag-handle",
        animation: 150,
        ghostClass: "sortable-ghost",
        onEnd: function () {
          scheduleSave();
        }
      });
      fieldSortableInstances.push(inst);
    });
  }

  function collectFieldOrderFromDom() {
    var out = {};
    document.querySelectorAll(".sortable-fields-container").forEach(function (container) {
      var sid = container.getAttribute("data-section-id");
      if (!sid) return;
      var keys = [];
      container.querySelectorAll(".sortable-field-wrap[data-field-key]").forEach(function (w) {
        keys.push(w.getAttribute("data-field-key"));
      });
      if (keys.length) out[sid] = keys;
    });
    return out;
  }

  function reorderFieldsDom(merged) {
    var RR = window.ReportRenderer;
    var def = RR.DEFAULT_FIELD_ORDER;
    if (!merged || !def) return;
    var sid;
    for (sid in def) {
      if (!Object.prototype.hasOwnProperty.call(def, sid)) continue;
      var order = RR.normalizeFieldOrderSection(merged, sid);
      var container = document.querySelector('.sortable-fields-container[data-section-id="' + sid + '"]');
      if (!container) continue;
      order.forEach(function (key) {
        var wrap = container.querySelector('.sortable-field-wrap[data-field-key="' + key + '"]');
        if (wrap) container.appendChild(wrap);
      });
    }
  }

  function applySectionChapterTitles(merged) {
    if (!merged || !merged.toc_titles) return;
    document.querySelectorAll(".section-chapter-title").forEach(function (inp) {
      var idx = inp.getAttribute("data-toc-index");
      if (idx == null) return;
      var i = parseInt(idx, 10);
      if (isNaN(i) || i < 0 || i >= merged.toc_titles.length) return;
      var v = merged.toc_titles[i];
      inp.value = v != null ? String(v) : "";
    });
  }

  function bindChapterTitleTocSync() {
    var form = document.getElementById("report-form");
    if (!form || form._chapterTocSyncBound) return;
    form._chapterTocSyncBound = true;
    form.addEventListener("input", function (e) {
      var t = e.target;
      if (t.classList && t.classList.contains("section-chapter-title")) {
        var idx = t.getAttribute("data-toc-index");
        if (idx == null) return;
        var tocIn = document.getElementById("toc_title_" + idx);
        if (tocIn) tocIn.value = t.value;
        return;
      }
      if (t.id && /^toc_title_\d+$/.test(t.id)) {
        var idx2 = t.id.replace("toc_title_", "");
        var sec = document.querySelector('.section-chapter-title[data-toc-index="' + idx2 + '"]');
        if (sec) sec.value = t.value;
      }
    });
  }

  function collectData() {
    var form = document.getElementById("report-form");
    var d = JSON.parse(JSON.stringify(getDefaults()));
    form.querySelectorAll("[data-key]").forEach(function (el) {
      var key = el.getAttribute("data-key");
      if (el.tagName === "SELECT") d[key] = el.value;
      else d[key] = el.value;
    });
    d.toc_titles = [];
    d.toc_pages = [];
    var anchors = getAnchors();
    for (var i = 0; i < anchors.length; i++) {
      var ti = document.getElementById("toc_title_" + i);
      var pi = document.getElementById("toc_page_" + i);
      d.toc_titles.push(ti ? ti.value : "");
      d.toc_pages.push(pi ? pi.value : "");
    }
    document.querySelectorAll("[data-md-for]").forEach(function (el) {
      var fk = el.getAttribute("data-md-for");
      if (fk) d["md_" + fk] = el.checked;
    });
    d.section_order = getSectionOrderFromDom();
    assign(d.field_order, collectFieldOrderFromDom());
    d.table_rows = collectTableRows();
    d.ann_findings = "";
    d.ann_overall = "";
    d.md_ann_findings = false;
    d.md_ann_overall = false;
    return d;
  }

  function collectTableRows() {
    var rows = [];
    var host = document.getElementById("table-models-editor");
    if (!host) return getDefaults().table_rows.slice();
    var trs = host.querySelectorAll(".tr:not(.th)");
    trs.forEach(function (row) {
      var inputs = row.querySelectorAll("input[type=text]");
      if (inputs.length >= 3) {
        rows.push({
          model: inputs[0].value,
          arch: inputs[1].value,
          acc: inputs[2].value
        });
      }
    });
    return rows.length ? rows : [{ model: "", arch: "", acc: "" }];
  }

  function renderTableEditor(rows) {
    var host = document.getElementById("table-models-editor");
    var toolbar = document.getElementById("table-models-toolbar");
    if (!host) return;
    if (!rows || !rows.length) {
      rows = [{ model: "", arch: "", acc: "" }];
    }
    host.innerHTML =
      '<div class="tr th"><span>Model</span><span>Architecture</span><span>Test accuracy</span></div>';
    rows.forEach(function (row, r) {
      var div = document.createElement("div");
      div.className = "tr";
      div.setAttribute("data-row-index", String(r));
      var rm =
        rows.length > 1
          ? '<button type="button" class="table-row-remove" data-remove-row="' +
            r +
            '" aria-label="Remove row">Remove</button>'
          : "";
      div.innerHTML =
        '<input type="text" class="tm-in" data-tm="m" placeholder="Model" />' +
        '<input type="text" class="tm-in" data-tm="a" placeholder="Architecture" />' +
        '<div style="display:flex;align-items:center;gap:0.35rem;flex-wrap:wrap;">' +
        '<input type="text" class="tm-in" data-tm="z" placeholder="Accuracy" />' +
        rm +
        "</div>";
      var inputs = div.querySelectorAll(".tm-in");
      inputs[0].value = row.model != null ? row.model : "";
      inputs[1].value = row.arch != null ? row.arch : "";
      inputs[2].value = row.acc != null ? row.acc : "";
      host.appendChild(div);
      var btn = div.querySelector("[data-remove-row]");
      if (btn) {
        btn.addEventListener("click", function () {
          var cur = collectTableRows();
          var idx = parseInt(btn.getAttribute("data-remove-row"), 10);
          if (cur.length <= 1 || idx < 0 || idx >= cur.length) return;
          cur.splice(idx, 1);
          renderTableEditor(cur);
          scheduleSave();
        });
      }
    });
    if (toolbar) {
      toolbar.innerHTML =
        '<button type="button" id="btn-add-table-row">+ Add table row</button>' +
        '<span class="sub" style="font-size:0.78rem;color:#6b7280;">Rows are saved in report-contents.json and appear in Table 1 in the PDF.</span>';
      var addBtn = document.getElementById("btn-add-table-row");
      if (addBtn) {
        addBtn.addEventListener("click", function () {
          var cur = collectTableRows();
          cur.push({ model: "", arch: "", acc: "" });
          renderTableEditor(cur);
          scheduleSave();
        });
      }
    }
    host.querySelectorAll(".tm-in").forEach(function (inp) {
      inp.addEventListener("input", scheduleSave);
    });
  }

  function applyData(d) {
    var form = document.getElementById("report-form");
    var merged = window.ReportRenderer.mergeData(d);
    form.querySelectorAll("[data-key]").forEach(function (el) {
      var key = el.getAttribute("data-key");
      if (merged[key] !== undefined) {
        if (el.tagName === "SELECT") el.value = merged[key];
        else el.value = merged[key] != null ? merged[key] : "";
      }
    });
    var anchors = getAnchors();
    for (var i = 0; i < anchors.length; i++) {
      document.getElementById("toc_title_" + i).value = (merged.toc_titles && merged.toc_titles[i]) || "";
      document.getElementById("toc_page_" + i).value = (merged.toc_pages && merged.toc_pages[i]) || "";
    }
    document.querySelectorAll("[data-md-for]").forEach(function (el) {
      var fk = el.getAttribute("data-md-for");
      if (fk) el.checked = !!merged["md_" + fk];
    });
    reorderSectionsDom(merged.section_order);
    renderTableEditor(merged.table_rows);
    applySectionChapterTitles(merged);
    reorderFieldsDom(merged);
    updateSectionSummaries();
    reorderTocRows();
    initSortable();
    initFieldSortables();
  }

  function renderTocInputs() {
    var host = document.getElementById("toc-inputs");
    host.innerHTML = "";
    getAnchors().forEach(function (a, i) {
      var row = document.createElement("div");
      row.className = "toc-row";
      row.setAttribute("data-toc-index", String(i));
      var anchorSpan = document.createElement("span");
      anchorSpan.className = "toc-row-anchor";
      anchorSpan.title = "Target anchor in SVHN_Digit_Recognition_Report.html (link order follows section order)";
      anchorSpan.textContent = "#" + a.anchor;
      var inTitle = document.createElement("input");
      inTitle.type = "text";
      inTitle.id = "toc_title_" + i;
      inTitle.placeholder = "Section title";
      var inPage = document.createElement("input");
      inPage.type = "text";
      inPage.id = "toc_page_" + i;
      inPage.placeholder = "#";
      row.appendChild(anchorSpan);
      row.appendChild(inTitle);
      row.appendChild(inPage);
      host.appendChild(row);
    });
    reorderTocRows();
  }

  function saveLs() {
    try {
      localStorage.setItem(LS_KEY, JSON.stringify(collectData()));
      flashStatus("Saved draft in this browser.");
    } catch (e) {
      flashStatus("Could not save: " + e.message);
    }
  }

  var saveTimer;
  function scheduleSave() {
    clearTimeout(saveTimer);
    saveTimer = setTimeout(saveLs, 400);
  }

  function flashStatus(msg) {
    var el = document.getElementById("status");
    el.textContent = msg;
    clearTimeout(flashStatus._t);
    flashStatus._t = setTimeout(function () {
      el.textContent = "Edits auto-save as a draft in this browser. Use Update JSON to write report-contents.json.";
    }, 3200);
  }

  function loadLs() {
    try {
      var raw = localStorage.getItem(LS_KEY);
      if (!raw) return false;
      var d = JSON.parse(raw);
      applyData(assign({}, getDefaults(), d));
      return true;
    } catch (e) {
      return false;
    }
  }

  async function loadFromProjectJson() {
    try {
      var r = await fetch(JSON_FILE_NAME, { cache: "no-store" });
      if (!r.ok) throw new Error("HTTP " + r.status);
      var d = await r.json();
      applyData(d);
      flashStatus("Loaded " + JSON_FILE_NAME + " from the project folder.");
    } catch (e) {
      flashStatus("Could not fetch " + JSON_FILE_NAME + " — use a local server or Connect JSON file. (" + e.message + ")");
    }
  }

  async function reloadFromJson() {
    await loadFromProjectJson();
  }

  async function connectJsonFile() {
    if (!window.showOpenFilePicker) {
      alert("Your browser does not support choosing a file to update. Use Chrome or Edge, or Import JSON.");
      return;
    }
    try {
      var handles = await window.showOpenFilePicker({
        types: [{ description: "JSON", accept: { "application/json": [".json"] } }]
      });
      jsonFileHandle = handles[0];
      var file = await jsonFileHandle.getFile();
      var text = await file.text();
      var obj = JSON.parse(text);
      applyData(obj);
      saveLs();
      flashStatus("Connected " + file.name + " — click Update JSON to save changes to this file.");
    } catch (e) {
      if (e.name !== "AbortError") alert(e.message);
    }
  }

  async function updateJson() {
    var data = collectData();
    var text = JSON.stringify(data, null, 2);

    if (jsonFileHandle && jsonFileHandle.createWritable) {
      try {
        var w = await jsonFileHandle.createWritable();
        await w.write(text);
        await w.close();
        flashStatus("Updated " + JSON_FILE_NAME + " on disk. Refresh the report page.");
        return;
      } catch (e) {
        console.warn(e);
      }
    }

    if (window.showSaveFilePicker) {
      try {
        var handle = await window.showSaveFilePicker({
          suggestedName: JSON_FILE_NAME,
          types: [{ description: "JSON", accept: { "application/json": [".json"] } }]
        });
        jsonFileHandle = handle;
        var w2 = await handle.createWritable();
        await w2.write(text);
        await w2.close();
        flashStatus("Saved " + JSON_FILE_NAME + ". Refresh the report page.");
        return;
      } catch (e) {
        if (e.name === "AbortError") return;
        console.warn(e);
      }
    }

    var blob = new Blob([text], { type: "application/json;charset=utf-8" });
    var a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = JSON_FILE_NAME;
    a.click();
    URL.revokeObjectURL(a.href);
    flashStatus("Downloaded " + JSON_FILE_NAME + " — replace the file in your project folder, then refresh the report.");
  }

  function exportJsonCopy() {
    var blob = new Blob([JSON.stringify(collectData(), null, 2)], { type: "application/json;charset=utf-8" });
    var a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "report-contents-backup.json";
    a.click();
    URL.revokeObjectURL(a.href);
    flashStatus("Downloaded a backup copy.");
  }

  function importJsonFile(file) {
    var r = new FileReader();
    r.onload = function () {
      try {
        var obj = JSON.parse(r.result);
        applyData(obj);
        saveLs();
        flashStatus("Imported JSON into the form.");
      } catch (e) {
        alert("Could not read JSON: " + e.message);
      }
    };
    r.readAsText(file);
  }

  async function init() {
    bindChapterTitleTocSync();
    renderTocInputs();
    renderTableEditor(getDefaults().table_rows);
    try {
      var r = await fetch(JSON_FILE_NAME, { cache: "no-store" });
      if (r.ok) {
        var d = await r.json();
        applyData(d);
        flashStatus("Loaded " + JSON_FILE_NAME + ".");
        return;
      }
    } catch (e) {
      /* file:// or missing */
    }
    if (loadLs()) {
      flashStatus("Loaded saved draft from this browser.");
      return;
    }
    applyData(getDefaults());
  }

  document.getElementById("report-form").addEventListener("input", scheduleSave);
  document.getElementById("report-form").addEventListener("change", scheduleSave);

  document.getElementById("btn-defaults").addEventListener("click", function () {
    if (confirm("Reset all fields to the built-in defaults (from report-renderer.js)?")) {
      localStorage.removeItem(LS_KEY);
      jsonFileHandle = null;
      applyData(getDefaults());
      flashStatus("Restored defaults.");
    }
  });

  document.getElementById("btn-update-json").addEventListener("click", function () {
    updateJson();
  });
  document.getElementById("btn-reload-json").addEventListener("click", function () {
    reloadFromJson();
  });
  document.getElementById("btn-connect-json").addEventListener("click", function () {
    connectJsonFile();
  });
  document.getElementById("btn-export-copy").addEventListener("click", exportJsonCopy);

  document.getElementById("import-json").addEventListener("change", function (e) {
    var f = e.target.files && e.target.files[0];
    if (f) importJsonFile(f);
    e.target.value = "";
  });

  init();
})();
