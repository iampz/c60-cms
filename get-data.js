function getData(dataText) {
  
  let data;
  const dataJSON = dataText || localStorage.getItem('c60-cms');
  
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
