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

  var form = document.getElementById("contact-form");
  if (!form) return;

  form.addEventListener("submit", function (event) {
    event.preventDefault();
    var data = new FormData(form);
    var name = String(data.get("name") || "").trim();
    var organization = String(data.get("organization") || "").trim();
    var email = String(data.get("email") || "").trim();
    var interest = String(data.get("interest") || "").trim();
    var message = String(data.get("message") || "").trim();
    var subject = "LeoLink Services inquiry from " + name;
    if (interest) subject += " — " + interest;
    var body = [
      "Name: " + name,
      "Organization: " + (organization || "(not provided)"),
      "Email: " + email,
      "Interest: " + (interest || "(not provided)"),
      "",
      message
    ].join("\n");
    var url = "mailto:info@leolinkservices.com?subject=" +
      encodeURIComponent(subject) + "&body=" + encodeURIComponent(body);
    form.setAttribute("action", url);
    var status = document.getElementById("mail-status");
    if (status) status.hidden = false;
    window.location.href = url;
  });
})();
