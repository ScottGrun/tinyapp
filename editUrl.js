const editURL =(url)=>{
 
  const shortURL = url.getAttribute("data-shorturl");
  const longURL = url.getAttribute("data-longurl");

  document.getElementById('modalForm').action = `/editurl/${shortURL}`
  document.getElementById('shortURL').innerHTML =  shortURL;

}