(function () {
  var toggle = document.querySelector(".nav-toggle");
  var nav = document.querySelector("#site-nav");
  if (toggle && nav) {
    toggle.addEventListener("click", function () {
      var open = nav.classList.toggle("is-open");
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
    });
    nav.querySelectorAll("a").forEach(function (link) {
      link.addEventListener("click", function () {
        nav.classList.remove("is-open");
        toggle.setAttribute("aria-expanded", "false");
      });
    });
  }

  var dialog = document.getElementById("product-dialog");
  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  if (dialog) {
    var body = dialog.querySelector(".product-dialog-body");
    var ids = Array.prototype.map.call(
      document.querySelectorAll(".product-details .detail"),
      function (article) { return article.id; }
    );
    var currentId = "";
    var lastFocus = null;
    var closing = false;

    function isProduct(id) {
      return ids.indexOf(id) !== -1;
    }

    function productIdFromLink(link) {
      if (!link) return "";
      var href = link.getAttribute("href") || "";
      var hash = href.split("#")[1] || "";
      return isProduct(hash) ? hash : "";
    }

    function fill(id) {
      var article = document.getElementById(id);
      var cardLink = document.querySelector('.product-card a[href="#' + id + '"]');
      var card = cardLink ? cardLink.closest(".product-card") : null;
      var previewSource = (card && card.querySelector(".appwin")) || article.querySelector(".appwin");
      var name = article.querySelector("h2").textContent.trim();
      var value = article.querySelector(".value");
      var tag = article.querySelector(".tag");
      var features = article.querySelectorAll(".ticks li");
      var who = article.querySelector(".who");
      var works = article.querySelector(".works");
      var demo = article.querySelector('a[href*="leolink-learning-hub-demo"]');

      body.replaceChildren();

      if (previewSource) {
        var clone = previewSource.cloneNode(true);
        clone.classList.add("appwin-lg");
        clone.classList.remove("appwin-inline");
        body.appendChild(clone);
      }

      var title = document.createElement("h2");
      title.id = "product-dialog-title";
      title.tabIndex = -1;
      title.textContent = name;
      body.appendChild(title);

      if (value) {
        var valueEl = document.createElement("p");
        valueEl.className = "value";
        valueEl.textContent = value.textContent.trim();
        body.appendChild(valueEl);
      }

      if (tag) {
        var badge = document.createElement("p");
        var badgeSpan = document.createElement("span");
        badgeSpan.className = tag.className;
        badgeSpan.textContent = tag.textContent.trim();
        badge.appendChild(badgeSpan);
        body.appendChild(badge);
      }

      var featureBlock = document.createElement("section");
      featureBlock.className = "dialog-block";
      var featureHeading = document.createElement("h3");
      featureHeading.textContent = "Key features";
      featureBlock.appendChild(featureHeading);
      var list = document.createElement("ul");
      list.className = "ticks";
      Array.prototype.forEach.call(features, function (item, index) {
        if (index >= 6) return;
        var li = document.createElement("li");
        li.textContent = item.textContent.trim();
        list.appendChild(li);
      });
      featureBlock.appendChild(list);
      body.appendChild(featureBlock);

      if (who && who.textContent.trim()) {
        var whoBlock = document.createElement("section");
        whoBlock.className = "dialog-block";
        var whoHeading = document.createElement("h3");
        whoHeading.textContent = "Who it helps";
        var whoText = document.createElement("p");
        whoText.textContent = who.textContent.trim();
        whoBlock.appendChild(whoHeading);
        whoBlock.appendChild(whoText);
        body.appendChild(whoBlock);
      }

      if (works && works.textContent.trim()) {
        var worksBlock = document.createElement("section");
        worksBlock.className = "dialog-block";
        var worksHeading = document.createElement("h3");
        worksHeading.textContent = "Works with";
        var worksText = document.createElement("p");
        worksText.textContent = works.textContent.trim();
        worksBlock.appendChild(worksHeading);
        worksBlock.appendChild(worksText);
        body.appendChild(worksBlock);
      }

      var actions = document.createElement("div");
      actions.className = "dialog-actions";
      var request = document.createElement("a");
      request.className = "btn btn-primary";
      request.href = "contact.html?product=" + encodeURIComponent(name);
      request.textContent = "Request a demo";
      actions.appendChild(request);
      if (demo) {
        var live = document.createElement("a");
        live.className = "btn btn-line";
        live.href = demo.href;
        live.target = "_blank";
        live.rel = "noopener noreferrer";
        live.textContent = "Open live demo";
        actions.appendChild(live);
      }
      body.appendChild(actions);
      body.scrollTop = 0;
    }

    function focusTitle() {
      var title = document.getElementById("product-dialog-title");
      if (title) title.focus();
    }

    function openProduct(id, opener, fromHistory) {
      if (!isProduct(id)) return;
      currentId = id;
      if (opener) lastFocus = opener;
      fill(id);
      if (!dialog.open) {
        dialog.showModal();
        document.body.style.overflow = "hidden";
      }
      window.requestAnimationFrame(focusTitle);
      if (!fromHistory && location.hash.slice(1) !== id) {
        history.pushState({ product: id }, "", "#" + id);
      }
    }

    function finishClose() {
      dialog.classList.remove("is-closing");
      closing = false;
      if (dialog.open) dialog.close();
      document.body.style.overflow = "";
      if (lastFocus && typeof lastFocus.focus === "function") lastFocus.focus();
    }

    function requestClose(fromHistory) {
      if (!dialog.open || closing) return;
      function done() {
        finishClose();
        if (!fromHistory && location.hash) {
          history.pushState(null, "", location.pathname + location.search);
        }
      }
      if (reduceMotion) {
        done();
        return;
      }
      closing = true;
      dialog.classList.add("is-closing");
      var settled = false;
      function settle(event) {
        if (event && event.target !== dialog) return;
        if (settled) return;
        settled = true;
        dialog.removeEventListener("transitionend", settle);
        done();
      }
      dialog.addEventListener("transitionend", settle);
      window.setTimeout(settle, 360);
    }

    function move(direction) {
      var index = ids.indexOf(currentId);
      if (index < 0) index = 0;
      var next = ids[(index + direction + ids.length) % ids.length];
      currentId = next;
      fill(next);
      history.replaceState({ product: next }, "", "#" + next);
      var cardLink = document.querySelector('.product-card a[href="#' + next + '"]');
      if (cardLink) lastFocus = cardLink;
      focusTitle();
    }

    document.querySelectorAll(".product-card").forEach(function (card) {
      card.addEventListener("click", function (event) {
        if (event.target.closest("a[href^='http']")) return;
        var link = card.querySelector("a[href^='#']");
        var id = productIdFromLink(link);
        if (!id) return;
        event.preventDefault();
        openProduct(id, link, false);
      });
    });

    dialog.querySelectorAll(".dialog-nav").forEach(function (button) {
      button.addEventListener("click", function () {
        move(Number(button.getAttribute("data-dir")));
      });
    });

    dialog.querySelector(".dialog-close").addEventListener("click", function () {
      requestClose(false);
    });

    dialog.addEventListener("cancel", function (event) {
      event.preventDefault();
      requestClose(false);
    });

    dialog.addEventListener("click", function (event) {
      if (event.target === dialog) requestClose(false);
    });

    document.addEventListener("keydown", function (event) {
      if (!dialog.open || closing) return;
      if (event.key === "ArrowRight") {
        event.preventDefault();
        move(1);
      } else if (event.key === "ArrowLeft") {
        event.preventDefault();
        move(-1);
      }
    });

    window.addEventListener("popstate", function () {
      var id = location.hash.slice(1);
      if (isProduct(id)) openProduct(id, lastFocus, true);
      else if (dialog.open) requestClose(true);
    });

    var initial = location.hash.slice(1);
    if (isProduct(initial)) {
      var initialLink = document.querySelector('.product-card a[href="#' + initial + '"]');
      openProduct(initial, initialLink, true);
    }
  } else {
    document.querySelectorAll(".product-card").forEach(function (card) {
      card.addEventListener("click", function (event) {
        if (event.target.closest("a[href^='http']")) return;
        var link = card.querySelector("a[href*='#']");
        if (!link || event.target.closest("a") === link) return;
        window.location.href = link.href;
      });
    });
  }

  var form = document.getElementById("contact-form");
  if (!form) return;

  var requested = "";
  try {
    requested = new URLSearchParams(window.location.search).get("product") || "";
  } catch (error) {
    requested = "";
  }
  if (requested) {
    form.dataset.product = requested;
    var interest = form.querySelector("#interest");
    if (interest) {
      Array.prototype.forEach.call(interest.options, function (option) {
        if (option.textContent.trim() === requested) interest.value = option.value || option.textContent;
      });
      if (interest.value === "" || interest.selectedIndex === 0) {
        Array.prototype.forEach.call(interest.options, function (option, index) {
          if (option.textContent.trim() === requested) interest.selectedIndex = index;
        });
      }
    }
    var note = document.getElementById("product-request");
    if (note) {
      note.hidden = false;
      note.textContent = "This request is about " + requested + ". The email subject will include that product.";
    }
  }

  form.addEventListener("submit", function (event) {
    event.preventDefault();
    var data = new FormData(form);
    var name = String(data.get("name") || "").trim();
    var organization = String(data.get("organization") || "").trim();
    var email = String(data.get("email") || "").trim();
    var interestValue = String(data.get("interest") || "").trim();
    var message = String(data.get("message") || "").trim();
    var product = form.dataset.product || "";
    var subject = product
      ? "LeoLink Services demo request: " + product + (name ? " from " + name : "")
      : "LeoLink Services inquiry from " + name;
    if (!product && interestValue) subject += " — " + interestValue;
    var bodyLines = [
      "Name: " + name,
      "Organization: " + (organization || "(not provided)"),
      "Email: " + email,
      "Interest: " + (interestValue || product || "(not provided)")
    ];
    if (product) bodyLines.push("Product: " + product);
    bodyLines.push("");
    bodyLines.push(message);
    var url = "mailto:info@leolinkservices.com?subject=" +
      encodeURIComponent(subject) + "&body=" + encodeURIComponent(bodyLines.join("\n"));
    form.setAttribute("action", url);
    var status = document.getElementById("mail-status");
    if (status) status.hidden = false;
    window.location.href = url;
  });
})();
