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


function getData(dataText) {
  
  let data;
  const dataJSON = dataText || localStorage.getItem('c60-cms') || '[]';
  
  // Fix corrupted data.
  try {
    data = JSON.parse(dataJSON);
  } catch(e) {
    data = [];
    localStorage.setItem('c60-cms', '[]');
  }    
  
  // Fix data container is not array.
  if (data.constructor.name !== 'Array') {
    data = [data];
    localStorage.setItem('c60-cms', JSON.stringify(data));
  }
  
  // Convert old data structure 2D array to object array.
  if (Array.isArray(data[0])) {
    
    const keys = [
      'หมวด', 'ส่วน', 'มาตรา', 'ร่างมาตรา',
      'ร่างบทบัญญัติ', 'ประเด็นการพิจารณา', 'มติที่ประชุม',
      'หมายเหตุ', 'ผู้อภิปราย', 'ประชุมครั้งที่', 'หน้า'
    ];

    const newData = data
        .map(row => row.toSpliced(10, 1))
        .map(row => {
            const newRow = {};
            row.forEach((col, index) => newRow[keys[index]] = col)
            return newRow;
        });

    const newJSON = JSON.stringify(newData);
    localStorage.setItem('c60-cms', newJSON);
    return newData;
    
  }
  return data;
}



function render({ id, to, remove }) {
  [id, to, remove] = [id, to, remove]
    .map(val => parseInt(val));
  if (id+1) {
    const elem = document
      .querySelector(`[data-index="${id}"]`);
    if (to+1) {
      const dest = (to > id)
        ? document.querySelector(`[data-index="${to+1}"]`)
        : document.querySelector(`[data-index="${to}"]`);
      dest.before(elem);
      renderID();
      return `ID: ${id+1} moved to ID: ${to+1}.`;
    } else {
      renderTBody(id);
      return `ID: ${id+1} was added/edited.`;
    }
  } else {
    if (remove+1) {
      const elem = document
        .querySelector(`[data-index="${remove}"]`);
      elem.remove();
      renderID();
      return `ID: ${remove+1} was removed.`;
    } else {
      const dataSection = document.getElementById('data-section');
      dataSection.innerHTML = '';
      dataSection.append( renderTable($data, dataSection) ) ;
      formsInit();
      return `Whole table re-rendered.`;
    }
  }
}


function renderID() {
  const tdArr = Array.from(
    document.querySelectorAll('tr td:first-child')
  );
  tdArr.forEach((elem, index) => {
    elem.parentNode.dataset.index = index;
    elem.textContent = index + 1;
    return elem;
  });
  return tdArr;
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
  
  const data = rowIndex+1
    ? [ $data[rowIndex] ]
    : $data;
  
  const tbody = rowIndex+1
    ? document.querySelector('tbody')
    : document.createElement('tbody');
  
  data.forEach((row, index) => {

    const id = rowIndex+1 ? rowIndex : index;
    const tr = document.createElement('tr');
    tr.dataset.index = id;
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
      
      if (rowIndex+1) {
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
    editButton.className = 'data-edit';
    moveButton.className = 'data-move';
    deleteButton.className = 'data-delete';
    
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
    editButton.addEventListener('click', evt => {
      const rowID = evt.target
        .parentNode.parentNode
        .dataset.index;
      editForms(tr, rowID);
      return evt;
    });
    
    moveButton.textContent = 'Move';
    moveButton.addEventListener('click', evt => {
      const to = prompt('Move this record to what ID?') - 1;
      const rowID = evt.target
        .parentNode.parentNode
        .dataset.index;
      if (
        Number.isInteger(to)
        && to > -1
        && to < $data.length
        && to != rowID
      ) {
        const row = $data[rowID];
        save($data
          .toSpliced(rowID, 1)
          .toSpliced(to, 0, row)
        );
        render({ id: rowID, to });
      }      
      return evt;
    });
    
    deleteButton.textContent = 'Delete';
    deleteButton.addEventListener('click', evt => {
      if ( confirm('ต้องการลบข้อมูลบรรทัดนี้?') ) {
        const rowID = evt.target
          .parentNode.parentNode
          .dataset.index;
        save( $data.toSpliced(rowID, 1) );
        render({ remove: rowID });
      }
      return evt;
    });

  });
  
  const addRow = document.getElementById('add-row');
  if (!addRow) addForms(tbody);
  
  return tbody;
  
}


function addForms(tbody) {
  const tr = document.createElement('tr');
  const formsTD = $keys.map(key =>
    `<td class="add-cell" data-type="${key[1]}" contenteditable></td>`
  ).join('\n');
  tr.id = 'add-row';
  tr.dataset.index = tbody.querySelectorAll('tr').length;
  tr.innerHTML = `
    <td>${$data.length + 1}</td>
    ${formsTD}
    <td data-type="action"><button id="data-add">Add</button></td>
  `;
  tr
    .querySelector('#data-add')
    .addEventListener('click', addHandler);
  tbody.append(tr);
  return formsInit(tr);
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
    return `
      <td class="edit-cell"
        data-type="${key[1]}"
        data-ref="$data[${oldTR.dataset.index}]['${key[0]}']"
        contenteditable>
      ${editData}</td>
    `;
  }).join('');
  
  newTR.className = 'edit-row';
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
  formsInit(newTR, 'edit');
  newTR.querySelector('.edit-cell').focus();
  document.execCommand('selectAll', false, null);
  document.getSelection().collapseToEnd();
  return newTR;

}


