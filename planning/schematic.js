function Schematic(data, schematicEl, legendEl) {
  this.data = data;
  this.blockElArray   = [];
  this.blackBoxes     = [];
  this.blockPropArray = [];
  this.worklib = dataCopy(this.data.worklib);
  this.area  = new designTotal(this.worklib, 'area', this.blackBoxes);
  this.cells = new designTotal(this.worklib, 'cells', this.blackBoxes);
  this.padding = 0.01;
  if(legendEl){
    this.legendEl = legendEl;
    this.initLegend(legendEl, this.data.worklib); 
  }
  if(schematicEl){
    this.schematicEl = schematicEl;
    while(schematicEl.firstChild != null) schematicEl.removeChild(schematicEl.firstChild)
    this.insertDesign(this.data.topModule);
    var r = this.computeRects(this.data.topModule, this.area);
    console.log(this.area.of);
    console.log(r);
    this.placeBlocks(r);
  }
}

Schematic.prototype.initLegend = function(el)
{
  var entries = el.getElementsByTagName('tr');
  var colorDict = {};
  
  for (var i=0; i < entries.length; ++i) {
    el.removeChild(tableRows[x]);
  }
  for(var m in this.data.worklib){
    var c = this.data.worklib[m].color
    if(c) {
      colorDict[c] = (colorDict[c] || []).concat([m]);
    }
  }
  for(var c in colorDict) {
    var tr = el.insertRow(el.rows.length);
    var td1 = tr.insertCell(0);
    var td2 = tr.insertCell(1);
    td1.width = "20px";
    td1.height= "20px";
    td1.bgColor = c;
    for(var i = 0; i < colorDict[c].length; ++i){
      if(i != 0){
        comma = document.createTextNode(', ');
        td2.appendChild(comma);
      }
      l = document.createElement('span');
      l.className = colorDict[c][i];
      l.appendChild(document.createTextNode(colorDict[c][i]));
      l.addEventListener('mouseover', highlightClass);
      l.addEventListener('mouseout', highlightClass);
      td2.append(l);
    }
    // td2.innerHTML = colorDict[c].join(", "); 
  }
}



Schematic.prototype.insertDesignElement = function(module){
  var d = document.createElement('div');
  if(this.worklib[module]){
    d.style.backgroundColor = this.worklib[module].color || 'white';
  }
  d.style.border = '1px solid black';
  d.style.position   = 'absolute';
  d.style.visibility = 'visible';
  d.className = module;
  this.schematicEl.appendChild(d);
  this.blockElArray[this.blockElArray.length] = d;
}

Schematic.prototype.insertDesign = function (module){
  var insts = this.worklib[module].subBlocks || [];
  this.insertDesignElement(module);
  for(var i = 0; i < insts.length; ++i){
    var instCount = (insts[i].count || 1);
    var bModule = insts[i].module;
    for(var j = 0; j < instCount; ++j){
      this.insertDesign(bModule);
    }
  }
}

Schematic.prototype.computeRects = function(module, prop, baseRect){
  var totalArea = prop.of[module] || 0;
  var insts = this.worklib[module].subBlocks || [];
  var countedLeft = 0;
  var rects = [];
  baseRect = baseRect || {top: this.padding/2, left: this.padding/2, width: 1-this.padding, height: 1-this.padding};
  rects[0] = baseRect;
  for(var i = 0; i < insts.length; ++i){
    var instCount = (insts[i].count || 1);
    var bModule = insts[i].module;
    var subArea = prop.of[bModule];
    var subLeft = countedLeft / totalArea;
    var subWidth = (subArea * instCount) / totalArea;
    var subHeight = 1/instCount;
    for(var j = 0; j < instCount; ++j){
      var subTop = j / instCount;
      var instRect = {
        top:   baseRect.top   + baseRect.height * subTop   + this.padding/2,
        left:  baseRect.left  + baseRect.width * subLeft   + this.padding/2,
        width:                  baseRect.width * subWidth  - this.padding,
        height:                 baseRect.height * subHeight- this.padding
      };
      rects = rects.concat(this.computeRects(bModule, prop, instRect));
    }
    countedLeft += subArea * instCount + this.padding;
  }
  return rects;
}

Schematic.prototype.placeBlocks = function(rects){
  for(var i = 0; i < rects.length; i = i + 1){
    var b = this.blockElArray[i].style;
    var r = rects[i];
    b.top = 100 * r.top + '%'
    b.left = 100 * r.left + '%'
    b.width = 100 * r.width + '%'
    b.height = 100 * r.height + '%'
  }
}


function mergeObj(ref, rep){
  if(typeof(ref) == 'object'){
    if(typeof(rep) == 'object'){
      for(p in rep){
        if(typeof(rep[p]) != 'undefined'){
          ref[p] = mergeObj(ref, rep);
        }
      }
    }
  }else{
    if(typeof(rep) != 'undefined'){
      return rep;
    }
  }
  return ref;
}
function dataCopy(obj){
  return JSON.parse(JSON.stringify(obj))
}

function highlightClass(e){
  var elList = document.getElementsByClassName(e.target.className);
  if(e.type == 'mouseout'){
    for(var i = 0; i < elList.length; ++i){  
      el = elList[i];
      console.log(el);
      if(el.style.position == 'absolute'){
        el.style.border = '1px solid black';
      }else{
        el.style.fontWeight = 'normal';
      }
    }
  }else{
    for(var i = 0; i < elList.length; ++i){  
      el = elList[i];
      if(el.style.position == 'absolute'){
        el.style.border = '3px solid black';
      }else{
        el.style.fontWeight = 'bold';
      }
    }
  }
}


function designTotal(worklib, prop, blackBoxes) {
  this.worklib   = worklib;
  this.prop      = prop;
  this.setBlackBoxes(blackBoxes);
}
designTotal.prototype.setBlackBoxes = function(bb){
  // reset the property container object
  this.of        = {};
  // mark for recomputation
  for(m in this.worklib){
    this.of[m] = null;
  }
  // prevent computation of black boxes
  for(i in bb || {}){
    this.of[bb[i]] = 0;
  }
  for(m in this.worklib){
    if(this.of[m] == null){
      this.compute(m);
    }
  }
}

designTotal.prototype.compute = function(module) {
  var total     = (this.worklib[module][this.prop] || 0);
  var subBlocks = this.worklib[module].subBlocks || [];
  if(typeof(this.of[module]) == 'undefined'){
    console.warn('module ' + module + ' not specified in the worklib');
    return 0;
  }
  if(this.of[module] == null){
    for(var i in subBlocks){
      total += this.compute(subBlocks[i].module) * (subBlocks[i].count || 1);
    }
    this.of[module] = total;
  }
  return this.of[module];
}



