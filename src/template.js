import { saveCardsToHTML } from "./serialization";
export const createHTML = function(
cards,
settings
){
  const cs = document.querySelector("#cardisterCustomCSS");
  const customCSS = cs ? cs.innerHTML : "";
  const cocs = document.querySelector("#cardisterCoreCSS");
  const coreCSS = cocs ? cocs.innerHTML : "/*Broklen file*/";
  const jsc = document.querySelector("#cardisterCore");
  const coreJS = jsc ? jsc.innerHTML : "alert('Core script is missing!')"
  

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>${settings.title}</title>
  <meta name="og:title" content="${settings.title}">
  <meta name="og:description" content="${settings.description}">
  <meta name="og:image" content="${settings.image}">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <base target="_blank">
  <!--prevent FOUC -->
  <style>
    html{
       visibility: hidden;
       opacity:0;
    }
  </style>
  <style id="cardisterCoreCSS">
  ${coreCSS}
  </style>
  <style id="cardisterCustomCSS">
  ${customCSS}
  </style>
  <!--prevent FOUC - II -->
  <style>
    html{
      visibility: visible;
      opacity: 1;
    }
  </style>
  <!--hide loader if JS is not enabled-->
  <noscript>
    <style>
      #loader{
        display: none;
      }
    </style>
  </noscript>
  
</head>
<body>
<div id="loader"></div>
<span id="cardisterContainer">
  ${saveCardsToHTML(cards)}
  <script type="data/json" id="settings">
  ${JSON.stringify( settings , null , 2)}
  </script>
  <script id="cardisterCore">
  ${coreJS}
  </script>
</span>
</body>
</html>`

}
