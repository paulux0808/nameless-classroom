/* Document presentation only. Chapter evidence and verdicts stay in the engine. */
(function (root) {
  "use strict";

  function node(tag, className, text) {
    var n = document.createElement(tag);
    if (className) n.className = className;
    if (text != null) n.textContent = text;
    return n;
  }
  function button(className, text, action) {
    var b = node("button", className, text);
    b.type = "button";
    b.onclick = action;
    return b;
  }

  function create(options) {
    var host = options.host;
    var reports = null, pages = [], statements = [], tabs = [];
    var active = 0, large = false;
    var narrow = matchMedia("(max-width: 639px)");
    var single = innerWidth < 1000;
    var view = node("section", "reader");
    var toolbar = node("div", "reader-toolbar");
    var identity = node("div", "reader-identity");
    identity.appendChild(node("span", "reader-kicker", options.subtitle));
    var title = node("h2", "reader-title", options.title);
    title.id = "reader-title";
    identity.appendChild(title);
    toolbar.appendChild(identity);
    var actions = node("div", "reader-actions");
    var mode = button("reader-tool reader-mode", "", function () {
      single = !single; layout();
    });
    var size = button("reader-tool reader-size", "가+", function () {
      large = !large;
      view.classList.toggle("large-type", large);
      size.setAttribute("aria-pressed", String(large));
      size.setAttribute("aria-label", large ? "기본 글자 크기" : "글자 크게");
      size.textContent = large ? "가−" : "가+";
      measure();
    });
    size.setAttribute("aria-label", "글자 크게");
    size.setAttribute("aria-pressed", "false");
    var close = button("reader-tool reader-close", "닫기 ×", options.onClose);
    close.setAttribute("aria-label", "보고서 닫기");
    actions.appendChild(mode); actions.appendChild(size); actions.appendChild(close);
    toolbar.appendChild(actions);
    view.appendChild(toolbar);
    var papers = node("div", "letters");
    view.appendChild(papers);
    var nav = node("nav", "reader-pages");
    nav.setAttribute("aria-label", "보고서 선택");
    view.appendChild(nav);
    host.appendChild(view);

    function measure() {
      pages.forEach(function (page) {
        var body = page.querySelector(".letter-body");
        page.classList.toggle("more-below", !page.hidden && body.scrollHeight - body.clientHeight - body.scrollTop > 3);
      });
    }
    function layout() {
      var focused = single || narrow.matches;
      view.classList.toggle("single-page", focused);
      mode.textContent = focused ? "세 장 나란히" : "한 장씩 보기";
      mode.setAttribute("aria-label", focused ? "보고서 세 장 나란히 보기" : "보고서 한 장씩 보기");
      mode.hidden = narrow.matches;
      nav.hidden = !focused;
      pages.forEach(function (page, i) {
        page.hidden = focused && active !== i;
        tabs[i].setAttribute("aria-current", active === i ? "page" : "false");
        page.querySelector(".letter-expand").hidden = focused;
      });
      measure();
    }
    function focusPage(index) {
      active = index; single = true; layout();
      var body = pages[index].querySelector(".letter-body");
      body.focus({ preventScroll: true });
    }
    function build(nextReports) {
      reports = nextReports;
      pages = []; statements = []; tabs = [];
      papers.replaceChildren(); nav.replaceChildren();
      active = Math.min(active, reports.length - 1);
      reports.forEach(function (report, index) {
        var page = node("article", "letter");
        page.dataset.report = report.id;
        var head = node("header", "letter-head");
        var top = node("div", "letter-topline");
        top.appendChild(node("span", "letter-no", report.no));
        var expand = button("letter-expand", "확대 ↗", function () { focusPage(index); });
        expand.setAttribute("aria-label", report.no + " 보고서 확대");
        top.appendChild(expand); head.appendChild(top);
        var heading = node("h3", "", options.safeText(report.title));
        heading.id = "report-title-" + index;
        head.appendChild(heading);
        head.appendChild(node("p", "letter-meta", options.safeText(report.head)));
        page.appendChild(head);
        var body = node("div", "letter-body");
        body.tabIndex = 0;
        body.setAttribute("role", "region");
        body.setAttribute("aria-labelledby", heading.id);
        report.body.forEach(function (paragraph) {
          var p = node("p", "prose");
          paragraph.forEach(function (chunk) {
            if (typeof chunk === "string") {
              p.appendChild(document.createTextNode(options.safeText(chunk) + " "));
              return;
            }
            var span = node("span", "stmt", options.safeText(chunk.t));
            span.dataset.st = chunk.id;
            // Never replace these nodes on selection: scroll, focus and touch stay put.
            span.onclick = function () {
              if (span.classList.contains("pickable")) options.onSelect(chunk.id);
            };
            span.onkeydown = function (event) {
              if ((event.key === "Enter" || event.key === " ") && span.classList.contains("pickable")) {
                event.preventDefault(); options.onSelect(chunk.id);
              }
            };
            statements.push({ node: span, statement: chunk, page: index });
            p.appendChild(span); p.appendChild(document.createTextNode(" "));
          });
          body.appendChild(p);
        });
        body.addEventListener("scroll", measure, { passive: true });
        page.appendChild(body);
        papers.appendChild(page); pages.push(page);
        var tab = button("reader-page", report.no, function () { active = index; layout(); });
        tab.setAttribute("aria-label", report.no + " 보고서 보기");
        nav.appendChild(tab); tabs.push(tab);
      });
      layout();
    }
    function render(nextReports, state) {
      if (reports !== nextReports) build(nextReports);
      var selectedPages = [];
      statements.forEach(function (item) {
        var mark = state.mark(item.statement);
        var selected = state.selection.indexOf(item.statement.id) !== -1;
        var pickable = state.canPick && !mark;
        item.node.className = "stmt" + (mark ? " " + mark : "") + (selected ? " sel" : "") + (pickable ? " pickable" : "");
        if (pickable) {
          item.node.setAttribute("role", "button");
          item.node.setAttribute("aria-pressed", String(selected));
          item.node.tabIndex = 0;
        } else {
          item.node.removeAttribute("role");
          item.node.removeAttribute("aria-pressed");
          item.node.removeAttribute("tabindex");
        }
        if (selected) selectedPages.push(item.page);
      });
      tabs.forEach(function (tab, i) {
        tab.classList.toggle("has-selection", selectedPages.indexOf(i) !== -1);
        tab.setAttribute("aria-label", reports[i].no + " 보고서 보기" + (selectedPages.indexOf(i) !== -1 ? ", 문장 선택됨" : ""));
      });
      measure();
    }
    var observer = typeof ResizeObserver !== "undefined" ? new ResizeObserver(measure) : null;
    if (observer) observer.observe(papers);
    addEventListener("resize", layout);
    return {
      render: render,
      focus: function () { close.focus({ preventScroll: true }); measure(); },
      destroy: function () {
        removeEventListener("resize", layout);
        if (observer) observer.disconnect();
        view.remove();
      }
    };
  }
  root.N2Reader = { create: create };
})(typeof globalThis !== "undefined" ? globalThis : window);
