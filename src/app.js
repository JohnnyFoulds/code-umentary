let blockCount = 0;

function convertToHtml(markdownContent) {
    // Initialize a new instance of the showdown converter
    let converter = new showdown.Converter();
  
    // Convert the markdown content to HTML
    let htmlContent = converter.makeHtml(markdownContent);

    return htmlContent;
}

function highlightCode(blockElement) {
    // Find all code blocks in the HTML content
    let codeBlocks = $(blockElement).find('pre code');
  
    // Loop through each code block and apply syntax highlighting using Prism.js
    codeBlocks.each(function(i, block) {
      Prism.highlightElement(block);
    });
}

function createNewBlock(newBlockID) {
    // Increment the block count
    blockCount++;
    
    // Create the HTML for the new content block
    let newBlockHTML = `
      <div class="contentBlock" id="${newBlockID}">
        <div class="blockHeader">
          <span class="blockID">
            <span class="dragHandle">
              <i class="fas fa-bars"></i>
            </span>
            <span class="blockLabel">Block ${blockCount}</span>
          </span>
          <span class="editDelete">
            <button class="editButton">Edit</button>
            <button class="deleteButton">Delete</button>
          </span>
        </div>
        <div class="content"></div>
        <span class="addBlock"><i class="fas fa-plus"></i></span>
      </div>
    `;
    
    // Return the new block HTML
    return newBlockHTML;
  }

$(document).ready(function() {
    // Enable drag and drop functionality for content blocks
    $(function() {
        $('main').sortable({
            handle: '.dragHandle',
            update: function(event, ui) {
                // Handle sorting logic here
              }
        });
    });    
	
    // Register click event for "New Block" button
    $('#newBlockButton').click(function() {
        blockCount++;
        let blockID = 'contentBlock-' + Date.now();;

        // Create a new block HTML string
        let newBlockHTML = createNewBlock(blockID);

        // Append the new content block to the main content area
        $('main').append(newBlockHTML);

        // Trigger a click event on the "Edit" button of the new block
        $('#' + blockID + ' .editButton').click();        
    });
	
    // Handle click event on "Edit" button within a content block
    $('main').on('click', '.editButton', function() {
        // Get the ID of the content block being edited
        let blockID = $(this).parent().parent().parent().attr('id');

        // Get the original HTML content of the content block
        let blockContent = $('#' + blockID).data('originalContent') || $('#' + blockID + ' .content').html();

        // Replace the content block with a textarea containing the Markdown content
        $('#' + blockID + ' .content').html('<textarea class="editArea">' + blockContent + '</textarea><button class="saveButton">Save</button><button class="cancelButton">Cancel</button>');

        // Hide the "Edit" button in both the content block's "content" div and its parent div
        $('#' + blockID + ' .editDelete').hide();
        $('#' + blockID + ' .addBlock').hide();
    });

    // Handle click event on "Delete" button within a content block
    $('main').on('click', '.deleteButton', function() {
        if (confirm("Are you sure you want to delete this block?")) {
            // Get the ID of the content block being deleted
            let blockID = $(this).parent().parent().parent().attr('id');
        
            // Remove the content block from the DOM
            $('#' + blockID).remove();
        }
    });    
	
	// Handle click event on "Save" button within a content block
	$('main').on('click', '.saveButton', function() {
		// Get the ID of the content block being edited
        let blockID = $(this).parent().parent().attr('id');

		// Get the Markdown content from the textarea
		let blockContent = $('#' + blockID + ' .editArea').val();

		// Convert the Markdown content to HTML using Showdown.js
        let htmlContent = convertToHtml(blockContent);

		// Replace the textarea with the new HTML content
		$('#' + blockID + ' .content').html(htmlContent);
        highlightCode($('#' + blockID + ' .content'))

		// Store the new HTML content as the original content of the content block
		$('#' + blockID).data('originalContent', blockContent);

		// Replace the "Save" and "Cancel" buttons with the "Edit" button in both the content block's "content" div and its parent div
		$('#' + blockID).find('.editDelete').show();
        $('#' + blockID).find('.addBlock').show();
		$('#' + blockID + ' .saveButton, #' + blockID + ' .cancelButton').remove();
    });

    // Handle click event on "Cancel" button within a content block
    $('main').on('click', '.cancelButton', function() {
        // Get the ID of the content block being edited
		let blockID = $(this).parent().parent().attr('id');

        // Get the original HTML content of the content block
        let blockContent = $('#' + blockID).data('originalContent') || '';		
        let htmlContent = convertToHtml(blockContent);

        // Replace the textarea with the original HTML content
        $('#' + blockID + ' .content').html(htmlContent);
        highlightCode($('#' + blockID + ' .content'))

        // Replace the "Save" and "Cancel" buttons with the "Edit" button in both the content block's "content" div and its parent div
        $('#' + blockID).find('.editDelete').show();
        $('#' + blockID).find('.addBlock').show();
        $('#' + blockID + ' .saveButton, #' + blockID + ' .cancelButton').remove();
    });

    // Handle click event on "+" button within a content block
    $('main').on('click', '.addBlock', function() {
        // Get the ID of the content block after which to insert the new block
        let blockID = $(this).parent().attr('id');

        // Create a new block HTML string
        newBlockID = 'contentBlock-' + Date.now();
        let newBlockHTML = createNewBlock(newBlockID);
        
        // Append the new content block to the main content area after the current block
        $('#' + blockID).after(newBlockHTML);
        
        // Trigger a click event on the "Edit" button of the new block
        $('#' + newBlockID + ' .editButton').click();        
    });    
});