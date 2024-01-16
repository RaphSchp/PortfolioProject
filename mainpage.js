const URL = "mydata.json";

document.addEventListener("DOMContentLoaded", () => {
  let options = {
    root: null,
    rootMargin: "0px",
    threshold: 0.5
  };
  const observer = new IntersectionObserver(handleIntersect, options);
  observer.observe(document.querySelector("footer"));
  getData();
});

function handleIntersect(entries) {
  if (entries[0].isIntersecting) {
    console.warn("something is intersecting with the viewport");
    getData();
  }
}

function getData() {
  fetch(URL)
    .then(response => response.json())
    .then(mydata => {
      let main = document.querySelector("main");
      console.log("using local JSON data", mydata);

      mydata.items.forEach(item => {
        let figure = document.createElement("figure");
        let img = document.createElement("img");
        let doc = document.createElement("p");
        let figcaption = document.createElement("figcaption");
    
        img.src = item.img;
        img.alt = item.name;
        doc.textContent = item.doc;
        doc.classList.add("doc");
        figcaption.textContent = item.name;
    
        figure.appendChild(img);
        figure.appendChild(doc);
        figure.appendChild(figcaption);
        main.appendChild(figure);
    });
    })
    .catch(error => console.error("Error fetching data:", error));
}

