let $data = getData();
const $keys = [
    [ 'หมวด', 'text' ]
  , [ 'ส่วน', 'text' ]
  , [ 'มาตรา', 'text' ]
  , [ 'ร่างมาตรา', 'text' ]
  , [ 'ร่างบทบัญญัติ', 'html' ]
  , [ 'ประเด็นการพิจารณา', 'html' ]
  , [ 'มติที่ประชุม', 'html' ]
  , [ 'หมายเหตุ', 'text' ]
  , [ 'ผู้อภิปราย', 'array' ]
  , [ 'ประชุมครั้งที่', 'number' ]
  , [ 'หน้า', 'nonalphabet' ]
];


function render() {        
  const dataSection = document.getElementById('data-section');
  dataSection.innerHTML = '';
  dataSection.append( renderTable($data, dataSection) ) ;
  formsInit();
  return dataSection;
}


function renderTable() {
  const table = document.createElement('table');
  table.id = 'data-table';
  table.border = 1;
  table.append(renderTHead(), renderTBody());
  return table;
}


function renderTHead() {
  
  const thead = document.createElement('thead');
  const tr = document.createElement('tr');
  
  thead
    .appendChild(tr)
    .appendChild(document.createElement('th'))
    .append('ID');
  
  $keys.forEach(key => {
    tr
      .appendChild(document.createElement('th'))
      .append(key[0]);
  });
  
  tr
    .appendChild(document.createElement('th'))
    .append('Action');;
  
  return thead;
  
}


function renderTBody(rowIndex) {
  
  const data = rowIndex
    ? [ $data[rowIndex] ]
    : $data;
  
  const tbody = rowIndex
    ? document.querySelector('tbody')
    : document.createElement('tbody');
  
  data.forEach((row, index) => {

    const id = rowIndex ? rowIndex : index;
    const tr = document.createElement('tr');
    tr.dataset.index = index;
    tr
      .appendChild(document.createElement('td'))
      .append(Number(id) + 1);
  
    $keys.forEach(key => {
    
      const td = document.createElement('td');
      const tdData = row[key[0]];
      td.innerHTML = (Array.isArray(tdData) && tdData.length)
        ? '<ul><li>' + tdData.join('</li><li>') + '</li></ul>'
        : tdData;
      tr.append(td);
      
      if (rowIndex) {
        tbody
          .querySelectorAll('tr')[rowIndex]
          .replaceWith(tr);
      } else {
        tbody.append(tr);
      }
      
      return td;

    });
  
    const actionTD = document.createElement('td');
    const editButton = document.createElement('button');
    const moveButton = document.createElement('button');
    const deleteButton = document.createElement('button');
    
    tr
      .appendChild(actionTD)
      .append(
          editButton
        , document.createElement('br')
        , moveButton
        , document.createElement('br')
        , deleteButton
      );
    
    editButton.textContent = 'Edit';
    editButton.addEventListener('click', evt =>
      editForms(tr, id)
    );
    
    moveButton.textContent = 'Move';
    moveButton.addEventListener('click', evt => {
      const to = prompt('Move this record to what ID?');
      if (to) {
        const row = $data[id];
        save($data
          .toSpliced(id, 1)
          .toSpliced(to-1, 0, row)
        );
      }      
      return evt;
    });
    
    deleteButton.textContent = 'Delete';
    deleteButton.addEventListener('click', evt => {
      if ( confirm('ต้องการลบข้อมูลบรรทัดนี้?') ) {
        tr.parentNode.removeChild(tr);
        save( $data.toSpliced(id, 1) );
      }
      return evt;
    });

  });
  
  if (!rowIndex) tbody.append( addForms(data.length) );
  
  return tbody;
  
}


function addForms(id) {
  const tr = document.createElement('tr');
  const formsTD = $keys.map(key =>
    `<td class="add-cell" data-type="${key[1]}" contenteditable></td>`
  ).join('\n');
  tr.id = 'add-row';
  tr.innerHTML = `
    <td>${id+1}</td>
    ${formsTD}
    <td data-type="action"><button id="data-add">Add</button></td>
  `;
  return tr;
}


