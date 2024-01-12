var $data = (localStorage.getItem('c60-cms'))
? JSON.parse(localStorage.getItem('c60-cms'))
: [];


// wrap text node in span
function wrapText(elem) {
  elem.childNodes.forEach(node => {
    if (node.nodeType === 3) {
      const text = node.data.replace(/\s+/g, ' ');
      if (text !== ' ' && node.parentNode.tagName.match(/^p$/i)) {
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
    if (node.tagName && node.tagName.match(/^span$/i)) {
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


function render() {        
  const dataSection = document.getElementById('data-section');
  dataSection.innerHTML = '';
  dataSection.appendChild( renderTable($data, dataSection) ) ;
  formsInit();
  return dataSection;
}

function save(dataArr) {
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


function cancelHandler(evt) {
  const oldTR = evt.target.parentNode.parentNode;
  const index = oldTR.dataset.index;
  const newTR = renderRows([$data[index]], { position: index });
  return evt;
}


function editHandler(evt) {
  
  const tr = evt.target.parentNode.parentNode;
  const index = tr.dataset.index;
  const editCells = Array.from(
    tr.querySelectorAll('.edit-cell')
  );
  const editData = editCells.map(mappingData);

  $data[index] = editData;
  save($data);
  // tr.scrollIntoView({ behavior: 'smooth', block: "center" });
  return editData;

}


function addHandler(evt) {
  
  const addCells = Array.from(
    document.querySelectorAll('.add-cell')
  );
  const newData = addCells.map(mappingData);

  $data.push(newData);
  save($data);
  addCells[0].focus();
  // evt.target.scrollIntoView({ behavior: 'smooth', block: "end" });
  return newData;

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

  var textProcessing;
  const initCells = (tr)
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
    
    ['focus', 'blur'].forEach(
      evt => cell.addEventListener(evt, textProcessing)
    );
    return cell;
    
  });
  
  initCells[0].focus();
  return initCells;
  
}


function editForms(oldTR, index) {
  
  const arrData = $data[index][8];
  const arrHTML = (arrData.length)
    ? '<ul><li>' + arrData.join('</li><li>') + '</li></ul>'
    : '';

  const newTR = document.createElement('tr');
  newTR.id = 'edit-row';
  newTR.dataset.index = index;
  newTR.innerHTML = `
    <td class="edit-cell" data-type="text" contenteditable>${$data[index][0]}</td>
    <td class="edit-cell" data-type="text" contenteditable>${$data[index][1]}</td>
    <td class="edit-cell" data-type="text" contenteditable>${$data[index][2]}</td>
    <td class="edit-cell" data-type="text" contenteditable>${$data[index][3]}</td>
    <td class="edit-cell" data-type="html" contenteditable>${$data[index][4]}</td>
    <td class="edit-cell" data-type="html" contenteditable>${$data[index][5]}</td>
    <td class="edit-cell" data-type="html" contenteditable>${$data[index][6]}</td>
    <td class="edit-cell" data-type="text" contenteditable>${$data[index][7]}</td>
    <td class="edit-cell" data-type="array" contenteditable>${arrHTML}</td>
    <td class="edit-cell" data-type="number" contenteditable>${$data[index][9]}</td>
    <td class="edit-cell" data-type="nonalphabet" contenteditable>${$data[index][10]}</td>
    <td class="edit-cell" data-type="nonalphabet" contenteditable>${$data[index][11]}</td>
    <td data-type="action">
      <button class="data-save">Save</button>
      <br /><br />
      <button class="data-cancel">Cancel</button>
    </td>
  `;
  
  oldTR.replaceWith(newTR);
  formsInit(newTR);
  
  return newTR;
  
}


function renderForms() {
  const tr = document.createElement('tr');
  tr.id = 'add-row';
  tr.innerHTML = `
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
    <td class="add-cell" data-type="nonalphabet" contenteditable></td>
    <td data-type="action"><button id="data-add">Add</button></td>
  `;
  return tr;
}


function renderRows(rows, options={}) {
  
  const tableGroupTag = (options.isHeader) ? 'thead' : 'tbody'
  const tableGroup = (options.position)
    ? document.querySelector(tableGroupTag)
    : document.createElement(tableGroupTag);
  
  if (rows) rows.forEach((cells, index) => {
  
    const row = document.createElement('tr');
    cells.forEach(cellData => {
    
      const cell = document.createElement(
        (options.isHeader) ? 'th' : 'td'
      );
      
      cell.innerHTML = (Array.isArray(cellData) && cellData.length)
      ? '<ul><li>' + cellData.join('</li><li>') + '</li></ul>'
      : cellData;
      
      row.appendChild(cell);
      
    });
    
    // action column with delete data row button
    if (options.isHeader) {
      const actionCell = document.createElement('th');
      actionCell.textContent = 'Action';
      row.appendChild(actionCell);
    } else {
    
      const actionCell = document.createElement('td');
      const editButton = document.createElement('button');
      const deleteButton = document.createElement('button');
      
      editButton.textContent = 'Edit';
      editButton.addEventListener('click', evt => {
        const tr = actionCell.parentNode;
        editForms(tr, (options.position)
          ? options.position
          : index
        );
        return evt;
      });
      
      deleteButton.textContent = 'Delete';
      deleteButton.addEventListener('click', evt => {
        if ( confirm('ต้องการลบข้อมูลบรรทัดนี้?') ) {
          const tr = actionCell.parentNode;
          tr.parentNode.removeChild(tr);
          $data.splice((options.position)
            ? options.position
            : index
          , 1);
          save($data);
        }
        return evt;
      });
      
      actionCell.appendChild(editButton);
      actionCell.appendChild( document.createElement('br') );
      actionCell.appendChild( document.createElement('br') );
      actionCell.appendChild(deleteButton);
      row.appendChild(actionCell);
      
    }
    
    if (options.position) {
      tableGroup
        .querySelectorAll('tr')[options.position]
        .replaceWith(row);
    } else {
      tableGroup.appendChild(row);
    }
    
    return cells;
    
  });
  
  // last row will show forms to append new row
  if (!options.isHeader && !options.position)
    tableGroup.appendChild(renderForms());
  return tableGroup;
  
}


function renderTable(data, dataTable) {

  const headerData = [[
    'หมวด'
  , 'ส่วน'
  , 'มาตรา'
  , 'ร่างมาตรา'
  , 'ร่างบทบัญญัติ'
  , 'ประเด็นการพิจารณา'
  , 'มติที่ประชุม'
  , 'หมายเหตุ'
  , 'ผู้อภิปราย'
  , 'ประชุมครั้งที่'
  , 'วันที่'
  , 'หน้า'
  ]];

  const table = document.createElement('table');
  table.appendChild(renderRows(headerData, { isHeader: true }));
  table.appendChild(renderRows(data));
  table.border = 1;
  table.id = 'data-table';
  return table;
  
}


function upload(evt) {
  const files = (evt.target)
    ? evt.target.files
    : evt.files;
  if (files.length) {
    const reader = new FileReader();
    reader.addEventListener('load', evt => {
      const result = evt.target.result;
      $data = JSON.parse(result);
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
  
  const dataSection = document.getElementById('data-section');

  addEventListener('load', evt => {
  
    // render data from localStorage
    dataSection.appendChild( renderTable($data, dataSection) );
    formsInit();
  
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
    });
    document.body.addEventListener('drop', evt => {
      evt.stopPropagation();
      evt.preventDefault();
      upload(evt.dataTransfer);
    });
    
    // back to top
    document.getElementById('btt').addEventListener('click', evt => {
      evt.stopPropagation();
      evt.preventDefault();
      document
        .getElementById('data-action')
        .scrollIntoView({ behavior: 'smooth', block: "start" });
    });

    return evt;
  });
  
  return true;
})({});
