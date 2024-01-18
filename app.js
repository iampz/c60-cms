let $data = getData();

const $keys = [
  'หมวด', 'ส่วน', 'มาตรา', 'ร่างมาตรา',
  'ร่างบทบัญญัติ', 'ประเด็นการพิจารณา', 'มติที่ประชุม',
  'หมายเหตุ', 'ผู้อภิปราย', 'ประชุมครั้งที่', 'หน้า'
];


function render() {        
  const dataSection = document.getElementById('data-section');
  dataSection.innerHTML = '';
  dataSection.appendChild( renderTable($data, dataSection) ) ;
  formsInit();
  return dataSection;
}


function renderTable() {
  const table = document.createElement('table');
  table.id = 'data-table';
  table.border = 1;
  table.appendChild(renderTHead());
  table.appendChild(renderTBody());
  return table;
}


function renderTHead() {
  
  const thead = document.createElement('thead');
  const tr = document.createElement('tr');
  thead.appendChild(tr);

  const idTH = document.createElement('th');
  idTH.textContent = 'ID';
  tr.appendChild(idTH);
  
  $keys.forEach(key => {
    const th = document.createElement('th');
    th.textContent = key;
    tr.appendChild(th);
  });
  
  const actionTH = document.createElement('th');
  actionTH.textContent = 'Action';
  tr.appendChild(actionTH);
  
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
    const idTD = document.createElement('td');
    idTD.textContent = Number(id) + 1;
    tr.dataset.index = index;
    tr.appendChild(idTD);
  
    $keys.forEach(key => {
    
      const td = document.createElement('td');
      const tdData = row[key];
      td.innerHTML = (Array.isArray(tdData) && tdData.length)
      ? '<ul><li>' + tdData.join('</li><li>') + '</li></ul>'
      : tdData;
      tr.appendChild(td);
      
      if (rowIndex) {
        tbody
          .querySelectorAll('tr')[rowIndex]
          .replaceWith(tr);
      } else {
        tbody.appendChild(tr);
      }
      
      return td;

    });
  
    const actionTD = document.createElement('td');
    const editButton = document.createElement('button');
    const moveButton = document.createElement('button');
    const deleteButton = document.createElement('button');
    
    actionTD.appendChild(editButton);
    actionTD.appendChild( document.createElement('br') );
    actionTD.appendChild(moveButton);
    actionTD.appendChild( document.createElement('br') );
    actionTD.appendChild(deleteButton);
    tr.appendChild(actionTD);
    
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
  
  if (!rowIndex) tbody.appendChild( addForms(data.length) );
  
  return tbody;
  
}


