window.addEventListener("DOMContentLoaded" , function(){
  function move(evt){
    
     const e = document.elementFromPoint(evt.clientX , evt.clientY);
     if(!e.dataset.hint){t.style.display="none" ; return};
     t.innerHTML = e.dataset.hint;
     t.style.display = "block";
     console.log(e.dataset.hint);
     tbb = t.getBoundingClientRect();

     let lf = evt.clientX - (tbb.width/2);
     let tp = evt.clientY - (tbb.height + 8)

     t.style.top = tp + "px";
     t.style.left = lf + "px";




  }

  //we are here?
  let t = document.querySelector("#tooltip");
  if(!t){
    t = document.createElement("div");
    t.id="tooltip";
    
  }
  t.style.position = "fixed";
  t.style.zIndex = 10000;
  t.style.display =  "none";
  t.style.pointerEvents = "none";
  document.body.appendChild(t);
  window.addEventListener("mousemove", move);

})
