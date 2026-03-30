/**
 * Shared report rendering for SVHN_Digit_Recognition_Report.html and SVHN_Report_Form.html
 * Loads data from report-contents.json (merged with DEFAULTS for missing keys).
 */
(function (global) {
  "use strict";

  function assign(target) {
    for (var i = 1; i < arguments.length; i++) {
      var source = arguments[i];
      if (source) {
        for (var key in source) {
          if (Object.prototype.hasOwnProperty.call(source, key)) target[key] = source[key];
        }
      }
    }
    return target;
  }

  var TOC_ANCHORS = [
    { anchor: "business-problem" },
    { anchor: "data-overview" },
    { anchor: "preprocess-ann" },
    { anchor: "performance-ann" },
    { anchor: "preprocess-cnn" },
    { anchor: "performance-cnn" },
    { anchor: "final-model" },
    { anchor: "conclusion" },
    { anchor: "appendix" }
  ];

  /** Order of body sections in the report + form (permutation of these 9 ids). */
  var DEFAULT_SECTION_ORDER = [
    "business",
    "data",
    "ann_prep",
    "ann_perf",
    "cnn_prep",
    "cnn_perf",
    "final",
    "conclusion",
    "appendix"
  ];

  var SECTION_ID_TO_TOC_INDEX = {
    business: 0,
    data: 1,
    ann_prep: 2,
    ann_perf: 3,
    cnn_prep: 4,
    cnn_perf: 5,
    final: 6,
    conclusion: 7,
    appendix: 8
  };

  /** Short labels for form section summaries */
  var SECTION_FORM_LABELS = {
    business: "Business problem",
    data: "Data overview",
    ann_prep: "ANN preprocessing",
    ann_perf: "ANN performance",
    cnn_prep: "CNN preprocessing",
    cnn_perf: "CNN performance",
    final: "Final model",
    conclusion: "Conclusion",
    appendix: "Appendix"
  };

  function normalizeSectionOrder(order) {
    var def = DEFAULT_SECTION_ORDER.slice();
    if (!order || !Array.isArray(order) || order.length !== 9) return def;
    var seen = {};
    var i;
    for (i = 0; i < order.length; i++) {
      if (SECTION_ID_TO_TOC_INDEX[order[i]] === undefined) return def;
      if (seen[order[i]]) return def;
      seen[order[i]] = true;
    }
    for (var k in SECTION_ID_TO_TOC_INDEX) {
      if (Object.prototype.hasOwnProperty.call(SECTION_ID_TO_TOC_INDEX, k) && !seen[k]) return def;
    }
    return order.slice();
  }

  var DEFAULTS = {
    cover_title: "SVHN Digit Recognition",
    cover_subtitle: "Deep Learning",
    cover_client: "Case study: Acme Delivery Services",
    brand_strong: "SVHN digit recognition",
    brand_span: "Phase evaluation · Case study (Acme)",
    cover_footer_prefix: "Phase evaluation report",
    date_mode: "today",
    report_date_fixed: "",
    section_order: DEFAULT_SECTION_ORDER.slice(),
    toc_titles: [
      "Business Problem Overview and Solution Approach",
      "Data Overview",
      "Data Preprocessing for ANNs",
      "Model Performance Summary for ANNs",
      "Data Preprocessing for CNNs",
      "Model Performance Summary for CNNs",
      "Choosing the Final Model",
      "Conclusion",
      "Appendix"
    ],
    toc_pages: ["3", "4", "5", "6", "7", "8", "9", "10", "11"],
    intro_p1:
      "Acme Delivery Services, Inc. is a last-mile parcel delivery company operating across North America. Acme has relied on Google Maps to support its drivers in the field, but API licensing costs for its delivery app continue to rise. To get ahead of these costs, Acme is building a proprietary mapping and address solution into its driver app.",
    intro_p2:
      "Acme has contracted with Great Learning to assist in early-stage development of an SVHN (Street View House Number) digit transcription model. This report details four approaches evaluated during this phase and our recommended direction for continued development.",
    meth_p1:
      "In trialing and selecting a model design, we followed a best-practice approach: starting conservative with minimal hardware requirements, then increasing complexity only where generalization improved.",
    meth_p2:
      "Four models were evaluated across two architectural families to identify the best approach for digit transcription at scale. Each family included a simpler baseline and a deeper regularized variant, allowing direct comparison of complexity vs. generalization.",
    table_rows: [
      { model: "ANN 1", arch: "Fully connected · 2 hidden layers", acc: "~66%" },
      { model: "ANN 2", arch: "Fully connected · 5 hidden layers · Dropout · Batch norm", acc: "~76%" },
      { model: "CNN 1", arch: "2 convolutional layers · max pooling", acc: "~91%" },
      { model: "CNN 2", arch: "4 convolutional layers · 2× batch norm · Dropout", acc: "~91% (overfitting observed)" }
    ],
    caption_table1: "Table 1: The four models tested and their accuracy outcomes.",
    callout_title: "Recommended model: CNN 1",
    callout_body:
      "CNN 1 matched CNN 2's test accuracy at 91% while showing better generalization; CNN 2 exhibited clear overfitting with validation accuracy drifting downward across 30 epochs. CNNs outperformed both ANN models by a significant margin, confirming that spatial feature extraction is essential for real-world digit recognition.",
    data_intro: "The dataset was provided to Great Learning by Acme, Inc.",
    data_bullets:
      "Source: Street View House Numbers (SVHN) dataset.\nData type: The dataset comprises 32×32 pixel RGB images of individual digits cropped from real-world street photography.\nSubset used: 42,000 training images / 18,000 test images.\nClasses: 10 classes representing digits 0–9.\nBalance: The dataset is well-balanced: each digit class contains approximately 1,700–1,830 test samples, making overall accuracy a reliable performance metric.",
    data_closing:
      "Basic preprocessing (normalization, one-hot encoding, reshaping) was applied prior to model training; details in the following sections.",
    ann_h4: "ANNs — Artificial Neural Networks",
    ann_prep_bullets:
      "Images were flattened from 32×32×3 (RGB) to a 1,024-element vector because fully connected layers require a 1D input and cannot process spatial dimensions.\nPixel values normalized from [0, 255] to [0, 1] by dividing by 255, stabilizing gradient updates during training.\nLabels one-hot encoded using to_categorical, producing a 10-element binary vector per sample for compatibility with the softmax output layer.\nResulting shapes: training (42000, 1024) · test (18000, 1024).",
    fig1_caption: "Figure 1: The first ten labels, showing one-hot encoding.",
    fig1_note: "Replace this box with a screenshot or export from the notebook (one-hot label vectors).",
    fig1_src: "",
    fig1_svg: "",
    ann_perf_diff:
      "Differences between the two ANN models. ANN 1 used a smaller fully connected stack (two hidden layers); ANN 2 added depth (five hidden layers), dropout, and batch normalization to improve generalization and capacity.",
    ann_arch_note: "",
    ann_arch_src: "",
    ann_arch_svg: "",
    ann_arch_caption: "Figure: ANN 1 vs ANN 2 architecture comparison (fully connected stacks, layer sizes, and regularization).",
    ann1_fig_acc_note: "",
    ann1_fig_acc_src: "",
    ann1_fig_acc_svg: "",
    ann1_fig_acc_caption: "Figure 2: Training vs. validation accuracy — ANN 1.",
    ann1_obs:
      "Training and validation accuracy rose together and stayed close; by epoch 20 gains had slowed, suggesting the model was near what this ANN setup can reach without architecture changes.",
    ann_fig_acc_caption: "Training vs. validation accuracy — ANN 2 (recommended ANN for comparison).",
    ann_fig_acc_note: "Caption under the plot (optional).",
    ann_fig_acc_src: "",
    ann_fig_acc_svg: "",
    ann_precision_note:
      "Paste the sklearn classification_report output, or a Markdown table of precision / recall / F1 per digit. Summarize weaker digits if you prefer prose.",
    ann_cm_note: "Confusion matrix (heatmap) for ANN 2 on the test set.",
    ann_cm_src: "",
    ann_cm_svg: "",
    ann_findings: "",
    ann_overall: "",
    ann_observations:
      "Findings. Document 2–3 confusion pairs (e.g. 3↔5, 2↔7) and relate them to the lack of spatial structure in flattened inputs.\n\nOverall observations. Summarize gap between train/val, test accuracy ~76%, and suitability as a baseline only.",
    cnn_h4: "CNNs — Convolutional Neural Networks",
    cnn_prep_bullets:
      "Dataset reloaded fresh to allow independent reshaping from the ANN preprocessing pipeline.\nImages reshaped from (42000, 32, 32, 3) to (42000, 32, 32, 1).\nRGB color channels collapsed to grayscale; CNNs in this trial were designed to process single-channel input.\nPixel values normalized from [0, 255] to [0, 1] by dividing by 255.\nLabels one-hot encoded using to_categorical, producing a 10-element binary vector per sample.\nResulting shapes: training (42000, 32, 32, 1) · test (18000, 32, 32, 1).",
    cnn_diff:
      "Differences between the two CNN models. CNN 1 uses a shallower convolutional stack with pooling; CNN 2 adds depth, extra convolutional blocks, batch normalization layers, and dropout, increasing capacity (and overfitting risk).",
    cnn_arch_note: "",
    cnn_arch_src: "assets/cnn_arch_comparison.png",
    cnn_arch_svg: "",
    cnn_arch_caption: "Figure: CNN 1 vs CNN 2 architecture comparison (convolutional blocks, pooling, and classifier head).",
    cnn_fig1_caption: "Training vs. validation accuracy — CNN 1 (recommended for generalization).",
    cnn_fig1_note: "Insert CNN 1 accuracy plot.",
    cnn_fig1_src: "",
    cnn_fig1_svg: "",
    cnn_fig2_caption: "Optional: CNN 2 accuracy plot (illustrate overfitting).",
    cnn_fig2_note: "Insert CNN 2 accuracy plot.",
    cnn_fig2_src: "",
    cnn_fig2_svg: "",
    cnn_precision_note:
      "Precision and F1 by digit; confusion matrix. Use the test-set classification report and heatmap for your chosen CNN (CNN 1 and/or CNN 2).",
    cnn_cm_note: "Confusion matrix (heatmap) — CNN (test set).",
    cnn_cm_src: "",
    cnn_cm_svg: "",
    cnn_overall:
      "Overall observations. Contrast CNN vs ANN error patterns; note validation behavior for CNN 2 vs CNN 1.",
    final_p:
      "Expand on the recommendation stated above: CNN 1 as the preferred solution for continued development — matching top-tier test accuracy with more stable validation behavior, while CNN 2 shows diminishing returns and overfitting over long training. Reference Table 1 and the performance plots as evidence.",
    conclusion_p:
      "Recap the business goal, what was demonstrated with the four models, and next steps for Acme — for example integration into the driver app pipeline, evaluation on harder street scenes, or specialist models for confused digit pairs.",
    appendix_p1: "Additional details on the analysis, such as code snippets or technical diagrams.",
    appendix_p2:
      "Supplementary materials: Jupyter notebook (High_Code_SVHN_Digit_Recognition.ipynb), environment (TensorFlow version, hardware), and hyperparameters (epochs, batch size, learning rates) as needed."
  };

  /** Default field order within each body section (form + PDF). Keys must match form data-field-key. */
  var DEFAULT_FIELD_ORDER = {
    business: [
      "h3_intro",
      "intro_p1",
      "intro_p2",
      "h3_solution",
      "meth_p1",
      "meth_p2",
      "table_models",
      "caption_table1",
      "callout_block"
    ],
    data: ["data_intro", "data_bullets", "data_closing"],
    ann_prep: ["ann_h4", "ann_prep_bullets", "fig1_caption", "fig1_figure"],
    ann_perf: [
      "ann_perf_diff",
      "ann_arch_figure",
      "ann_arch_caption",
      "ann1_fig_acc_figure",
      "ann1_fig_acc_caption",
      "ann1_obs",
      "ann_fig_acc_figure",
      "ann_fig_acc_caption",
      "ann_precision_note",
      "ann_cm_figure",
      "ann_observations"
    ],
    cnn_prep: ["cnn_h4", "cnn_prep_bullets"],
    cnn_perf: [
      "cnn_diff",
      "cnn_arch_figure",
      "cnn_arch_caption",
      "cnn_fig1_caption",
      "cnn_fig1_figure",
      "cnn_fig2_caption",
      "cnn_fig2_figure",
      "cnn_precision_note",
      "cnn_cm_figure",
      "cnn_overall"
    ],
    final: ["final_p"],
    conclusion: ["conclusion_p"],
    appendix: ["appendix_p1", "appendix_p2"]
  };

  (function initMdDefaults() {
    var keys = [
      "intro_p1",
      "intro_p2",
      "meth_p1",
      "meth_p2",
      "caption_table1",
      "callout_body",
      "data_intro",
      "data_bullets",
      "data_closing",
      "ann_prep_bullets",
      "fig1_note",
      "ann_perf_diff",
      "ann_arch_note",
      "ann1_fig_acc_note",
      "ann1_obs",
      "ann_fig_acc_note",
      "ann_precision_note",
      "ann_cm_note",
      "ann_observations",
      "cnn_prep_bullets",
      "cnn_diff",
      "cnn_arch_note",
      "cnn_fig1_note",
      "cnn_fig2_note",
      "cnn_precision_note",
      "cnn_cm_note",
      "cnn_overall",
      "final_p",
      "conclusion_p",
      "appendix_p1",
      "appendix_p2"
    ];
    var i;
    for (i = 0; i < keys.length; i++) {
      DEFAULTS["md_" + keys[i]] = false;
    }
  })();

  (function initFieldOrderDefaults() {
    DEFAULTS.field_order = {};
    var sid;
    for (sid in DEFAULT_FIELD_ORDER) {
      if (Object.prototype.hasOwnProperty.call(DEFAULT_FIELD_ORDER, sid)) {
        DEFAULTS.field_order[sid] = DEFAULT_FIELD_ORDER[sid].slice();
      }
    }
  })();

  function escapeHtml(s) {
    if (s == null) return "";
    return String(s)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function escapeAttr(s) {
    return escapeHtml(s).replace(/'/g, "&#39;");
  }

  function bulletsFromLines(text) {
    var lines = String(text || "")
      .split(/\r?\n/)
      .map(function (l) {
        return l.trim();
      })
      .filter(Boolean);
    if (!lines.length) return "<li></li>";
    return lines
      .map(function (line) {
        var m = line.match(/^([^:]+):\s*(.+)$/);
        if (m) {
          return "<li><strong>" + escapeHtml(m[1]) + ":</strong> " + escapeHtml(m[2]) + "</li>";
        }
        return "<li>" + escapeHtml(line) + "</li>";
      })
      .join("\n");
  }

  function mdFlag(d, key) {
    return !!(d && d["md_" + key]);
  }

  function markdownToHtml(src) {
    var raw = String(src || "").trim();
    if (!raw) return "";
    var g = typeof global !== "undefined" ? global : {};
    if (g.marked && g.DOMPurify) {
      try {
        var dirty = g.marked.parse(raw, { breaks: true, gfm: true });
        return g.DOMPurify.sanitize(dirty, {
          ALLOWED_TAGS: [
            "p",
            "br",
            "strong",
            "em",
            "b",
            "i",
            "u",
            "ul",
            "ol",
            "li",
            "a",
            "code",
            "pre",
            "blockquote",
            "h1",
            "h2",
            "h3",
            "h4",
            "h5",
            "h6",
            "hr",
            "table",
            "thead",
            "tbody",
            "tr",
            "th",
            "td"
          ],
          ALLOWED_ATTR: ["href", "title", "colspan", "rowspan"],
          ALLOW_DATA_ATTR: false
        });
      } catch (e) {
        return "<p>" + escapeHtml(raw) + "</p>";
      }
    }
    return "<p>" + escapeHtml(raw).replace(/\n/g, "<br />") + "</p>";
  }

  function paragraphHtml(d, key) {
    if (mdFlag(d, key)) {
      return '<div class="md-content">' + markdownToHtml(d[key]) + "</div>\n";
    }
    return "<p>" + escapeHtml(d[key]) + "</p>\n";
  }

  function leadParagraphHtml(d, key) {
    if (mdFlag(d, key)) {
      return '<div class="md-content">' + markdownToHtml(d[key]) + "</div>\n";
    }
    return leadParagraph(d[key]);
  }

  function bulletSectionHtml(d, key) {
    if (mdFlag(d, key)) {
      return '<div class="md-content">' + markdownToHtml(d[key]) + "</div>\n";
    }
    return "<ul>\n" + bulletsFromLines(d[key]) + "\n</ul>\n";
  }

  function appendixParagraphHtml(d, key) {
    if (mdFlag(d, key)) {
      return '<div class="appendix-note md-content">' + markdownToHtml(d[key]) + "</div>\n";
    }
    return '<p class="appendix-note">' + escapeHtml(d[key]) + "</p>\n";
  }

  /** If the user pasted only inner elements (e.g. &lt;path&gt;…), wrap in a root &lt;svg&gt;. */
  function wrapSvgFragment(raw) {
    var t = String(raw || "").trim();
    if (!t) return "";
    if (/^<\s*svg[\s>]/i.test(t)) return t;
    return (
      '<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" role="img" aria-hidden="true" class="report-svg-root">' +
      t +
      "</svg>"
    );
  }

  function minimalSvgSanitize(s) {
    var t = String(s || "");
    t = t.replace(/<\/(?:script|foreignObject)\b[^>]*>/gi, "");
    t = t.replace(/<(?:script|foreignObject)\b[^>]*>[\s\S]*?<\/(?:script|foreignObject)>/gi, "");
    t = t.replace(/<(?:script|foreignObject)\b[^/>]*\/>/gi, "");
    t = t.replace(/\s(on\w+|href\s*=\s*["']?\s*javascript:)\s*=\s*("[^"]*"|'[^']*'|[^\s>]+)/gi, "");
    return t;
  }

  function sanitizeInlineSvg(svgString) {
    if (!svgString || !String(svgString).trim()) return "";
    if (global.DOMPurify && typeof global.DOMPurify.sanitize === "function") {
      try {
        return global.DOMPurify.sanitize(svgString, {
          USE_PROFILES: { svg: true, svgFilters: true }
        });
      } catch (e) {
        return "";
      }
    }
    return minimalSvgSanitize(svgString);
  }

  /**
   * Renders a figure box: optional inline SVG (svgKey) takes precedence over image URL (srcKey).
   * @param {string} [svgKey] — data key for pasted SVG markup (e.g. fig1_svg)
   */
  function figureHtml(d, noteKey, srcKey, alt, svgKey) {
    var note = d[noteKey];
    var s = (d[srcKey] || "").trim();
    var svgRaw = svgKey ? String(d[svgKey] || "").trim() : "";
    var noteHtml = "";
    if (note) {
      if (mdFlag(d, noteKey)) {
        noteHtml = '<div class="figure-caption md-content">' + markdownToHtml(note) + "</div>";
      } else {
        noteHtml =
          '<p class="figure-caption">' + escapeHtml(note).replace(/\n/g, "<br />") + "</p>";
      }
    }
    var graphicHtml = "";
    if (svgRaw) {
      var wrapped = wrapSvgFragment(svgRaw);
      var safe = sanitizeInlineSvg(wrapped);
      if (safe) {
        graphicHtml =
          '<div class="figure-svg-wrap" role="img" aria-label="' + escapeAttr(alt || "Figure") + '">' + safe + "</div>";
      }
    }
    if (!graphicHtml && s) {
      graphicHtml =
        '<img src="' +
        escapeAttr(s) +
        '" alt="' +
        escapeAttr(alt || "Figure") +
        '" />';
    }
    if (graphicHtml) {
      return '<div class="figure-box">' + graphicHtml + noteHtml + "</div>";
    }
    if (note) {
      if (mdFlag(d, noteKey)) {
        return '<div class="figure-box">' + noteHtml + "</div>";
      }
      return '<div class="figure-box">' + escapeHtml(note).replace(/\n/g, "<br />") + "</div>";
    }
    return '<div class="figure-box"></div>';
  }

  function leadParagraph(text) {
    var t = String(text || "").trim();
    if (!t) return "";
    var parts = t.split(/^([^.!?]+[.!?])\s*/);
    if (parts.length >= 3 && parts[1]) {
      return "<p><strong>" + escapeHtml(parts[1]) + "</strong> " + escapeHtml(parts[2]) + "</p>";
    }
    return "<p>" + escapeHtml(t) + "</p>";
  }

  function buildTocHtml(d) {
    var titles = d.toc_titles || DEFAULTS.toc_titles;
    var pages = d.toc_pages || DEFAULTS.toc_pages;
    var order = normalizeSectionOrder(d.section_order);
    var html = "";
    var j;
    for (j = 0; j < order.length; j++) {
      var sid = order[j];
      var idx = SECTION_ID_TO_TOC_INDEX[sid];
      var a = TOC_ANCHORS[idx];
      var title = titles[idx] != null ? titles[idx] : "";
      var page = pages[idx] != null ? pages[idx] : "";
      html +=
        '<li><a href="#' +
        a.anchor +
        '">' +
        escapeHtml(title) +
        '</a><span class="toc-dots"></span><span class="toc-page">' +
        escapeHtml(page) +
        "</span></li>\n";
    }
    return html;
  }

  function buildTableRows(d) {
    var rows = d.table_rows || DEFAULTS.table_rows;
    return rows
      .map(function (r) {
        return (
          "<tr><td>" +
          escapeHtml(r.model) +
          "</td><td>" +
          escapeHtml(r.arch) +
          "</td><td>" +
          escapeHtml(r.acc) +
          "</td></tr>"
        );
      })
      .join("\n");
  }

  function chapterWrapOpen(d, sectionId, num) {
    var idx = SECTION_ID_TO_TOC_INDEX[sectionId];
    var anchor = TOC_ANCHORS[idx].anchor;
    var defT = DEFAULTS.toc_titles;
    var title =
      d.toc_titles && d.toc_titles[idx] != null && String(d.toc_titles[idx]).trim() !== ""
        ? d.toc_titles[idx]
        : defT[idx] != null
          ? defT[idx]
          : "";
    return (
      '    <div class="chapter-wrap" id="' +
      anchor +
      '">\n' +
      '      <div class="chapter">\n' +
      '        <div class="chapter-label">Section ' +
      num +
      "</div>\n" +
      "        <h2>" +
      escapeHtml(title) +
      "</h2>\n" +
      "      </div>\n" +
      "    </div>\n\n"
    );
  }

  function normalizeFieldOrderSection(d, sectionId) {
    var def = DEFAULT_FIELD_ORDER[sectionId];
    if (!def || !def.length) return [];
    var order = d.field_order && d.field_order[sectionId];
    if (!order || !Array.isArray(order)) return def.slice();
    var valid = {};
    var i;
    for (i = 0; i < def.length; i++) {
      valid[def[i]] = true;
    }
    var seen = {};
    var out = [];
    for (i = 0; i < order.length; i++) {
      var k = order[i];
      if (valid[k] && !seen[k]) {
        seen[k] = true;
        out.push(k);
      }
    }
    for (i = 0; i < def.length; i++) {
      if (!seen[def[i]]) {
        out.push(def[i]);
      }
    }
    return out;
  }

  function tableModelsOnlyHtml(d) {
    return (
      '    <table class="report-table" id="table-models">\n' +
      "      <thead>\n" +
      "        <tr>\n" +
      "          <th>Model</th>\n" +
      "          <th>Architecture</th>\n" +
      "          <th>Test Accuracy</th>\n" +
      "        </tr>\n" +
      "      </thead>\n" +
      "      <tbody>\n" +
      buildTableRows(d) +
      "\n      </tbody>\n" +
      "    </table>\n"
    );
  }

  function calloutBlockHtml(d) {
    return (
      '    <div class="callout" id="recommended-inline">\n' +
      "      <strong>" +
      escapeHtml(d.callout_title) +
      "</strong>\n" +
      (mdFlag(d, "callout_body")
        ? '<div class="callout-body md-content">' + markdownToHtml(d.callout_body) + "</div>\n"
        : '<div class="callout-body">' +
          escapeHtml(d.callout_body).replace(/\n/g, "<br />") +
          "</div>\n") +
      "    </div>\n\n"
    );
  }

  function buildBusinessFragment(d, key) {
    switch (key) {
      case "h3_intro":
        return "    <h3>Introduction</h3>\n";
      case "h3_solution":
        return "    <h3>Solution Trials &amp; Methodology</h3>\n";
      case "intro_p1":
        return paragraphHtml(d, "intro_p1");
      case "intro_p2":
        return paragraphHtml(d, "intro_p2");
      case "meth_p1":
        return paragraphHtml(d, "meth_p1");
      case "meth_p2":
        return paragraphHtml(d, "meth_p2");
      case "table_models":
        return tableModelsOnlyHtml(d);
      case "caption_table1":
        if (mdFlag(d, "caption_table1")) {
          return '    <div class="caption md-content">' + markdownToHtml(d.caption_table1) + "</div>\n\n";
        }
        return '    <p class="caption">' + escapeHtml(d.caption_table1) + "</p>\n\n";
      case "callout_block":
        return calloutBlockHtml(d);
      default:
        return "";
    }
  }

  function buildDataFragment(d, key) {
    switch (key) {
      case "data_intro":
        return paragraphHtml(d, "data_intro");
      case "data_bullets":
        return bulletSectionHtml(d, "data_bullets");
      case "data_closing":
        return paragraphHtml(d, "data_closing");
      default:
        return "";
    }
  }

  function buildAnnPrepFragment(d, key) {
    switch (key) {
      case "ann_h4":
        return "    <h4>" + escapeHtml(d.ann_h4) + "</h4>\n";
      case "ann_prep_bullets":
        return bulletSectionHtml(d, "ann_prep_bullets");
      case "fig1_caption":
        if (!(d.fig1_caption || "").trim()) return "";
        return '    <p class="caption">' + escapeHtml(d.fig1_caption) + "</p>\n";
      case "fig1_figure":
        return "    " + figureHtml(d, "fig1_note", "fig1_src", "Figure 1", "fig1_svg") + "\n\n";
      default:
        return "";
    }
  }

  function ann2Subhead(title) {
    return '    <h3 class="ann2-subhead">' + escapeHtml(title) + "</h3>\n";
  }

  function buildAnnPerfFragment(d, key) {
    switch (key) {
      case "ann_perf_diff":
        return leadParagraphHtml(d, "ann_perf_diff");
      case "ann_arch_caption":
        if (!(d.ann_arch_caption || "").trim()) return "";
        return '    <p class="caption">' + escapeHtml(d.ann_arch_caption) + "</p>\n";
      case "ann_arch_figure":
        return (
          ann2Subhead("Architecture comparison (ANN 1 vs ANN 2)") +
          "    " +
          figureHtml(d, "ann_arch_note", "ann_arch_src", "ANN 1 vs ANN 2 architecture diagram", "ann_arch_svg") +
          "\n\n"
        );
      case "ann1_fig_acc_figure":
        return (
          ann2Subhead("Training vs. validation accuracy (ANN 1)") +
          "    " +
          figureHtml(d, "ann1_fig_acc_note", "ann1_fig_acc_src", "ANN 1 training vs. validation accuracy", "ann1_fig_acc_svg") +
          "\n\n"
        );
      case "ann1_fig_acc_caption":
        if (!(d.ann1_fig_acc_caption || "").trim()) return "";
        return '    <p class="caption">' + escapeHtml(d.ann1_fig_acc_caption) + "</p>\n";
      case "ann1_obs":
        return ann2Subhead("Observations (ANN 1)") + leadParagraphHtml(d, "ann1_obs");
      case "ann_fig_acc_caption":
        if (!(d.ann_fig_acc_caption || "").trim()) return "";
        return '    <p class="caption">' + escapeHtml(d.ann_fig_acc_caption) + "</p>\n";
      case "ann_fig_acc_figure":
        return (
          ann2Subhead("Training vs. validation accuracy (ANN 2)") +
          "    " +
          figureHtml(d, "ann_fig_acc_note", "ann_fig_acc_src", "ANN 2 training vs. validation accuracy", "ann_fig_acc_svg") +
          "\n\n"
        );
      case "ann_precision_note":
        return ann2Subhead("Classification report / precision & F1 (ANN 2)") + paragraphHtml(d, "ann_precision_note");
      case "ann_cm_figure":
        return (
          ann2Subhead("Confusion matrix (ANN 2)") +
          "    " +
          figureHtml(d, "ann_cm_note", "ann_cm_src", "ANN 2 confusion matrix", "ann_cm_svg") +
          "\n\n"
        );
      case "ann_observations":
        return ann2Subhead("Observations (ANN 2)") + leadParagraphHtml(d, "ann_observations");
      default:
        return "";
    }
  }

  function buildCnnPrepFragment(d, key) {
    switch (key) {
      case "cnn_h4":
        return "    <h4>" + escapeHtml(d.cnn_h4) + "</h4>\n";
      case "cnn_prep_bullets":
        return bulletSectionHtml(d, "cnn_prep_bullets");
      default:
        return "";
    }
  }

  function buildCnnPerfFragment(d, key) {
    switch (key) {
      case "cnn_diff":
        return leadParagraphHtml(d, "cnn_diff");
      case "cnn_arch_caption":
        if (!(d.cnn_arch_caption || "").trim()) return "";
        return '    <p class="caption">' + escapeHtml(d.cnn_arch_caption) + "</p>\n";
      case "cnn_arch_figure":
        return (
          ann2Subhead("Architecture comparison (CNN 1 vs CNN 2)") +
          "    " +
          figureHtml(d, "cnn_arch_note", "cnn_arch_src", "CNN 1 vs CNN 2 architecture diagram", "cnn_arch_svg") +
          "\n\n"
        );
      case "cnn_fig1_caption":
        if (!(d.cnn_fig1_caption || "").trim()) return "";
        return '    <p class="caption">' + escapeHtml(d.cnn_fig1_caption) + "</p>\n";
      case "cnn_fig1_figure":
        return (
          ann2Subhead("Training vs. validation accuracy (CNN 1)") +
          "    " +
          figureHtml(d, "cnn_fig1_note", "cnn_fig1_src", "CNN 1 training vs. validation accuracy", "cnn_fig1_svg") +
          "\n\n"
        );
      case "cnn_fig2_caption":
        if (!(d.cnn_fig2_caption || "").trim()) return "";
        return '    <p class="caption">' + escapeHtml(d.cnn_fig2_caption) + "</p>\n";
      case "cnn_fig2_figure":
        return (
          ann2Subhead("Training vs. validation accuracy (CNN 2)") +
          "    " +
          figureHtml(d, "cnn_fig2_note", "cnn_fig2_src", "CNN 2 training vs. validation accuracy", "cnn_fig2_svg") +
          "\n\n"
        );
      case "cnn_precision_note":
        return ann2Subhead("Classification report / precision & F1 (CNN 1)") + paragraphHtml(d, "cnn_precision_note");
      case "cnn_cm_figure":
        return (
          ann2Subhead("Confusion matrix (CNN 1)") +
          "    " +
          figureHtml(d, "cnn_cm_note", "cnn_cm_src", "CNN confusion matrix", "cnn_cm_svg") +
          "\n\n"
        );
      case "cnn_overall":
        return ann2Subhead("Overall observations (CNN)") + leadParagraphHtml(d, "cnn_overall");
      default:
        return "";
    }
  }

  function buildAppendixFragment(d, key) {
    switch (key) {
      case "appendix_p1":
        return appendixParagraphHtml(d, "appendix_p1");
      case "appendix_p2":
        return appendixParagraphHtml(d, "appendix_p2");
      default:
        return "";
    }
  }

  function sectionBusiness(d, num) {
    var order = normalizeFieldOrderSection(d, "business");
    var i;
    var body = "";
    for (i = 0; i < order.length; i++) {
      body += buildBusinessFragment(d, order[i]);
    }
    return chapterWrapOpen(d, "business", num) + body;
  }

  function sectionData(d, num) {
    var order = normalizeFieldOrderSection(d, "data");
    var i;
    var body = "";
    for (i = 0; i < order.length; i++) {
      body += buildDataFragment(d, order[i]);
    }
    return chapterWrapOpen(d, "data", num) + body;
  }

  function sectionAnnPrep(d, num) {
    var order = normalizeFieldOrderSection(d, "ann_prep");
    var i;
    var body = "";
    for (i = 0; i < order.length; i++) {
      body += buildAnnPrepFragment(d, order[i]);
    }
    return chapterWrapOpen(d, "ann_prep", num) + body;
  }

  function sectionAnnPerf(d, num) {
    var order = normalizeFieldOrderSection(d, "ann_perf");
    var i;
    var body = "";
    for (i = 0; i < order.length; i++) {
      body += buildAnnPerfFragment(d, order[i]);
    }
    return chapterWrapOpen(d, "ann_perf", num) + body;
  }

  function sectionCnnPrep(d, num) {
    var order = normalizeFieldOrderSection(d, "cnn_prep");
    var i;
    var body = "";
    for (i = 0; i < order.length; i++) {
      body += buildCnnPrepFragment(d, order[i]);
    }
    return chapterWrapOpen(d, "cnn_prep", num) + body;
  }

  function sectionCnnPerf(d, num) {
    var order = normalizeFieldOrderSection(d, "cnn_perf");
    var i;
    var body = "";
    for (i = 0; i < order.length; i++) {
      body += buildCnnPerfFragment(d, order[i]);
    }
    return chapterWrapOpen(d, "cnn_perf", num) + body;
  }

  function buildFinalFragment(d, key) {
    return key === "final_p" ? paragraphHtml(d, "final_p") : "";
  }

  function buildConclusionFragment(d, key) {
    return key === "conclusion_p" ? paragraphHtml(d, "conclusion_p") : "";
  }

  function sectionFinal(d, num) {
    var order = normalizeFieldOrderSection(d, "final");
    var i;
    var body = "";
    for (i = 0; i < order.length; i++) {
      body += buildFinalFragment(d, order[i]);
    }
    return chapterWrapOpen(d, "final", num) + body;
  }

  function sectionConclusion(d, num) {
    var order = normalizeFieldOrderSection(d, "conclusion");
    var i;
    var body = "";
    for (i = 0; i < order.length; i++) {
      body += buildConclusionFragment(d, order[i]);
    }
    return chapterWrapOpen(d, "conclusion", num) + body;
  }

  function sectionAppendix(d, num) {
    var order = normalizeFieldOrderSection(d, "appendix");
    var i;
    var body = "";
    for (i = 0; i < order.length; i++) {
      body += buildAppendixFragment(d, order[i]);
    }
    return chapterWrapOpen(d, "appendix", num) + body;
  }

  function normalizeFieldOrderMerge(m) {
    var sid;
    for (sid in DEFAULT_FIELD_ORDER) {
      if (Object.prototype.hasOwnProperty.call(DEFAULT_FIELD_ORDER, sid)) {
        m.field_order[sid] = normalizeFieldOrderSection(m, sid);
      }
    }
  }

  /** Keep toc_titles / toc_pages aligned with the 9 TOC anchors (index = section slot, not display order). */
  function normalizeTocArrays(m) {
    var defT = DEFAULTS.toc_titles;
    var defP = DEFAULTS.toc_pages;
    var t = m.toc_titles;
    var p = m.toc_pages;
    var outT = [];
    var outP = [];
    var i;
    for (i = 0; i < TOC_ANCHORS.length; i++) {
      outT[i] =
        t && t[i] != null && String(t[i]).trim() !== "" ? String(t[i]) : defT[i] != null ? defT[i] : "";
      outP[i] =
        p && p[i] != null && String(p[i]).trim() !== "" ? String(p[i]) : defP[i] != null ? defP[i] : "";
    }
    m.toc_titles = outT;
    m.toc_pages = outP;
  }

  function normalizeAnnObservations(m) {
    if ((m.ann_observations || "").trim()) return;
    var parts = [];
    if ((m.ann_findings || "").trim()) parts.push(String(m.ann_findings).trim());
    if ((m.ann_overall || "").trim()) parts.push(String(m.ann_overall).trim());
    if (parts.length) m.ann_observations = parts.join("\n\n");
  }

  function mergeData(data) {
    var m = assign({}, DEFAULTS, data || {});
    normalizeAnnObservations(m);
    m.section_order = normalizeSectionOrder(m.section_order);
    normalizeTocArrays(m);
    if (!m.field_order || typeof m.field_order !== "object") {
      m.field_order = {};
    }
    normalizeFieldOrderMerge(m);
    if (!m.table_rows || !Array.isArray(m.table_rows) || m.table_rows.length === 0) {
      m.table_rows = DEFAULTS.table_rows.map(function (row) {
        return { model: row.model, arch: row.arch, acc: row.acc };
      });
    } else {
      m.table_rows = m.table_rows.map(function (r) {
        return {
          model: String(r && r.model != null ? r.model : ""),
          arch: String(r && r.arch != null ? r.arch : ""),
          acc: String(r && r.acc != null ? r.acc : "")
        };
      });
    }
    var mk;
    for (mk in m) {
      if (Object.prototype.hasOwnProperty.call(m, mk) && /^md_/.test(mk)) {
        m[mk] = !!m[mk];
      }
    }
    return m;
  }

  function resolveDateString(d) {
    if (d.date_mode === "fixed" && (d.report_date_fixed || "").trim()) {
      return d.report_date_fixed.trim();
    }
    return new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
  }

  function renderCoverInner(d, dateStr) {
    return (
      '<header class="cover">\n' +
      '      <div class="cover-shapes" aria-hidden="true"></div>\n' +
      '      <div class="cover-inner">\n' +
      '        <div class="cover-brand">\n' +
      '          <a class="brand-logo-link" href="#toc" title="Great Learning">\n' +
      '            <img class="brand-logo-img" src="assets/greatlearning-brand.svg" alt="Great Learning" />\n' +
      "          </a>\n" +
      "        </div>\n" +
      '        <div class="cover-title-block">\n' +
      "          <h1>" +
      escapeHtml(d.cover_title) +
      "</h1>\n" +
      '          <p class="subtitle">' +
      escapeHtml(d.cover_subtitle) +
      "</p>\n" +
      '          <p class="cover-client">' +
      escapeHtml(d.cover_client) +
      "</p>\n" +
      "        </div>\n" +
      '        <footer class="cover-footer">\n' +
      escapeHtml(d.cover_footer_prefix || "Phase evaluation report") +
      ' · <span id="report-date">' +
      escapeHtml(dateStr) +
      "</span>\n" +
      "        </footer>\n" +
      "      </div>\n" +
      "    </header>"
    );
  }

  function renderMainInner(d) {
    var order = normalizeSectionOrder(d.section_order);
    var renderers = {
      business: sectionBusiness,
      data: sectionData,
      ann_prep: sectionAnnPrep,
      ann_perf: sectionAnnPerf,
      cnn_prep: sectionCnnPrep,
      cnn_perf: sectionCnnPerf,
      final: sectionFinal,
      conclusion: sectionConclusion,
      appendix: sectionAppendix
    };
    var body = "";
    var i;
    for (i = 0; i < order.length; i++) {
      var sid = order[i];
      var fn = renderers[sid];
      if (fn) {
        body += fn(d, i + 1);
      }
    }
    return (
      '    <div class="report-brand">\n' +
      '      <img class="report-brand-logo" src="assets/greatlearning-brand.svg" alt="Great Learning" />\n' +
      '      <div class="report-brand-meta">\n' +
      "        <strong>" +
      escapeHtml(d.brand_strong) +
      "</strong>\n" +
      "        <span>" +
      escapeHtml(d.brand_span) +
      "</span>\n" +
      "      </div>\n" +
      "    </div>\n\n" +
      '    <nav class="toc-block" id="toc">\n' +
      "      <h2>Table of Contents</h2>\n" +
      '      <ul class="toc-list">\n' +
      buildTocHtml(d) +
      "      </ul>\n" +
      "    </nav>\n\n" +
      body
    );
  }

  /** Refresh #report-date when date_mode is "today" (optional call after load). */
  function refreshLiveDate(d) {
    if (d.date_mode !== "fixed" || !(d.report_date_fixed || "").trim()) {
      var el = document.getElementById("report-date");
      if (el) {
        el.textContent = new Date().toLocaleDateString("en-US", {
          year: "numeric",
          month: "long",
          day: "numeric"
        });
      }
    }
  }

  global.ReportRenderer = {
    DEFAULTS: DEFAULTS,
    TOC_ANCHORS: TOC_ANCHORS,
    SECTION_ID_TO_TOC_INDEX: SECTION_ID_TO_TOC_INDEX,
    DEFAULT_SECTION_ORDER: DEFAULT_SECTION_ORDER,
    DEFAULT_FIELD_ORDER: DEFAULT_FIELD_ORDER,
    SECTION_FORM_LABELS: SECTION_FORM_LABELS,
    normalizeSectionOrder: normalizeSectionOrder,
    normalizeFieldOrderSection: normalizeFieldOrderSection,
    markdownToHtml: markdownToHtml,
    mdFlag: mdFlag,
    mergeData: mergeData,
    resolveDateString: resolveDateString,
    renderCoverInner: renderCoverInner,
    renderMainInner: renderMainInner,
    refreshLiveDate: refreshLiveDate
  };
})(typeof window !== "undefined" ? window : this);