function addForms(id) {
  const tr = document.createElement('tr');
  tr.id = 'add-row';
  tr.innerHTML = `
    <td>${id+1}</td>
    <td class="add-cell" data-type="text" contenteditable></td>
    <td class="add-cell" data-type="text" contenteditable></td>
    <td class="add-cell" data-type="text" contenteditable></td>
    <td class="add-cell" data-type="text" contenteditable></td>
    <td class="add-cell" data-type="html" contenteditable></td>
    <td class="add-cell" data-type="html" contenteditable></td>
    <td class="add-cell" data-type="html" contenteditable></td>
    <td class="add-cell" data-type="text" contenteditable></td>
    <td class="add-cell" data-type="array" contenteditable></td>
    <td class="add-cell" data-type="number" contenteditable></td>
    <td class="add-cell" data-type="nonalphabet" contenteditable></td>
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
  newTR.id = 'edit-row';
  newTR.dataset.index = index;

  newTR.innerHTML = `
    <td>${Number(index)+1}</td>
    <td class="edit-cell" data-type="text" contenteditable>${$data[index]['หมวด']}</td>
    <td class="edit-cell" data-type="text" contenteditable>${$data[index]['ส่วน']}</td>
    <td class="edit-cell" data-type="text" contenteditable>${$data[index]['มาตรา']}</td>
    <td class="edit-cell" data-type="text" contenteditable>${$data[index]['ร่างมาตรา']}</td>
    <td class="edit-cell" data-type="html" contenteditable>${$data[index]['ร่างบทบัญญัติ']}</td>
    <td class="edit-cell" data-type="html" contenteditable>${$data[index]['ประเด็นการพิจารณา']}</td>
    <td class="edit-cell" data-type="html" contenteditable>${$data[index]['มติที่ประชุม']}</td>
    <td class="edit-cell" data-type="text" contenteditable>${$data[index]['หมายเหตุ']}</td>
    <td class="edit-cell" data-type="array" contenteditable>${arrHTML}</td>
    <td class="edit-cell" data-type="number" contenteditable>${$data[index]['ประชุมครั้งที่']}</td>
    <td class="edit-cell" data-type="nonalphabet" contenteditable>${$data[index]['หน้า']}</td>
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
      textProcessing = evt => {
        if (!cell.textContent) cell.innerHTML = '<p>&nbsp;</p>';
        return evt
      };
      cell.addEventListener('keyup', evt => {
        if (cell.matches(':focus') && evt.ctrlKey) {
          if (evt.keyCode === 89) { // ctrl + y
            document.execCommand('strikeThrough', { isHeader: true });
          } else if (evt.keyCode === 86) { // ctrl + v
            wrapText(cell);
            simplifyCSS(cell);
            fixChars(cell);
          }
        }
        return evt;
      });

      
    } else if (cell.dataset.type === 'text') {
      textProcessing = evt =>
        cell.innerText = cell.textContent;
      
    } else if (cell.dataset.type === 'number') {
      textProcessing = evt =>
        cell.innerText = cell.textContent.replace(/[^0-9]/g, '');
      
    } else if (cell.dataset.type === 'nonalphabet') {
      textProcessing = evt =>
        cell.innerText = cell.textContent.replace(/[a-zA-Zก-๙]/g, '');
      
    } else if (cell.dataset.type === 'array') {
      textProcessing = evt => {
        if (!cell.textContent) cell.innerHTML = '<ul><li>&nbsp;</li></ul>';
        cell.innerHTML = cell.innerHTML
          .replace(/\<li\>\<li\>/g, '<li>')
          .replace(/\<\/li\>\<\/li\>/g, '</li>');
        cell.querySelectorAll('li').forEach(li => li.innerText = li.textContent);
        return evt;
      };
    }
    
    cell.addEventListener('focus', evt => {
      evt.target.focus();
      // document.execCommand('selectAll', false, null);
      // document.getSelection().collapseToEnd();
      return evt;
    });
    
    ['focus', 'blur'].forEach(evt =>
      cell.addEventListener(evt, textProcessing)
    );

    return cell;
    
  });
  
  // initCells[0].focus();
  return initCells;
  
}


function addHandler(evt) {
  const addCells = Array.from(
    document.querySelectorAll('.add-cell')
  );
  const addedData = addCells
    .map(mappingData)
    .reduce((obj, data, index) => {
      obj[$keys[index]] = data;
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
      obj[$keys[index]] = data;
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


// wrap text node in span
function wrapText(elem) {
  elem.childNodes.forEach(node => {
    if (node.nodeType === 3) {
      const text = node.data.replace(/\s+/g, ' ');
      if (text !== ' ' && node.parentNode.nodeName.match(/^p$/i)) {
        const span = document.createElement('span');
        span.innerText = text;
        node.replaceWith(span);
      } else node.replaceWith(text);
    } else if (node.childNodes) wrapText(node);
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


// cleanup junk characters from pdf and swap thai numeral to arabic numeral
function fixChars(elem) {
  elem.innerHTML = elem.innerHTML
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
    .replace(/[,]/g, '่')
    .replace(/[,]/g, '้')
    .replace(//g, '็')
    .replace(//g, '์')
    .replace(//g, 'ิ')
    .replace(//g, 'ี')
    .replace(//g, 'ื')
    .replace(//g, 'ั')
    .replace(/ํา/g, 'ำ')
    .replace(/่ี/g, 'ี่');
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
      $data = getData(result);
      save($data);
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
