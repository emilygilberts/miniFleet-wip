self.addEventListener("install", function (event) {
  console.log("SW: install event");
});

self.addEventListener("fetch", function (event) {
  console.log("SW: fetch event");
});

self.addEventListener("activate", (event) => {
  console.log("SW: activate event");
});