function editForms(oldTR, index) {
  
  const arrData = $data[index]['ผู้อภิปราย'];
  const arrHTML = arrData.length
    ? '<ul><li>' + arrData.join('</li><li>') + '</li></ul>'
    : '';

  const newTR = document.createElement('tr');
  const formsTD = $keys.map(key => {
    const editData = (key[1] === 'array')
      ? arrHTML
      : $data[index][key[0]];
    return
      `<td class="edit-cell" data-type="${key[1]}" contenteditable>${editData}</td>`;
  }).join('\n');
  
  newTR.id = 'edit-row';
  newTR.dataset.index = index;
  newTR.innerHTML = `
    <td>${Number(index)+1}</td>
    ${formsTD}
    <td data-type="action">
      <button class="data-save">Save</button><br />
      <button class="data-cancel">Cancel</button>
    </td>
  `;
  
  oldTR.replaceWith(newTR);
  formsInit(newTR);
  
  return newTR;
  
}


function formsInit(tr) {
  
  if (tr) {
    const saveBtn = tr.querySelector('.data-save');
    const cancelBtn = tr.querySelector('.data-cancel');
    saveBtn.addEventListener('click', editHandler);
    cancelBtn.addEventListener('click', cancelHandler);
  } else {
    const addBtn = document.getElementById('data-add');
    addBtn.addEventListener('click', addHandler);
  }

  let textProcessing;
  const initCells = tr
    ? tr.querySelectorAll('.edit-cell')
    : document.querySelectorAll('.add-cell');
    
  initCells.forEach(cell => {
  
    if (cell.dataset.type === 'html') {
    
      const pasteProcessing = textProcessing = evt => {
        if ( cell.childNodes.length === 1
          && cell.childNodes[0].nodeType === 3)
          cell.innerHTML = `<p>${cell.innerHTML}</p>`;
        cell.innerHTML = fixChars(cell.innerHTML);
        cleanData(cell);
        simplifyCSS(cell);
        if (!cell.textContent) cell.innerHTML = '<p>&nbsp;</p>';
        return evt
      }
      
      cell.addEventListener('paste', evt => setTimeout(pasteProcessing, 1));

      // Add strikethrough shortcut with ctrl+y
      cell.addEventListener('keyup', evt => {
        if (cell.matches(':focus') && evt.ctrlKey && evt.keyCode === 89)
          document.execCommand('strikeThrough');
        return evt;
      });
      
    } else if (cell.dataset.type === 'text') {
      textProcessing = evt =>
        cell.textContent = fixChars(
          cell.textContent.trim()
        );
      
    } else if (cell.dataset.type === 'number') {
      textProcessing = evt =>
        cell.textContent = fixChars(
          cell
            .textContent
            .replace(/[^0-9]/g, '')
            .trim()
        );
      
    } else if (cell.dataset.type === 'nonalphabet') {
      textProcessing = evt =>
        cell.textContent = fixChars(
          cell
            .textContent
            .replace(/[a-zA-Zก-๙]/g, '')
            .trim()
        );
      
    } else if (cell.dataset.type === 'array') {
    textProcessing = evt => {

        if (!cell.textContent)
          cell.innerHTML = '<ul><li>&nbsp;</li></ul>';
        else if (cell.innerHTML.match(/\<div\>/))
          cell.innerHTML = `<ul><li>${cell.textContent}</li></ul>`;
        
        cell.innerHTML = cell.innerHTML
          .replace(/\<li\>\<li\>/g, '<li>')
          .replace(/\<\/li\>\<\/li\>/g, '</li>');
          
        cell.querySelectorAll('li').forEach(
          li => li.textContent = fixChars(
            li.textContent.trim()
          )
        );
        return evt;

      };
    }
    
    cell.addEventListener('blur', textProcessing)
    
    return cell;
    
  });
  
  return initCells;
  
}


