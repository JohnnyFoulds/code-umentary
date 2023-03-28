$(document).ready(function() {
	// Generate a unique ID for each new content block
	let blockCount = 0;
	
	// Handle click event on "New Block" button
	$('#newBlockButton').click(function() {
		blockCount++;
		// Create a new content block with unique ID
		let blockID = 'block' + blockCount;
		// Append the new content block to the main content area
		$('main').append('<div class="contentBlock" id="' + blockID + '"><p>Block ' + blockCount + '</p><button class="editButton">Edit</button><div class="content"></div></div>');
	});
	
	// Handle click event on "Edit" button within a content block
	$('main').on('click', '.editButton', function() {
		// Get the ID of the content block being edited
		let blockID = $(this).parent().attr('id');
		// Get the original HTML content of the content block
		let blockContent = $('#' + blockID).data('originalContent') || $('#' + blockID + ' .content').html();
		// Replace the content block with a textarea containing the Markdown content
		$('#' + blockID + ' .content').html('<textarea class="editArea">' + blockContent + '</textarea><button class="saveButton">Save</button><button class="cancelButton">Cancel</button>');
		// Hide the "Edit" button in both the content block's "content" div and its parent div
		$('#' + blockID + ' .editButton').hide();
		$('#' + blockID).find('.editButton').hide();
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
		$('#' + blockID).data('originalContent', htmlContent);
		// Replace the "Save" and "Cancel" buttons with the "Edit" button in both the content block's "content" div and its parent div
		$('#' + blockID + ' .content').append('<button class="editButton">Edit</button>');
		$('#' + blockID).find('.editButton').show();
		$('#' + blockID + ' .saveButton, #' + blockID + ' .cancelButton').remove();
    });

    // Handle click event on "Cancel" button within a content block
    $('main').on('click', '.cancelButton', function() {
        // Get the ID of the content block being edited
        let blockID = $(this).parent().parent().attr('id');
        // Get the original HTML content of the content block
        let blockContent = $('#' + blockID).data('originalContent') || $('#' + blockID + ' .content').html();
        // Replace the textarea with the original HTML content
        $('#' + blockID + ' .content').html(blockContent);
        // Replace the "Save" and "Cancel" buttons with the "Edit" button in both the content block's "content" div and its parent div
        $('#' + blockID + ' .content').append('<button class="editButton">Edit</button>');
        $('#' + blockID).find('.editButton').show();
        $('#' + blockID + ' .saveButton, #' + blockID + ' .cancelButton').remove();
    });
});