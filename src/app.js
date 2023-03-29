$(document).ready(function() {
  const main = $('main');
  let blockCount = 0;

  function createContentBlock(id) {
      blockCount++;
      const block = $('<div>', { class: 'contentBlock', id });
      const header = $('<div>', { class: 'blockHeader' });
      const content = $('<div>', { class: 'content' });
      const addBlock = $('<span>', { class: 'addBlock' }).append($('<i>', { class: 'fas fa-plus' }));
      const dragHandle = $('<span>', { class: 'dragHandle' }).append($('<i>', { class: 'fas fa-bars' }));        
      const blockLabel = $('<span>', { class: 'blockLabel' }).text(`Block ${blockCount}`);
      
      const editButton = $('<button>', { class: 'editButton' }).text('Edit');
      const deleteButton = $('<button>', { class: 'deleteButton' }).text('Delete');
      const editDelete = $('<span>', { class: 'editDelete' }).append(editButton, deleteButton);

      const saveButton = $('<button>', { class: 'saveButton' }).text('Save');
      const cancelButton = $('<button>', { class: 'cancelButton' }).text('Cancel');
      const saveCancel = $('<span>', { class: 'saveCancel' }).append(saveButton, cancelButton);

      const blockID = $('<span>', { class: 'blockID' }).append(dragHandle, blockLabel);
      const titleIcon = $('<div>', { class: 'title-icon' }).append($('<h1>').append($('<i>', { class: 'fas fa-terminal' })).text('Code-umentary'));
      
      block.append(header.append(blockID, editDelete), content, saveCancel, addBlock);
      return block;
  }

  function convertToHtml(markdownContent) {
      const converter = new showdown.Converter();
      const htmlContent = converter.makeHtml(markdownContent);
      return htmlContent;
  }

  function highlightCode(blockElement) {
      const codeBlocks = blockElement.find('pre code');
      codeBlocks.each(function(i, block) {
        Prism.highlightElement(block);
      });
  }

  function editContentBlock(block) {
      const originalContent = block.data('originalContent') || block.find('.content').html();
      const editArea = $('<textarea>', { class: 'editArea' }).val(originalContent);
      const saveCancel= block.find('.saveCancel');
      const editDelete = block.find('.editDelete');
      const addBlock = block.find('.addBlock');
      
      block.find('.content').html(editArea);
      editDelete.hide();
      addBlock.hide();
      saveCancel.show();
  }

  function saveContentBlock(block) {
    const editArea = block.find('.editArea');
    const saveCancel= block.find('.saveCancel');
    const editDelete = block.find('.editDelete');
    const addBlock = block.find('.addBlock');
    const blockContent = editArea.val();
    const htmlContent = convertToHtml(blockContent);

    block.find('.content').html(htmlContent);
    highlightCode(block.find('.content'));
    block.data('originalContent', blockContent);

    saveCancel.hide();
    editDelete.show();
    addBlock.show();
  }

  function cancelContentBlock(block) {
    const saveCancel= block.find('.saveCancel');
    const editDelete = block.find('.editDelete');
    const addBlock = block.find('.addBlock');
    const originalContent = block.data('originalContent') || '';

        // if there is no original content, delete the block
        if (originalContent === '') {
            block.remove();
            return;
        }

        const htmlContent = convertToHtml(originalContent);
        block.find('.content').html(htmlContent);
        highlightCode(block.find('.content'));

        saveCancel.hide();
        editDelete.show();
        addBlock.show();
  }
  
  function deleteContentBlock(block) {
      if (confirm("Are you sure you want to delete this block?")) {
          block.remove();
      }
  }
  
  main.sortable({
      handle: '.dragHandle',
      update: function(event, ui) {
          // Handle sorting logic here
      }
  });
  
  $('#newBlockButton').click(function() {
      const blockID = 'contentBlock-' + Date.now();
      const block = createContentBlock(blockID);
      main.append(block);
      editContentBlock(block);
  });
  
  main.on('click', '.editButton', function() {
      const block = $(this).closest('.contentBlock');
      editContentBlock(block);
  });
  
  main.on('click', '.deleteButton', function() {
      const block = $(this).closest('.contentBlock');
      deleteContentBlock(block);
  });

  main.on('click', '.saveButton', function() {
    const block = $(this).closest('.contentBlock');
    saveContentBlock(block);
  });

  main.on('click', '.cancelButton', function() {
    const block = $(this).closest('.contentBlock');
    cancelContentBlock(block);
  });
  
  main.on('click', '.addBlock', function() {
      const block = $(this).closest('.contentBlock');
      const blockID = 'contentBlock-' + Date.now();
      const newBlock = createContentBlock(blockID);
      block.after(newBlock);
      editContentBlock(newBlock);
  });

  // create a new block
  $('#newBlockButton').click();
});
