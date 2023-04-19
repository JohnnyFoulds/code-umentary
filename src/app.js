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
      const blockLabel = $('<span>', { class: 'blockLabel' }).text('user');
      
      const editButton = $('<button>', { class: 'editButton' }).text('Edit');
      const deleteButton = $('<button>', { class: 'deleteButton' }).text('Delete');
      const editDelete = $('<span>', { class: 'editDelete' }).append(editButton, deleteButton);

      const saveButton = $('<button>', { class: 'saveButton' }).text('Save');
      const cancelButton = $('<button>', { class: 'cancelButton' }).text('Cancel');
      const askButton = $('<button>', { class: 'askButton' }).text('Ask');
      const saveCancel = $('<span>', { class: 'saveCancel' }).append(saveButton, cancelButton, askButton);

      const blockID = $('<span>', { class: 'blockID' }).append(dragHandle, blockLabel);
      const titleIcon = $('<div>', { class: 'title-icon' }).append($('<h1>').append($('<i>', { class: 'fas fa-terminal' })).text('Code-umentary'));
      
      block.append(header.append(blockID, editDelete), content, saveCancel, addBlock);
      return block;
  }

  function convertToHtml(markdownContent) {
      const converter = new showdown.Converter();
      converter.setOption('tables', true);
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

  function persistsDocument() {
    console.log('Saving Document');

    const githubToken = localStorage.getItem('githubToken');
    if (!githubToken) {
      console.log('No GitHub token found.');
      return;
    }
    const documentContent = getDocumentContent();
    const existingGist = JSON.parse(localStorage.getItem('existingGist'));

    // save the document to a github gist
    console.log(documentContent);

    if (existingGist) {
      // update existing gist
      fetch(`https://api.github.com/gists/${existingGist}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `token ${githubToken}`,
        },
        body: JSON.stringify({
          files: {
            [`code_umentary.md`]: {
              content: documentContent,
            },
          },
        }),
      })
        .then(response => response.json())
        .then(data => console.log(`The document has been updated at: ${data.html_url}`))
        .catch(error => console.error(error));
    } else {
      // create new gist
      fetch('https://api.github.com/gists', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `token ${githubToken}`,
        },
        body: JSON.stringify({
          description: 'Created by Code-umentary',
          public: true,
          files: {
            [`code_umentary.md`]: {
              content: documentContent,
            },
          },
        }),
      })
        .then(response => response.json())
        .then(data => {
          console.log(`The document has been saved at: ${data.html_url}`);
          localStorage.setItem('existingGist', JSON.stringify(data.id));
        })
        .catch(error => console.error(error));
    }    
  }

  function saveContentBlock(block) {
    const editArea = block.find('.editArea');
    const saveCancel= block.find('.saveCancel');
    const editDelete = block.find('.editDelete');
    const addBlock = block.find('.addBlock');
    const blockContent = editArea.val();

    // if the question is empty, do nothing
    if (blockContent.trim() === '') return;

    const htmlContent = convertToHtml(blockContent);
    block.find('.content').html(htmlContent);
    highlightCode(block.find('.content'));
    block.data('originalContent', blockContent);

    saveCancel.hide();
    editDelete.show();
    addBlock.show();

    persistsDocument();
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

  async function askQuestion(block) {
    const editArea = block.find('.editArea');
    const question = editArea.val().trim();

    // if the question is empty, do nothing
    if (question === '') return;

    // turn the question into a heading
    heading_level = ''
   if (!question.startsWith('#')) {
    heading_level = '### '
    }
    editArea.val(`${heading_level}${question}`);

    // save the question
    saveContentBlock(block);

    // get the messages
    messages = getBlockMessages(block);
    console.log(messages);

    // ask the question
    // console.log(question);
    apiKey = await getChatGPTApiKey(settings);
    $('#spinner').show();
    response = await fetchMessages(messages, apiKey)

    // create a new block and add the response
    answer_block = createNewBlock(response);
    block.after(answer_block);
    
    const answer_blockLabel = answer_block.find('.blockLabel');
    answer_blockLabel.text('assistant');
    answer_block.data('role', 'assistant');
    answer_block.data('question', question);

    $('#spinner').hide();
    persistsDocument();
  }
  
  function deleteContentBlock(block) {
      if (confirm("Are you sure you want to delete this block?")) {
          block.remove();

          if ($('main .contentBlock').length === 0) {
            $('#newBlockButton').click();
          }

          persistsDocument();
      }
  }

  function createNewBlock(content) {
    const blockID = 'contentBlock-' + Math.floor(Math.random() * 1000000);
    const block = createContentBlock(blockID);

    // update the block question data
    const blockLabel = block.find('.blockLabel');
    block.data('question', blockLabel.text());
    block.data('role', blockLabel.text());

    if (content) {
      block.data('originalContent', content);
      const htmlContent = convertToHtml(content);
      block.find('.content').html(htmlContent);
      highlightCode(block.find('.content'));

      const saveCancel= block.find('.saveCancel');
      saveCancel.hide();
    }
    
    return block;
  }

  function newBlock() {
    block = createNewBlock();
    main.append(block);

    editContentBlock(block);
  }

  function newDocument(createNew=true, warn=true) {
    if (!warn || confirm("Are you sure you want to start a new document? Please note that all unexported contents will be lost!")) {
      // remove the existing gist
      localStorage.setItem('existingGist', null);      

      // Remove all content blocks
      $(".contentBlock").remove();
      
      // Reset block counter to zero
      blockCounter = 0;
      
      // Create a new empty content block
      if (createNew)
        newBlock();

      return true;
    }

    return false;
  }

  function getBlockMessages(block) {
    let messages = [];
    const questionBlockID = block.attr('id')

    $('.contentBlock').each(function () {
      const role = $(this).data('role');
      const content = $(this).data('originalContent');
      const blockID = $(this).attr('id');

      // add the message to the array
      messages.push({
        role: role,
        content: content
      });

      // if the block is the question block, stop adding messages
      if (blockID === questionBlockID) {
        return false;
      }
    });

    return limitTokens(messages, 3000);
  }

  function limitTokens(messages, maxTokens) {
    let limitedMessages = Array.from(messages);
    let tokens = 0;

    do {
      tokens = JSON.stringify(limitedMessages).length / 4

      if (tokens > maxTokens) {
        console.log('Token limit reached. Removing last message:', tokens)
        limitedMessages.shift();
      }

    } while (tokens > maxTokens)

    return limitedMessages;
  }

  function getDocumentContent() {
    let markdownContent = "";
  
    $('.contentBlock').each(function () {
      const blockID = $(this).data('role');
      const separator = `<!-- block-separator id:${blockID} -->`;
      markdownContent += separator + "\n" + $(this).data('originalContent') + "\n\n";
    });
    
    return markdownContent;
  }

  function exportDocument() {
    let markdownContent = getDocumentContent();
  
    const fileName = prompt("Please enter the file name:");
    if (!fileName) return; // Exit if the user cancels the prompt
    const file = new Blob([markdownContent], { type: 'text/plain' });
    const a = document.createElement("a");
    const url = URL.createObjectURL(file);
    a.href = url;
    a.download = fileName + ".md";
    document.body.appendChild(a);
    a.click();
    setTimeout(function () {
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    }, 0);
  }

  function loadDocument(markdownContent, warn=true) {
    // create a new document
    if (newDocument(false, warn)) {
        // Split the content into blocks using the separator
        const separatorRegex = /<!-- block-separator id:(.+) -->\n+/g;
        const blocks = markdownContent.split(separatorRegex);

        // Remove empty strings from the blocks array
        const nonEmptyBlocks = blocks.filter((block) => block.trim() !== '');
    
        // Loop through each block and create a new content block
        for (let i = 0; i < nonEmptyBlocks.length; i += 2) {
          const question = nonEmptyBlocks[i]
          const role = nonEmptyBlocks[i]
          const blockContent = nonEmptyBlocks[i + 1].trim();

          // Create the new content block
          const block = createNewBlock();
          const blockLabel = block.find('.blockLabel');
          const saveCancel= block.find('.saveCancel');

          block.data('role', role);
          blockLabel.text(role);

          block.data('question', question);
          block.data('originalContent', blockContent);

          const htmlContent = convertToHtml(blockContent);
          block.find('.content').html(htmlContent);
          highlightCode(block.find('.content'));            

          saveCancel.hide();
          main.append(block);
        }
    }
  }

  function importDocument() {
    // Create an input element to allow the user to select a file
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.md';
    input.addEventListener('change', () => {
      // Get the selected file
      const file = input.files[0];
      if (!file) return;  

      // Read the contents of the file
      const reader = new FileReader();
      reader.readAsText(file, 'UTF-8');
      reader.onload = (event) => {
        // Get the markdown content
        const markdownContent = event.target.result;
        loadDocument(markdownContent);
      }  
    });

    // Click the input element to trigger the file selection dialog
    input.click();
  }

  async function importGist(gistId, warn=true) {
    const githubToken = localStorage.getItem('githubToken');

    $('#spinner').show();
    try {
      const response = await new Promise((resolve, reject) => {
        fetch(`https://api.github.com/gists/${gistId}`, {
          headers: {
            Authorization: `token ${githubToken}`,
          },
        })
          .then((response) => {
            if (!response.ok) {
              reject(new Error(`Failed to load gist: ${response.status}`));
            }
            resolve(response);
          })
          .catch((error) => reject(error));
      });
      const data = await response.json();
      const file = Object.values(data.files)[0];
      const markdownContent = file.content;

      loadDocument(markdownContent, warn);
      localStorage.setItem('existingGist', JSON.stringify(data.id));
  
    } catch (error) {
      console.error(error);
      alert('Failed to load gist.');
    }
    $('#spinner').hide();
  }

  function openGist() {
    // get the github token
    const githubToken = localStorage.getItem('githubToken');
    if (!githubToken) {
      console.log('No GitHub token found.');
      return;
    }
  
    // get the gist ID from the user
    const gistId = prompt('Enter the ID of the gist to open:');
    if (!gistId) return;
  
    importGist(gistId);
  }

  function settings() {
    return new Promise((resolve) => {
      const apiKey = localStorage.getItem('chatGPTApiKey');
      const githubToken = localStorage.getItem('githubToken');

      // Create the form elements
      const formGroup = $('<div>', { class: 'form-group' });
      const apiKeyInput = $('<input>', { type: 'text', class: 'form-control', id: 'apiKeyInput', placeholder: 'Enter ChatGPT API key' }).val(apiKey);
      const githubTokenInput = $('<input>', { type: 'text', class: 'form-control', id: 'githubToken', placeholder: 'Enter GitHub Access Token' }).val(githubToken);
      
      formGroup.append(apiKeyInput);
      formGroup.append(githubTokenInput);
    
      // Create the dialog box
      const dialog = bootbox.dialog({
        title: 'Settings',
        message: formGroup,
        closeButton: false,
        backdrop: true,
        buttons: {
          cancel: {
            label: 'Cancel',
            className: 'btn-secondary',
            callback: () => {
              resolve(false);
            }
          },
          confirm: {
            label: 'Save',
            className: 'btn-primary',
            callback: function() {
              console.log('Saving settings...', apiKeyInput.val());
              const apiKey = apiKeyInput.val();
              const githubToken = githubTokenInput.val();

              localStorage.setItem('chatGPTApiKey', apiKey);
              localStorage.setItem('githubToken', githubToken);
              resolve(apiKey);
            }
          }
        }
      });
    });
  } 

  main.sortable({
      handle: '.dragHandle',
      update: function(event, ui) {
          // Handle sorting logic here
          persistsDocument();
      }
  });
  
  $('#newBlockButton').click(function() {
    newBlock()
  });

  $('#newDocument').click(function() {
    newDocument();
  });

  $('#openGist').click(function() {
    openGist();
  });
  
  $('#exportDocument').click(function() {
    exportDocument();
  });

  $('#importDocument').click(function() {
    importDocument();
  });

  $('#settings').click(function() {
    settings();
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

  main.on('click', '.askButton', function() {
    const block = $(this).closest('.contentBlock');
    askQuestion(block);
  });
  
  document.addEventListener("keydown", function(event) {
    console.log(event);
    if (event.code === "Enter" && event.altKey) {
      const block = $(event.target).closest('.contentBlock');
      askQuestion(block);
    }
  });

  main.on('click', '.addBlock', function() {
      const block = $(this).closest('.contentBlock');
      const newBlock = createNewBlock();

      block.after(newBlock);
      editContentBlock(newBlock);
  });

  // create a new block
  $('#newBlockButton').click();

  // load the last document if possible
  const existingGist = JSON.parse(localStorage.getItem('existingGist'));
  if (existingGist) {
    console.log(existingGist)
    importGist(existingGist, false);
  }
});
