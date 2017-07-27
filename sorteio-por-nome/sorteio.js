
REGEX_NEWLINE = /\r?\n/
REGEX_WHITESPACE = /\s+/

function loadNames(text, size) {
  window.nomes = text.trim().split(REGEX_NEWLINE);
}

function readFileAndLoad(file, loader) {
    if (!window.FileReader) {
        reportError('your browser does not have the necessary file reader API.');
        return;
    }
    
    var reader = new FileReader();

    reader.onload = function(e) {
        //document.getElementById('debug').innerHTML = e.target.result;
        console.log(e.target.result);
        loader(e.target.result)
    }

    reader.onerror = function(e) {
        console.log(e.target);
    }

    reader.readAsText(file);
}

function handleSelectFile(e){
  console.log(e.target.tagName)
  console.log(e.target.type)
  console.log(e.target.files);
  if(e.target.tagName.toLowerCase() == 'input' && e.target.type == 'file'){
    file = e.target.files[0];
    if(file == null){
        return false;
    }
    readFileAndLoad(file, loadNames);
    e.target.style.display = 'none';
  }
  return false;
}

function handleDropNames(e) {
    // this / e.target is current target element.
    e.stopPropagation(); // stops the browser from redirecting.
    e.preventDefault();
    var cols = document.querySelectorAll('.drop_zone');
    [].forEach.call(cols, function (col) {
        col.classList.remove('over');
    });
    
    // See the section on the DataTransfer object.
    file = getFile(e)
    if(file == null){
        return false;
    }

    readFileAndLoad(file, loadNames);
    e.target.style.display = 'none';
    
    return false;
}
/***
 *** Setup Handelers
 ***/

function setup() {

	var cols = document.querySelectorAll('.drop_zone');
	[].forEach.call(cols, function(col) {
		col.addEventListener('dragstart', handleDragStart, false);
		col.addEventListener('dragenter', handleDragEnter, false);
		col.addEventListener('dragleave', handleDragLeave, false);
		col.addEventListener('dragover',  handleDragOver, false);
		col.addEventListener('dragend',   handleDragEnd, false);
	});
	var cols = document.querySelectorAll('#names_zone');
	[].forEach.call(cols, function(col) {
		col.addEventListener('drop', handleDropNames, false);
	});
        var cols = document.querySelectorAll('#fileSelector');
        [].forEach.call(cols, function(col) {
                console.log(col)
                console.log(col.tagName)
                console.log(col.type)
                col.addEventListener('input', handleSelectFile, false);
                col.addEventListener('change', handleSelectFile, false);
        });
        var cols = document.querySelectorAll('#btnSorteia');
        [].forEach.call(cols, function(col) {
          col.addEventListener('click', function (e) {
            if(!window.nomes){
              alert('Faltando a lista de nomes recarregue a pagina e escolha um arquivo com uma lista de nomes.');
              
            }else if(window.nomes.length == 0){
              alert('Todos os nomes ja foram sorteados');
              
            }else{
              sorteado = Math.min(window.nomes.length-1, 
                     Math.floor(Math.random() * window.nomes.length));
            
              el = document.createElement('div');
              elt = document.createTextNode(window.nomes[sorteado]);
              el.appendChild(elt);
              el.setAttribute('style', 'color:000080; font-weight:bold;');
              document.getElementById('sorteados').appendChild(el, el.target);
              window.nomes.splice(sorteado, 1);
            }
          });
        });
        console.log('setup finished');

}
window.addEventListener('load', setup, true);