function addHandler(evt) {
  const addCells = Array.from(
    document.querySelectorAll('.add-cell')
  );
  const addedData = addCells
    .map(mappingData)
    .reduce((obj, data, index) => {
      obj[$keys[index][0]] = data;
      return obj;
    }, {});
  save( $data.concat(addedData) );
  addCells[0].focus();
  return addedData;
}


function editHandler(evt) {
  const tr = evt.target.parentNode.parentNode;
  const index = tr.dataset.index;
  const editCells = Array.from(
    tr.querySelectorAll('.edit-cell')
  );
  const editedData = editCells
    .map(mappingData)
    .reduce((obj, data, index) => {
      obj[$keys[index][0]] = data;
      return obj;
    }, {});
  save( $data.toSpliced(index, 1, editedData) );
  return editedData;
}


function cancelHandler(evt) {
  const oldTR = evt.target.parentNode.parentNode;
  const index = oldTR.dataset.index;
  renderTBody(index);
  return evt;
}


function save(dataArr) {
  $data = dataArr;
  localStorage.setItem('c60-cms', JSON.stringify(dataArr));
  render();
  return dataArr;
}


function mappingData(cell) {
  if (cell.dataset.type === 'array') {
    const lists = Array.from(
      cell.querySelectorAll('li')
    );
    return lists
      .map(list => list
        .textContent
        .replace(/\&nbsp\;/g, ' ')
        .trim()
      )
      .filter(text => text);
  } else {
    return cell
      .innerHTML
      .replace(/\&nbsp\;/g, ' ')
      .trim()
      .replace(/\<p\>\s*<\/p\>/g, '');
  }
}


// cleanup junk characters from pdf and swap thai numeral to arabic numeral
function fixChars(str) {
  return str
    .replace(/๐/g, '0')
    .replace(/๑/g, '1')
    .replace(/๒/g, '2')
    .replace(/๓/g, '3')
    .replace(/๔/g, '4')
    .replace(/๕/g, '5')
    .replace(/๖/g, '6')
    .replace(/๗/g, '7')
    .replace(/๘/g, '8')
    .replace(/๙/g, '9')
    .replace(/[,]+/g, '่')
    .replace(/[,,]+/g, '้')
    .replace(/+/g, '็')
    .replace(/+/g, '์')
    .replace(/+/g, 'ิ')
    .replace(/+/g, 'ี')
    .replace(/+/g, 'ื')
    .replace(/+/g, 'ั')
    .replace(/ํา/g, 'ำ')
    .replace(/่ื/g, 'ื่')
    .replace(/่ี/g, 'ี่')
    .replace(/[่]{2,}/g, '่')
    .replace(/[้]{2,}/g, '้')
    .replace(/[๊]{2,}/g, '๊')
    .replace(/[๋]{2,}/g, '๋')
    .replace(/[็]{2,}/g, '็')
    .replace(/[ั]{2,}/g, 'ั')
    .replace(/[์]{2,}/g, '์')
    .replace(/[ิ]{2,}/g, 'ิ')
    .replace(/[ี]{2,}/g, 'ี')
    .replace(/[ึ]{2,}/g, 'ึ')
    .replace(/[ื]{2,}/g, 'ื')
    .replace(/[ุ]{2,}/g, 'ุ')
    .replace(/[ู]{2,}/g, 'ู');
}


// wrap text node in span
function cleanData(elem) {

  elem.childNodes.forEach(node => {
    
    // only clean text nodes
    if (node.nodeType === 3) {
    
      const parentElem = node.parentNode;
      const txt = node.data.replace(/\s+/g, ' ');

      if (parentElem.nodeName.match(/^h[1-6]{1}$/i)) {
        const p = document.createElement('p');
        p.innerHTML = parentElem.innerHTML;
        parentElem.replaceWith(p);
      }

      if (parentElem.nodeName.match(/^p$/i)) {
        const span = document.createElement('span');
        span.textContent = txt;
        node.replaceWith(span);
      } else node.replaceWith(txt);
      
    } else if (node.childNodes) {
      if (node.innerHTML.trim()) cleanData(node);
      else node.remove();
    }
    
    return node;
    
  });
  
  return elem;
  
}


