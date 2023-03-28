$(document).ready(function() {
	// Generate a unique ID for each new content block
	let blockCount = 0;
	
    // Register click event for "New Block" button
    $('#newBlockButton').click(function() {
        // Generate unique ID for new content block
        let blockCount = $('.contentBlock').length + 1;
        let blockID = 'contentBlock' + blockCount;

        // Append the new content block to the main content area
        //$('main').append('<div class="contentBlock" id="' + blockID + '"><div class="blockHeader"><span>Block ' + blockCount + '</span><button class="editButton">Edit</button></div><div class="content"></div></div>');
        $('main').append('<div class="contentBlock" id="' + blockID + '"><div class="blockHeader"><span>Block ' + blockCount + '</span><button class="editButton">Edit</button><button class="deleteButton">Delete</button></div><div class="content"></div></div>');

    });
	
    // Handle click event on "Edit" button within a content block
    $('main').on('click', '.editButton', function() {
        // Get the ID of the content block being edited
        let blockID = $(this).parent().parent().attr('id');

        // Get the original HTML content of the content block
        let blockContent = $('#' + blockID).data('originalContent') || $('#' + blockID + ' .content').html();

        // Replace the content block with a textarea containing the Markdown content
        $('#' + blockID + ' .content').html('<textarea class="editArea">' + blockContent + '</textarea><button class="saveButton">Save</button><button class="cancelButton">Cancel</button>');

        // Hide the "Edit" button in both the content block's "content" div and its parent div
        $('#' + blockID + ' .editButton').hide();
        $('#' + blockID).find('.editButton').hide();
    });

    // Handle click event on "Delete" button within a content block
    $('main').on('click', '.deleteButton', function() {
        if (confirm("Are you sure you want to delete this block?")) {
        // Get the ID of the content block being deleted
        let blockID = $(this).parent().parent().attr('id');
    
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
		let converter = new showdown.Converter();
		let htmlContent = converter.makeHtml(blockContent);

		// Replace the textarea with the new HTML content
		$('#' + blockID + ' .content').html(htmlContent);

		// Store the new HTML content as the original content of the content block
		$('#' + blockID).data('originalContent', blockContent);

		// Replace the "Save" and "Cancel" buttons with the "Edit" button in both the content block's "content" div and its parent div
		$('#' + blockID).find('.editButton').show();
		$('#' + blockID + ' .saveButton, #' + blockID + ' .cancelButton').remove();
    });

    // Handle click event on "Cancel" button within a content block
    $('main').on('click', '.cancelButton', function() {
        // Get the ID of the content block being edited
		let blockID = $(this).parent().parent().attr('id');

        // Get the original HTML content of the content block
        let blockContent = $('#' + blockID).data('originalContent') || '';
		
        let converter = new showdown.Converter();
        let htmlContent = converter.makeHtml(blockContent);

        // Replace the textarea with the original HTML content
        $('#' + blockID + ' .content').html(htmlContent);

        // Replace the "Save" and "Cancel" buttons with the "Edit" button in both the content block's "content" div and its parent div
        $('#' + blockID).find('.editButton').show();
        $('#' + blockID + ' .saveButton, #' + blockID + ' .cancelButton').remove();
    });
});