function formsInit(tr, type='add') {
  
  const isEdit = (type === 'edit');
  
  if (isEdit) {
    const saveBtn = tr.querySelector('.data-save');
    const cancelBtn = tr.querySelector('.data-cancel');
    saveBtn.addEventListener('click', editHandler);
    cancelBtn.addEventListener('click', cancelHandler);
  }

  let textProcessing;
  const initCells = isEdit 
    ? tr.querySelectorAll('.edit-cell')
    : document.querySelectorAll('.add-cell');
    
  initCells.forEach((cell, index) => {
    
    if (cell.dataset.type === 'html') {
    
      const pasteProcessing = textProcessing = evt => {
        if ( cell.childNodes.length === 1
          && cell.childNodes[0].nodeType === 3)
          cell.innerHTML = `<p>${cell.innerHTML}</p>`;
        cleanData(cell);
        simplifyCSS(cell);
        cell.innerHTML = fixChars(cell.innerHTML);
        if (!cell.textContent.trim())
          cell.innerHTML = '<p>&nbsp;</p>';
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

        if (!cell.textContent.trim())
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
    
    cell.addEventListener('focus', textProcessing)
    cell.addEventListener('blur', textProcessing)
    
    if (cell.className === 'edit-cell') {
    
      const data = $data[tr.dataset.index][$keys[index][0]];
      const editedCheck = evt => {
      
        if (cell.dataset.type === 'html') {
          cell.classList.add('edited');
          if (!data && !cell.textContent.trim()) {
            cell.classList.remove('edited');
          }
          if (cell.innerHTML.trim() === data) {
            cell.classList.remove('edited');
          }
          
        } else if (cell.dataset.type === 'array') {
          const cellArr = Array.from(
            cell.querySelectorAll('li')
          ) .map(li => li.textContent.trim())
            .filter(txt => txt.length);
          if (JSON.stringify(data) === JSON.stringify(cellArr))
            cell.classList.remove('edited');
          else
            cell.classList.add('edited');
          
        } else {
          if (data === cell.textContent.trim())
            cell.classList.remove('edited');
          else
            cell.classList.add('edited');
        }
        
        return evt;
      };
      
      cell.addEventListener('keyup', editedCheck);
      cell.addEventListener('blur', editedCheck);
      cell.addEventListener('paste', evt => setTimeout(editedCheck, 1));
      
    }
    
    return cell;
    
  });
  
  return tr;
  
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
  render({ id: $data.length - 1 });
  document.querySelector('.add-cell').focus();
  return addedData;
}


function editHandler(evt) {
  const tr = evt.target.parentNode.parentNode;
  const id = tr.dataset.index;
  const editCells = Array.from(
    tr.querySelectorAll('.edit-cell')
  );
  const editedData = editCells
    .map(mappingData)
    .reduce((obj, data, index) => {
      obj[$keys[index][0]] = data;
      return obj;
    }, {});
  save( $data.toSpliced(id, 1, editedData) );
  render({ id });
  return editedData;
}


function cancelHandler(evt) {
  const oldTR = evt.target.parentNode.parentNode;
  const isEdited = oldTR.querySelector('.edited');
  const index = oldTR.dataset.index;
  if (isEdited &&
    !confirm('มีข้อมูลที่กำลังแก้ไขอยู่ ต้องการยกเลิกการแก้ไข?')
  ) return;
  render({ id: index });
  return evt;
}


function save(dataArr) {
  $data = dataArr;
  localStorage.setItem('c60-cms', JSON.stringify(dataArr));
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
    .replace(/[]+/g, '่')
    .replace(/[]+/g, '้')
    .replace(/+/g, '็')
    .replace(/+/g, '์')
    .replace(/+/g, 'ิ')
    .replace(/+/g, 'ี')
    .replace(/+/g, 'ื')
    .replace(/+/g, 'ั')
    .replace(/ํา/g, 'ำ')
    .replace(/่ื/g, 'ื่')
    .replace(/่ี/g, 'ี่')
    .replace(/้ื/g, 'ื้')
    .replace(/้ี/g, 'ี้')
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


function checkUnsaved() {
  const isAdding = !Array.from(
    document.querySelectorAll('.add-cell')
  ).every(elem => elem.textContent.trim() === '');
  const isEditing = (
    document.getElementById('edited-count').textContent !== '0'
  );
  return (isAdding || isEditing);
}

 
function upload(evt) {
  if (confirm('ข้อมูลปัจจุบันจะหายไปและถูกแทนที่ด้วยข้อมูลใหม่ ต้องการอัพโหลดข้อมูล?')) {
    const files = evt.target
      ? evt.target.files
      : evt.files;
    if (files.length) {
      const reader = new FileReader();
      reader.addEventListener('load', evt => {
        const result = evt.target.result;
        try {
          const json = getData(result);
          $data = json;
          save($data);
          render({});
        } catch (e) {
          alert('Uploaded file is not in JSON format.');
        }
        return evt;
      });
      reader.readAsText(files[0]);
    }
  }
  return evt;
}


function download(evt) {
  if (!checkUnsaved() || confirm('มีข้อมูลที่ถูกแก้ไขแต่ยังไม่ได้บันทึก ต้องการดาวน์โหลดข้อมูลเฉพาะที่บันทึกแล้ว?')) {
    const a = document.createElement('a');
    const file = new Blob([JSON.stringify($data)], {type: 'text/plain'});
    a.href = URL.createObjectURL(file);
    a.download = 'c60-json-' + (new Date).getTime() + '.txt';
    a.click();
    URL.revokeObjectURL(a.href);
  }
  return evt;
}


(function init(param) {

  addEventListener('load', evt => {
    
    render({});
  
    // reset button
    document.getElementById('data-reset').addEventListener('click', evt => {
      if ( confirm('ต้องการลบข้อมูลทั้งหมด?') ) {
        $data = [];
        save($data);
        render({});
      }
      return evt;
    });
  
    // copy button
    document.getElementById('data-copy').addEventListener('click', evt => {
      const clipboard = document.getElementById('clipboard');
      clipboard.value = JSON.stringify($data);
      clipboard.select();
      document.execCommand('copy');
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
    
    // re-validate all edited records
    document.getElementById('rar').addEventListener('click', evt => {
      evt.stopPropagation();
      evt.preventDefault();
      const editCells = document.querySelectorAll('.edit-cell');
      const blurEvt = new Event('Event');
      blurEvt.initEvent('blur', true, true);
      editCells.forEach(elem => elem.dispatchEvent(blurEvt));
      return evt;
    });

    // edit all records
    document.getElementById('ear').addEventListener('click', evt => {
      evt.stopPropagation();
      evt.preventDefault();
      document
        .querySelectorAll('.data-edit')
        .forEach(btn => btn.click());
      document
        .querySelector('footer')
        .scrollIntoView({ behavior: 'instant', block: 'end' });
      return evt;
    });
    
    // save all records
    document.getElementById('sar').addEventListener('click', evt => {
      evt.stopPropagation();
      evt.preventDefault();
      document
        .querySelectorAll('.data-save')
        .forEach(btn => btn.click());
      return evt;
    });
    
    // cancel all records
    document.getElementById('car').addEventListener('click', evt => {
      evt.stopPropagation();
      evt.preventDefault();
      document
        .querySelectorAll('.data-cancel')
        .forEach(btn => btn.click());
      return evt;
    });
    
    // go to add
    document.getElementById('anr').addEventListener('click', evt => {
      let scrollTimeout;
      evt.stopPropagation();
      evt.preventDefault();
      document
        .querySelector('footer')
        .scrollIntoView({ behavior: 'smooth', block: 'end' });
      setTimeout(() => {
        document.querySelector('.add-cell').focus();
      }, 1200);
      return evt;
    });
    
    // back to top
    document.getElementById('btt').addEventListener('click', evt => {
      evt.stopPropagation();
      evt.preventDefault();
      document
        .getElementById('data-action')
        .scrollIntoView({ behavior: 'smooth', block: 'start' });
      return evt;
    });
    
    // edited count update
    setInterval(() => {
      document.getElementById('edited-count').textContent
      = document.querySelectorAll('.edited').length;
      return;
    }, 500);

    return evt;
  });
  
  addEventListener('beforeunload', evt => {
    if (checkUnsaved()) evt.preventDefault();
    return evt;
  });
  
  return true;
})({});