// remove class and css, except underline and strikethrough    
function simplifyCSS(elem) {
  elem.childNodes.forEach(node => {
    if (node.nodeName.match(/^span$/i)) {
      if (
        getComputedStyle(node).fontFamily !== '"TH SarabunPSK", sans-serif'
        && getComputedStyle(node).fontFamily !== 'Sarabun, Arial, sans-serif'
        && getComputedStyle(node).fontFamily !== 'Arial'
      ) {
        const newNode = document.createElement('strike');
        newNode.innerHTML = node.innerHTML;
        node.replaceWith(newNode);
      } else if (getComputedStyle(node).textDecorationLine === 'underline') {
        const newNode = document.createElement('u');
        newNode.innerHTML = node.innerHTML;
        node.replaceWith(newNode);
      } else {
        const newNode = document.createTextNode(node.textContent);
        node.replaceWith(newNode);
      }
    }
    if (node.childNodes) simplifyCSS(node);
    if (node.tagName) {
      node.removeAttribute('class');
      node.removeAttribute('style');
    }
    return node;
  });
  return elem;
}

 
function upload(evt) {
  const files = evt.target
    ? evt.target.files
    : evt.files;
  if (files.length) {
    const reader = new FileReader();
    reader.addEventListener('load', evt => {
      const result = evt.target.result;
      try {
        const json = JSON.parse(result);
        $data = json;
        save($data);
      } catch (e) {
        alert('Uploaded file is not in JSON format.');
      }
      return evt;
    });
    reader.readAsText(files[0]);
  }
  return evt;
}


function download(evt) {
  const a = document.createElement("a");
  const file = new Blob([JSON.stringify($data)], {type: 'text/plain'});
  a.href = URL.createObjectURL(file);
  a.download = 'c60-json-' + (new Date).getTime() + '.txt';
  a.click();
  URL.revokeObjectURL(a.href);
  return evt;
}


(function init(param) {

  addEventListener('load', evt => {
    
    render();
  
    // reset button
    document.getElementById('data-reset').addEventListener('click', evt => {
      if ( confirm('ต้องการลบข้อมูลทั้งหมด?') ) {
        $data = [];
        save($data);
      }
      return evt;
    });
  
    // copy button
    document.getElementById('data-copy').addEventListener('click', evt => {
      const clipboard = document.getElementById('clipboard');
      clipboard.value = JSON.stringify($data);
      clipboard.select();
      document.execCommand("copy");
      return evt;
    });
  
    // upload button
    document.getElementById('data-upload').addEventListener('click', evt => {
      const fileInput = document.createElement('input');
      fileInput.type = 'file';
      fileInput.accept = 'text/plain';
      fileInput.addEventListener('change', upload);
      fileInput.click()
      return evt;
    });
  
    // download button
    document.getElementById('data-download').addEventListener('click', evt => {
      download(evt);
      return evt;
    });
    
    // drag & drop file
    document.body.addEventListener('dragover', evt => {
      evt.stopPropagation();
      evt.preventDefault();
      evt.dataTransfer.dropEffect = 'upload';
      return evt;
    });
    document.body.addEventListener('drop', evt => {
      evt.stopPropagation();
      evt.preventDefault();
      upload(evt.dataTransfer);
      return evt;
    });
    
    // back to top
    document.getElementById('btt').addEventListener('click', evt => {
      evt.stopPropagation();
      evt.preventDefault();
      document
        .getElementById('data-action')
        .scrollIntoView({ behavior: 'smooth', block: "start" });
      return evt;
    });

    return evt;
  });
  
  return true;
})({});
