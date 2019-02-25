
var penColor = 'black';
var penTitle = "x";

function setPenColor(pen){
  penColor = pen;
}
function setPenTitle(pen){
  penTitle = pen;
}

function setPixelColor(pixel){
  pixel.style.backgroundColor = penColor;
  pixel.title = penTitle;
}

function copyToClipboard(element) {
  var $temp = $("<input>");
  $("body").append($temp);
  $temp.val($(element).text()).select();
  document.execCommand("copy");
  $temp.remove();
}
